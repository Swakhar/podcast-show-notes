import { useState } from "react";
import { signIn } from "next-auth/react";
import ReCAPTCHA from "react-google-recaptcha";
const SITE_KEY = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY;

export default function Login() {
  const [mode, setMode] = useState<"login"|"register">("login");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, confirmPassword: confirm, captchaToken }),
    });
    setLoading(false);
    if (!res.ok) return alert((await res.json()).error || "Registration failed");

    const r = await signIn("credentials", { redirect: false, email, password });
    if (r?.error) return alert(r.error);
    window.location.href = "/";
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { redirect: false, email, password });
    setLoading(false);
    if (res?.error) return alert(res.error);
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-sm border rounded-xl p-6">
        <div className="flex gap-4 mb-4">
          <button className={`font-semibold ${mode==="login"?"":"opacity-60"}`} onClick={()=>setMode("login")}>Login</button>
          <button className={`font-semibold ${mode==="register"?"":"opacity-60"}`} onClick={()=>setMode("register")}>Register</button>
        </div>

        {mode === "register" ? (
          <form onSubmit={handleRegister} className="space-y-3">
            <input className="w-full border rounded p-2" placeholder="Full name" value={name} onChange={(e)=>setName(e.target.value)} required />
            <input className="w-full border rounded p-2" type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            <input className="w-full border rounded p-2" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
            <input className="w-full border rounded p-2" type="password" placeholder="Confirm password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} required />
            <ReCAPTCHA
              sitekey={SITE_KEY}
              onChange={setCaptchaToken}
              onExpired={() => setCaptchaToken(null)}
            />
            <button className="w-full rounded bg-[#9CEE69] py-2 font-semibold" disabled={loading}>{loading?"…":"Create account"}</button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3">
            <input className="w-full border rounded p-2" type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            <input className="w-full border rounded p-2" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
            <button className="w-full rounded bg-[#9CEE69] py-2 font-semibold" disabled={loading}>{loading?"…":"Sign in"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
