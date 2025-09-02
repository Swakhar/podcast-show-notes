import { useState, useEffect, ChangeEvent } from "react";
import { useSession, signOut } from "next-auth/react";
import axios from "axios";
import Head from "next/head";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

/* ---------- Small helpers (same as your current page) ---------- */
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

/* ---------- Types ---------- */
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
  billed_minutes?: number;
}
interface Me {
  plan: "FREE" | "STARTER" | "PRO" | "AGENCY";
  subscriptionStatus: string | null;
  monthlyMinutesLimit: number;
  monthlyMinutesUsed: number;
  stripeCustomerId: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
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

export default function Generate() {
  const { data: session, status } = useSession();
  const [me, setMe] = useState<Me | null>(null);
  const plan = (me?.plan as any) || ((session?.user as any)?.plan ?? "FREE");
  const active = (me?.subscriptionStatus === "active") || ((session?.user as any)?.subscriptionStatus === "active");
  const isFree = plan === "FREE";
  const planLabel =
    me?.plan === "AGENCY" ? "Agency" :
    me?.plan === "PRO"    ? "Pro"    :
    me?.plan === "STARTER"? "Starter": "Free";

  // Inputs
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [previewMinutes, setPreviewMinutes] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usageBooked, setUsageBooked] = useState<{ [jobId: string]: boolean }>({});

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

  const isBusy = isSubmitting || (jobStatus && jobStatus.status !== "complete" && jobStatus.status !== "failed");
  const progress = (() => {
    if (isSubmitting) return 12;
    if (!jobStatus) return 0;
    const byStage = jobStatus.stage ? STAGE_PROGRESS[jobStatus.stage] : undefined;
    if (typeof byStage === "number") return byStage;
    return jobStatus.status === "processing" ? 50 : 0;
  })();

  // membership
  useEffect(() => {
    let cancel = false;
    async function fetchMe() {
      const r = await fetch("/api/me", { cache: "no-store" });
      const j = await r.json();
      if (!cancel) setMe(j.user);
    }
    if (status === "authenticated") fetchMe(); else if (status === "unauthenticated") setMe(null);
    return () => { cancel = true; };
  }, [status]);

  // handlers
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
  const toggleFeature = (key: keyof typeof features) => setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));

  async function submitUrlJob(url: string, pm: number | "" , selected: string[]) {
    const res = await fetch("/api/jobs/url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, preview_minutes: pm || null, features: selected.join(",") }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `URL job failed (${res.status})`);
    if (!data?.id) throw new Error("Backend did not return a job id.");
    return data as JobStatus;
  }
  async function submitUploadJob(file: File, pm: number | "", selected: string[]) {
    const form = new FormData();
    form.append("file", file);
    if (pm) form.append("preview_minutes", String(pm));
    form.append("features", selected.join(","));
    const res = await fetch("/api/jobs/upload", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `Upload job failed (${res.status})`);
    if (!data?.id) throw new Error("Backend did not return a job id.");
    return data as JobStatus;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setJobStatus({ id: "pending", status: "pending", stage: "submitting…", result: {} });
    setJobId(null);
    setIsSubmitting(true);
    try {
      const selected = Object.entries(features).filter(([, v]) => v).map(([k]) => k);
      let data: JobStatus;
      if (file) data = await submitUploadJob(file, previewMinutes, selected);
      else if (url) data = await submitUrlJob(url, previewMinutes, selected);
      else throw new Error("Please upload a file or enter a URL.");
      setJobId(data.id);
      setJobStatus({ id: data.id, status: data.status || "pending", stage: data.stage, billed_minutes: data.billed_minutes, result: {} });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create job");
      setIsSubmitting(false);
      setJobStatus(null);
    }
  }

  async function handleSignOut() {
    setMe(null); setJobId(null); setJobStatus(null);
    await signOut({ callbackUrl: "/" });
  }

  // polling + usage booking/rollback
  useEffect(() => {
    if (!jobId) return;
    let first = true;
    const t = setInterval(async () => {
      try {
        const r = await axios.get<JobStatus>(`${API_BASE_URL}/jobs/${jobId}`);
        const d = r.data;
        setJobStatus(d);
        if (first) { first = false; setIsSubmitting(false); }

        const started = d.status === "processing" || d.stage === "transcribing" || d.stage === "fetching captions";
        if (started && !usageBooked[jobId] && typeof d.billed_minutes === "number") {
          try {
            await fetch("/api/usage/adjust", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ minutes: d.billed_minutes, op: "inc" }),
            });
            setUsageBooked((u) => ({ ...u, [jobId]: true }));
            const m = await fetch("/api/me", { cache: "no-store" }).then(x => x.json()).catch(() => null);
            if (m?.user) setMe(m.user);
          } catch {}
        }
        if (d.status === "failed" && usageBooked[jobId] && typeof d.billed_minutes === "number") {
          try {
            await fetch("/api/usage/adjust", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ minutes: d.billed_minutes, op: "dec" }),
            });
            const m = await fetch("/api/me", { cache: "no-store" }).then(x => x.json()).catch(() => null);
            if (m?.user) setMe(m.user);
          } catch {}
        }

        if (d.status === "complete" || d.status === "failed") clearInterval(t);
      } catch (err: any) {
        clearInterval(t);
        setIsSubmitting(false);
        setErrorMessage(err.message);
      }
    }, 1200);
    return () => clearInterval(t);
  }, [jobId, usageBooked]);

  useEffect(() => () => { if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl); }, [coverPreviewUrl]);

  return (
    <>
      <Head><title>Generate – AI Podcast Show Notes</title></Head>
      <SiteHeader />

      {/* Subtle hero strip */}
      <div className="bg-gradient-to-b from-white to-slate-50 border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Generate <span className="text-[#9CEE69]">Show Notes</span>, Timestamps & SEO
          </h1>
          <p className="text-slate-600 mt-2">Paste a link or upload audio. Choose what to generate. Get results progressively.</p>
        </div>
        {(isBusy) && (
          <div className="h-1 w-full bg-slate-200">
            <div className="h-1 bg-blue-600 transition-all" style={{ width: `${Math.max(1, progress)}%` }} />
          </div>
        )}
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        {/* Left column: Inputs */}
        <section className="lg:col-span-1">
          <div className="rounded-2xl border bg-white shadow-sm p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Upload an audio file or paste a podcast URL.</p>
              {me && (
                <span className="px-2 py-1 rounded-full text-xs bg-slate-50 text-slate-600 border">
                  {me.monthlyMinutesUsed}/{me.monthlyMinutesLimit} min
                </span>
              )}
            </div>

            {/* File */}
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700">Audio file</label>
              <input id="file" type="file" accept="audio/*" onChange={handleFileChange} disabled={isBusy} className="mt-1 w-full border rounded-md p-2" />
            </div>

            <div className="text-center text-gray-400">or</div>

            {/* URL */}
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">Podcast URL</label>
              <input id="url" type="url" placeholder="https://example.com/podcast.mp3" value={url} onChange={handleUrlChange} disabled={isBusy} className="mt-1 w-full border rounded-md p-2" />
              {url && /youtu\.be|youtube\.com/i.test(url) && previewMinutes === 2 && (
                <p className="text-xs text-blue-600 mt-1">Using 2-min preview for quick results. Change below if needed.</p>
              )}
            </div>

            {/* Cover */}
            <div>
              <label htmlFor="cover" className="block text-sm font-medium text-gray-700">Episode Cover (optional)</label>
              <input id="cover" type="file" accept="image/*" onChange={handleCoverChange} disabled={isBusy} className="mt-1 w-full border rounded-md p-2" />
              {coverPreviewUrl && <div className="mt-2"><img src={coverPreviewUrl} alt="Cover preview" className="h-32 rounded border" /></div>}
              <p className="text-xs text-gray-500 mt-1">Image stays on your device, only embedded into downloaded Markdown.</p>
            </div>

            {/* Preview minutes */}
            <div>
              <label htmlFor="preview" className="block text-sm font-medium text-gray-700">Quick preview (minutes)</label>
              <input id="preview" type="number" min={1} max={30} step={1} value={previewMinutes} onChange={handlePreviewChange} disabled={isBusy} className="mt-1 w-40 border rounded-md p-2" placeholder="e.g. 3" />
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
                  <label key={k} className={`flex items-center gap-2 p-2 rounded-md border hover:bg-slate-50 cursor-pointer transition ${features[k] ? "border-blue-400 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]" : "border-slate-200"}`}>
                    <input type="checkbox" checked={features[k]} onChange={() => toggleFeature(k)} />
                    <span>{label}</span>
                  </label>
                ))}
                <label className={`${isFree ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} flex items-center gap-2 p-2 rounded-md border hover:bg-slate-50 transition`}>
                  <input type="checkbox" checked={features.seo && !isFree} onChange={() => !isFree && toggleFeature("seo")} disabled={isFree} />
                  <span>SEO</span>
                </label>
                <label className={`${isFree ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} flex items-center gap-2 p-2 rounded-md border hover:bg-slate-50 transition`}>
                  <input type="checkbox" checked={features.newsletter && !isFree} onChange={() => !isFree && toggleFeature("newsletter")} disabled={isFree} />
                  <span>Newsletter</span>
                </label>
              </div>
            </div>

            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

            <button onClick={handleSubmit} disabled={isBusy} className="w-full px-4 py-2 bg-[#9CEE69] text-slate-900 rounded-md font-semibold hover:brightness-95 disabled:opacity-50">
              {isSubmitting ? "Starting…" : isBusy ? "Processing…" : "Generate"}
            </button>

            {(isBusy) && (
              <div className="text-sm text-blue-700">{jobStatus?.stage ? `Working: ${jobStatus.stage}…` : "Processing…"}</div>
            )}
            {jobStatus && jobStatus.status === "failed" && (
              <div className="text-sm text-red-600">Job failed: {jobStatus.error || "Unknown error"}</div>
            )}
          </div>
        </section>

        {/* Right column: Results */}
        <section className="lg:col-span-2 space-y-8">
          {!jobStatus?.result ? (
            <div className="rounded-2xl border bg-white shadow-sm p-8 text-gray-500 grid place-items-center">
              <div className="text-center">
                <div className="text-5xl mb-2">🎧</div>
                <p>Your results will appear here once processing starts.</p>
              </div>
            </div>
          ) : (
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
          )}
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

/* ---------- Small UI components ---------- */
function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden transition hover:shadow-md">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
