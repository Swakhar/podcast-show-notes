export default function SiteFooter() {
  return (
    <footer>
      <div className="bg-[#9CEE69] text-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
          <div>
            <div className="font-bold text-xl">CastLumen</div>
            <p className="mt-2 text-sm">AI show notes, timestamps, SEO & snippets.</p>
          </div>
          <div className="space-y-2">
            <div className="font-semibold">Product</div>
            <a href="/#features">Features</a><br/>
            <a href="/#pricing">Pricing</a><br/>
            <a href="/generate">Try the demo</a>
          </div>
          <div className="space-y-2">
            <div className="font-semibold">Legal</div>
            <a href="/impressum">Impressum</a><br/>
            <a href="/privacy">Datenschutzerklärung</a><br/>
            <a href="/terms">Terms</a>
          </div>
        </div>
      </div>
      <div className="bg-white text-center text-xs text-slate-500 py-4 border-t">
        © {new Date().getFullYear()} CastLumen
      </div>
    </footer>
  );
}
