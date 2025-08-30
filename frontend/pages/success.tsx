// pages/success.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function Success() {
  const router = useRouter();
  const { update } = useSession();
  const [msg, setMsg] = useState("Activating your subscription…");

  useEffect(() => {
    let mounted = true;

    async function run() {
      const sid = new URLSearchParams(window.location.search).get("session_id");
      if (!sid) {
        setMsg("Missing session id. Redirecting…");
        setTimeout(() => router.replace("/"), 1200);
        return;
      }

      // give Stripe a breath just in case
      await new Promise(r => setTimeout(r, 600));

      // confirm with our server (fallback to webhook)
      const r = await fetch("/api/stripe/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sid }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setMsg(j.error || "Activation failed. Redirecting…");
        setTimeout(() => router.replace("/"), 1500);
        return;
      }

      setMsg("Subscription active! Redirecting…");

      // refresh session payload -> brings plan/status into client
      try { await update(); } catch {}

      setTimeout(() => {
        if (mounted) router.replace("/?upgraded=1");
      }, 1200);
    }

    run();
    return () => { mounted = false; };
  }, [router, update]);

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold">🎉 You’re all set!</h1>
        <p className="text-slate-600 mt-2">{msg}</p>
        <button onClick={() => router.replace("/")} className="mt-6 rounded-md border px-4 py-2 hover:bg-slate-50">
          Go to app
        </button>
      </div>
    </div>
  );
}
