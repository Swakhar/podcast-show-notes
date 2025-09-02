import Link from "next/link";
export default function SiteFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6 text-sm text-slate-600">
        <div>
          <div className="font-bold text-slate-900">CastLumen</div>
          <p className="mt-2">AI show notes, timestamps, SEO & snippets—faster than real time.</p>
        </div>
        <div className="space-y-2">
          <div className="font-semibold text-slate-900">Product</div>
          <div><Link href="/#features">Features</Link></div>
          <div><Link href="/#pricing">Pricing</Link></div>
          <div><Link href="/generate">Try the demo</Link></div>
        </div>
        <div className="space-y-2">
          <div className="font-semibold text-slate-900">Legal</div>
          <div><Link href="/impressum">Impressum</Link></div>
          <div><Link href="/privacy">Datenschutzerklärung</Link></div>
          <div><Link href="/terms">Terms</Link></div>
        </div>
      </div>
      <div className="text-center text-xs text-slate-500 pb-6">© {new Date().getFullYear()} CastLumen</div>
    </footer>
  );
}
