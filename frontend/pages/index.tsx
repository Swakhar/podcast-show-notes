import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import axios from "axios";

// ---------- Download helpers ----------
function downloadTextAsFile(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
function safeSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9-_]+/g, "-");
}
function mkShowNotesMarkdown(title: string | undefined, showNotes: string, coverImageUrl?: string | null) {
  const h = title ? `# ${title}\n\n` : "";
  const cover = coverImageUrl ? `![Cover Image](${coverImageUrl})\n\n` : "";
  return `${h}${cover}## Show Notes\n\n${showNotes}\n`;
}
function mkNewsletterMarkdown(subject: string, body: string, coverImageUrl?: string | null) {
  const cover = coverImageUrl ? `![Cover Image](${coverImageUrl})\n\n` : "";
  return `# ${subject}\n\n${cover}${body}\n`;
}

// ---------- Types ----------
interface JobResult {
  transcript?: string;
  summary?: string;
  show_notes?: string;
  timestamps?: string[];
  social_snippets?: string[];
  seo?: { title: string; keywords: string };
  newsletter?: { subject: string; body_markdown: string };
}
interface JobStatus {
  id: string;
  status: "pending" | "processing" | "complete" | "failed";
  stage?: string;
  error?: string;
  result?: JobResult;
}
interface Me {
  plan: "FREE" | "STARTER" | "PRO" | "AGENCY";
  subscriptionStatus: string | null;
  monthlyMinutesLimit: number;
  monthlyMinutesUsed: number;
  stripeCustomerId: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Map stages → progress %
const STAGE_PROGRESS: Record<string, number> = {
  queued: 5,
  "inspecting URL": 10,
  "fetching captions": 20,
  "downloading file": 20,
  "downloading audio": 30,
  "preparing preview": 35,
  transcribing: 50,
  "generating summary": 65,
  "generating show notes": 75,
  "generating timestamps": 80,
  "generating social snippets": 85,
  "generating SEO": 90,
  "generating newsletter": 95,
  finished: 100,
};

// ---------- Main ----------
export default function Home() {
  const { data: session, update } = useSession();

  // Canonical membership (from server)
  const [me, setMe] = useState<Me | null>(null);
  const plan = (me?.plan as any) || ((session?.user as any)?.plan ?? "FREE");
  const active = (me?.subscriptionStatus === "active") || ((session?.user as any)?.subscriptionStatus === "active");
  const isFree = plan === "FREE";

  // Inputs
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [previewMinutes, setPreviewMinutes] = useState<number | "">("");

  // Feature selection
  const [features, setFeatures] = useState({
    summary: true,
    show_notes: true,
    timestamps: true,
    social_snippets: true,
    seo: true,
    newsletter: true,
  });

  // Cover image (frontend only)
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  // Job state
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  // Estimator slide-over
  const [estOpen, setEstOpen] = useState(false);
  const [estMinutes, setEstMinutes] = useState<number | "">("");
  const [estInputTok, setEstInputTok] = useState<number>(3000);
  const [estOutputTok, setEstOutputTok] = useState<number>(1500);
  const [estIncludeTrans, setEstIncludeTrans] = useState<boolean>(true);
  const [estimate, setEstimate] = useState<{ transcription_usd: number; llm_usd: number; total_usd: number } | null>(null);

  const isBusy = jobStatus && jobStatus.status !== "complete" && jobStatus.status !== "failed";
  const progress = Math.max(0, Math.min(100, jobStatus?.stage ? STAGE_PROGRESS[jobStatus.stage] ?? (jobStatus.status === "processing" ? 50 : 0) : 0));

  // --- Fetch canonical membership ---
  useEffect(() => {
    let cancel = false;
    let tries = 0;

    async function fetchMe() {
      try {
        const r = await fetch("/api/me");
        const j = await r.json();
        if (!cancel) setMe(j.user);
        // if we just returned from success, poll a few times until active flips
        if (j.user && j.user.subscriptionStatus !== "active" && tries < 10 && window.location.search.includes("upgraded=1")) {
          tries++;
          setTimeout(fetchMe, 1500);
        }
      } catch {}
    }

    fetchMe();
    // optional: refresh JWT payload once when page opens (catches webhook updates)
    (async () => { try { await update(); } catch {} })();

    return () => { cancel = true; };
  }, [update]);

  // Handlers
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) setUrl("");
  };
  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setUrl(v);
    if (v) setFile(null);
    if (/youtu\.be|youtube\.com/i.test(v) && previewMinutes === "") setPreviewMinutes(2);
  };
  const handlePreviewChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value === "" ? "" : Number(e.target.value);
    setPreviewMinutes(isFree && typeof v === "number" && v > 3 ? 3 : v);
  };
  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setCoverImage(f);
    if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    setCoverPreviewUrl(f ? URL.createObjectURL(f) : null);
  };
  const toggleFeature = (key: keyof typeof features) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setJobStatus(null);
    setJobId(null);

    if (!file && !url) return setErrorMessage("Please upload an audio file or provide a podcast URL.");
    if (file && url) return setErrorMessage("Choose either a file OR a URL, not both.");

    try {
      const selected = Object.entries(features)
        .filter(([_, v]) => v)
        .map(([k]) => k);

      let response;
      if (file) {
        const form = new FormData();
        form.append("file", file);
        if (previewMinutes) form.append("preview_minutes", String(previewMinutes));
        form.append("features", selected.join(","));
        // If you added the Next.js proxy, send to /api/jobs/upload instead:
        response = await axios.post(`${API_BASE_URL}/jobs/upload`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        const form = new FormData();
        form.append("url", url);
        if (previewMinutes) form.append("preview_minutes", String(previewMinutes));
        form.append("features", selected.join(","));
        // If you added the Next.js proxy, send to /api/jobs/url instead:
        response = await axios.post(`${API_BASE_URL}/jobs/url`, form);
      }
      setJobId(response.data.id);
      setJobStatus(response.data);
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || "Failed to submit job";
      setErrorMessage(message);
    }
  }

  // Polling
  useEffect(() => {
    if (!jobId) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/jobs/${jobId}`);
        setJobStatus(res.data);
        if (res.data.status === "complete" || res.data.status === "failed") clearInterval(interval);
      } catch (err: any) {
        clearInterval(interval);
        setErrorMessage(err.message);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [jobId]);

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    };
  }, [coverPreviewUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">AI-Powered Podcast Show Notes Generator</h1>
          <div className="flex gap-2">
            {!session ? (
              <button onClick={() => signIn()} className="px-3 py-1.5 rounded-md border">Sign in</button>
            ) : (
              <>
                {!active && (
                  <a href="/pricing" className="px-3 py-1.5 rounded-md bg-[#9CEE69] text-slate-900 font-semibold shadow hover:brightness-95">
                    Upgrade
                  </a>
                )}
                {active && (
                  <button
                    onClick={async () => {
                      const r = await fetch("/api/stripe/create-portal-session", { method: "POST" });
                      const { url, error } = await r.json();
                      if (error) return alert(error);
                      window.location.href = url;
                    }}
                    className="px-3 py-1.5 rounded-md border bg-white hover:bg-slate-50"
                  >
                    Manage Billing
                  </button>
                )}
                <button onClick={() => signOut()} className="px-3 py-1.5 rounded-md border">Sign out</button>
              </>
            )}
          </div>
        </div>
        {(jobStatus && (jobStatus.status === "pending" || jobStatus.status === "processing")) && (
          <div className="h-1 w-full bg-slate-200">
            <div className="h-1 bg-blue-600 transition-all" style={{ width: `${Math.max(1, progress)}%` }} />
          </div>
        )}
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        {/* Left column: Inputs */}
        <section className="lg:col-span-1">
          <div className="rounded-2xl border bg-white shadow-sm p-4 space-y-4">
            <p className="text-sm text-gray-600">
              Upload an audio file or paste a podcast URL. Choose which outputs to generate.
            </p>

            {/* File */}
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700">Audio file</label>
              <input id="file" type="file" accept="audio/*" onChange={handleFileChange} disabled={!!isBusy} className="mt-1 w-full border rounded-md p-2" />
            </div>

            <div className="text-center text-gray-400">or</div>

            {/* URL */}
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">Podcast URL</label>
              <input id="url" type="url" placeholder="https://example.com/podcast.mp3" value={url} onChange={handleUrlChange} disabled={!!isBusy} className="mt-1 w-full border rounded-md p-2" />
              {url && /youtu\.be|youtube\.com/i.test(url) && previewMinutes === 2 && (
                <p className="text-xs text-blue-600 mt-1">Using 2-min preview for quick results. Change below if needed.</p>
              )}
            </div>

            {/* Cover */}
            <div>
              <label htmlFor="cover" className="block text-sm font-medium text-gray-700">Episode Cover (optional)</label>
              <input id="cover" type="file" accept="image/*" onChange={handleCoverChange} disabled={!!isBusy} className="mt-1 w-full border rounded-md p-2" />
              {coverPreviewUrl && <div className="mt-2"><img src={coverPreviewUrl} alt="Cover preview" className="h-32 rounded border" /></div>}
              <p className="text-xs text-gray-500 mt-1">Image stays on your device, only embedded into downloaded Markdown.</p>
            </div>

            {/* Preview minutes */}
            <div>
              <label htmlFor="preview" className="block text-sm font-medium text-gray-700">Quick preview (minutes)</label>
              <input id="preview" type="number" min={1} max={30} step={1} value={previewMinutes} onChange={handlePreviewChange} disabled={!!isBusy} className="mt-1 w-40 border rounded-md p-2" placeholder="e.g. 3" />
              {isFree && <p className="text-xs text-orange-600 mt-1">Free plan: max 3-min preview per job.</p>}
            </div>

            {/* Feature selection */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Generate</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {([
                  ["summary", "Summary"],
                  ["show_notes", "Show Notes"],
                  ["timestamps", "Timestamps"],
                  ["social_snippets", "Social snippets"],
                ] as const).map(([k, label]) => (
                  <label key={k} className={`flex items-center gap-2 p-2 rounded-md border hover:bg-slate-50 cursor-pointer ${features[k] ? "border-blue-400" : "border-slate-200"}`}>
                    <input type="checkbox" checked={features[k]} onChange={() => toggleFeature(k)} />
                    <span>{label}</span>
                  </label>
                ))}
                <label className={`${isFree ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} flex items-center gap-2 p-2 rounded-md border hover:bg-slate-50`}>
                  <input type="checkbox" checked={features.seo && !isFree} onChange={() => !isFree && toggleFeature("seo")} disabled={isFree} />
                  <span>SEO</span>
                </label>
                <label className={`${isFree ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} flex items-center gap-2 p-2 rounded-md border hover:bg-slate-50`}>
                  <input type="checkbox" checked={features.newsletter && !isFree} onChange={() => !isFree && toggleFeature("newsletter")} disabled={isFree} />
                  <span>Newsletter</span>
                </label>
              </div>
            </div>

            {/* Error */}
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

            {/* Submit */}
            <button onClick={handleSubmit} disabled={!!isBusy} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {isBusy ? "Processing…" : "Generate"}
            </button>

            {/* Live stage */}
            {(jobStatus && (jobStatus.status === "pending" || jobStatus.status === "processing")) && (
              <div className="text-sm text-blue-700">{jobStatus.stage ? `Working: ${jobStatus.stage}…` : "Processing…"}</div>
            )}
            {jobStatus && jobStatus.status === "failed" && (
              <div className="text-sm text-red-600">Job failed: {jobStatus.error || "Unknown error"}</div>
            )}
          </div>
        </section>

        {/* Right column: Results */}
        <section className="lg:col-span-2 space-y-8">
          {jobStatus && jobStatus.status === "complete" && jobStatus.result ? (
            <>
              {jobStatus.result.summary && features.summary && (
                <Card title="Summary">
                  <p className="text-gray-700 whitespace-pre-line">{jobStatus.result.summary}</p>
                </Card>
              )}

              {jobStatus.result.show_notes && features.show_notes && (
                <Card title="Show Notes" action={
                  <button
                    className="px-3 py-1 text-sm bg-slate-100 rounded hover:bg-slate-200"
                    onClick={() => {
                      const title = jobStatus.result?.seo?.title;
                      const md = mkShowNotesMarkdown(title, jobStatus.result!.show_notes!, coverPreviewUrl);
                      const base = title ? safeSlug(title) : "show-notes";
                      downloadTextAsFile(`${base}.md`, md);
                    }}
                  >
                    Download .md
                  </button>
                }>
                  <ul className="list-disc ml-6 space-y-1 text-gray-700">
                    {jobStatus.result.show_notes.split(/\r?\n/).filter(Boolean).map((line, i) => <li key={i}>{line}</li>)}
                  </ul>
                </Card>
              )}

              {jobStatus.result.timestamps && jobStatus.result.timestamps.length > 0 && features.timestamps && (
                <Card title="Timestamps">
                  <ul className="list-disc ml-6 space-y-1 text-gray-700">
                    {jobStatus.result.timestamps.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </Card>
              )}

              {jobStatus.result.social_snippets && jobStatus.result.social_snippets.length > 0 && features.social_snippets && (
                <Card title="Social Snippets">
                  <ul className="list-disc ml-6 space-y-1 text-gray-700">
                    {jobStatus.result.social_snippets.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </Card>
              )}

              {jobStatus.result.seo && features.seo && (
                <Card title="SEO">
                  <p className="text-gray-700"><strong>Title:</strong> {jobStatus.result.seo.title}</p>
                  <p className="text-gray-700"><strong>Keywords:</strong> {jobStatus.result.seo.keywords}</p>
                </Card>
              )}

              {jobStatus.result.newsletter && features.newsletter && (
                <Card title="Newsletter Draft" action={
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 text-sm bg-slate-100 rounded hover:bg-slate-200"
                      onClick={() => {
                        const n = jobStatus.result!.newsletter!;
                        navigator.clipboard.writeText(`# ${n.subject}\n\n${n.body_markdown}`);
                      }}
                    >
                      Copy Markdown
                    </button>
                    <button
                      className="px-3 py-1 text-sm bg-slate-100 rounded hover:bg-slate-200"
                      onClick={() => {
                        const n = jobStatus.result!.newsletter!;
                        const md = mkNewsletterMarkdown(n.subject, n.body_markdown, coverPreviewUrl);
                        const base = n.subject ? safeSlug(n.subject) : "newsletter";
                        downloadTextAsFile(`${base}.md`, md);
                      }}
                    >
                      Download .md
                    </button>
                  </div>
                }>
                  <p className="text-gray-700 mb-2"><strong>Subject:</strong> {jobStatus.result.newsletter.subject}</p>
                  <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded border border-gray-200">{jobStatus.result.newsletter.body_markdown}</pre>
                </Card>
              )}

              {jobStatus.result.transcript && (
                <Card title="Transcript">
                  <button className="text-blue-600 underline text-sm mb-2" onClick={() => setShowTranscript(!showTranscript)}>
                    {showTranscript ? "Hide transcript" : "Show transcript"}
                  </button>
                  {showTranscript && (
                    <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded border border-gray-200 max-h-96 overflow-auto">
                      {jobStatus.result.transcript}
                    </pre>
                  )}
                </Card>
              )}
            </>
          ) : (
            <div className="rounded-2xl border bg-white shadow-sm p-6 text-gray-500">
              Your results will appear here once processing completes.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// ---------- Small UI components ----------
function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
