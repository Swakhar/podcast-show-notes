import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import PlanBadge, { planLabel } from "./PlanBadge";

type Me = {
  plan: "FREE" | "STARTER" | "PRO" | "AGENCY";
  subscriptionStatus: string | null;
  monthlyMinutesLimit: number;
  monthlyMinutesUsed: number;
};

export default function SiteHeader() {
  const { status } = useSession(); // we only need to know if user is signed in
  const [me, setMe] = useState<Me | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const active = me?.subscriptionStatus === "active";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/me", { cache: "no-store" });
        const j = await r.json();
        setMe(j?.user ?? null);
      } catch {
        setMe(null);
      }
    })();
  }, [status]);

  return (
    <header className={`top-0 z-40 w-full sticky transition border-b ${scrolled ? "backdrop-blur bg-white/85" : "bg-white"}`}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="CastLumen home">
          <img src="/castlumen-wordmark.svg" alt="CastLumen" className="h-9 w-auto" />
        </Link>

        <nav className="hidden md:flex gap-6 text-sm text-slate-700">
          <Link href="/#features">Features</Link>
          <Link href="/#pricing">Pricing</Link>
          {status === "authenticated" ? (
            <>
              <Link href="/settings">Settings</Link>
              <Link href="/teams">Teams</Link>
            </>
          ) : (
            <>
              <Link href="/#demo">Demo</Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {me && (
            <>
              <PlanBadge plan={me.plan} />
              <span className="hidden sm:inline px-2 py-1 rounded-full text-xs bg-slate-50 text-slate-600 border">
                {me.monthlyMinutesUsed}/{me.monthlyMinutesLimit} min
              </span>
            </>
          )}

          {active ? (
            <>
              <Link
                href="/generate"
                className="hidden sm:inline px-4 py-2 rounded-md border hover:bg-slate-50"
              >
                Open generator
              </Link>
              <button
                onClick={async () => {
                  const r = await fetch("/api/stripe/create-portal-session", { method: "POST" });
                  const { url, error } = await r.json();
                  if (error) return alert(error);
                  window.location.href = url;
                }}
                className="px-4 py-2 rounded-md bg-white border hover:bg-slate-50"
              >
                Manage billing
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-4 py-2 rounded-md bg-[#9CEE69] text-slate-900 font-semibold"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/generate" className="hidden sm:inline px-4 py-2 rounded-md border hover:bg-slate-50">
                Try the demo
              </Link>
              {status === "authenticated" ? (
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-4 py-2 rounded-md bg-[#9CEE69] text-slate-900 font-semibold"
                >
                  Sign out
                </button>
              ) : (
                <Link href="/login" className="px-4 py-2 rounded-md bg-[#9CEE69] text-slate-900 font-semibold">
                  Sign in
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
