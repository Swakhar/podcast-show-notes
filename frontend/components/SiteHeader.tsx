import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SiteHeader() {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll(); window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`top-0 z-40 w-full sticky transition border-b ${scrolled ? "backdrop-blur bg-white/85" : "bg-white"}`}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="CastLumen home">
          <img src="/castlumen-wordmark.svg" alt="CastLumen" className="h-9 w-auto" />
        </Link>
        <nav className="hidden md:flex gap-6 text-sm text-slate-700">
          <Link href="/#features">Features</Link>
          <Link href="/#pricing">Pricing</Link>
          <Link href="/#demo">Demo</Link>
          <Link href="/impressum">Impressum</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/generate" className="hidden sm:inline px-4 py-2 rounded-md border hover:bg-slate-50">
            Try the demo
          </Link>
          {status === "authenticated" ? (
            <button onClick={() => signOut({ callbackUrl: "/" })} className="px-4 py-2 rounded-md bg-[#9CEE69] text-slate-900 font-semibold">
              Sign out
            </button>
          ) : (
            <Link href="/login" className="px-4 py-2 rounded-md bg-[#9CEE69] text-slate-900 font-semibold">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
