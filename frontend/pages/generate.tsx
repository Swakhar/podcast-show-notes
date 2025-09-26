import { useState, useEffect, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Head from "next/head";
import Link from "next/link";
import useSWR from "swr";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import Skeleton from "../components/Skeleton";
import TemplatesDrawer from "../components/TemplatesDrawer";
import JobsStatus from '../components/JobsStatus';
import { StageTimeline } from "../components/StageTimeline";
import { toYouTubeChapters } from "../lib/chapters";
import { useToast } from "../contexts/ToastContext";

/* ---------- Small helpers ---------- */
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
  plan: "FREE" | "PRO" | "AGENCY";
  email: string;
  subscriptionStatus: string | null;
  monthlyMinutesLimit: number;
  monthlyMinutesUsed: number;
  stripeCustomerId: string | null;
  isTeamOwner?: boolean;
  isTeamMember?: boolean;
  ownedTeamsCount?: number;
  memberTeamsCount?: number;
}
interface Template {
  id: string;
  name: string;
  kind: string;
  system: string;
  user: string;
}

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
});

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

const SUPPORTED_FORMATS = [
  { ext: "mp3", icon: "🎵" },
  { ext: "wav", icon: "🔊" },
  { ext: "m4a", icon: "📱" },
  { ext: "mp4", icon: "📹" },
  { ext: "youtube", icon: "📺" },
  { ext: "spotify", icon: "🎧" }
];

export default function Generate() {
  const { data: session, status } = useSession();
  const { showToast } = useToast();
  
  const { data: meData, error: meError } = useSWR(
    status === "authenticated" ? "/api/me" : null,
    fetcher,
    { 
      refreshInterval: 30000,
      revalidateOnFocus: false 
    }
  );

  const me = meData?.user as Me | null;
  const hasAgencyAccess = me?.plan === "AGENCY" || me?.isTeamMember;
  const isOnlyTeamMember = me?.isTeamMember && !me?.isTeamOwner;

  const plan = me?.plan || "FREE";
  const active = me?.subscriptionStatus === "active";
  const isFree = plan === "FREE" && !hasAgencyAccess;
  const planLabel =
    me?.plan === "AGENCY" ? "Agency" :
    me?.plan === "PRO"    ? "Pro"    : "Free"

  // Inputs
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [previewMinutes, setPreviewMinutes] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usageBooked, setUsageBooked] = useState<{ [jobId: string]: boolean }>({});
  const [dragActive, setDragActive] = useState(false);

  // Feature selection
  const [features, setFeatures] = useState({
    summary: true,
    show_notes: true,
    timestamps: true,
    social_snippets: true,
    seo: true,
    newsletter: true,
  });

  // Templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);

  // Cover image (frontend only)
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  // Job state
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [language, setLanguage] = useState<"auto"|"en"|"de">("auto");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const isBusy = isSubmitting || (jobStatus && jobStatus.status !== "complete" && jobStatus.status !== "failed");
  const progress = (() => {
    if (isSubmitting) return 12;
    if (!jobStatus) return 0;
    const byStage = jobStatus.stage ? STAGE_PROGRESS[jobStatus.stage] : undefined;
    if (typeof byStage === "number") return byStage;
    return jobStatus.status === "processing" ? 50 : 0;
  })();

  const usagePercent = me ? Math.round((me.monthlyMinutesUsed / me.monthlyMinutesLimit) * 100) : 0;
  const isNearLimit = usagePercent > 80;

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('audio/') || droppedFile.type.startsWith('video/')) {
        setFile(droppedFile);
        setUrl("");
      }
    }
  };

  // fetch templates
  useEffect(() => {
    let cancel = false;
    async function fetchTemplates() {
      try {
        const r = await fetch("/api/templates");
        const j = await r.json();
        if (!cancel && j.list) setTemplates(j.list);
      } catch (e) {
      }
    }
    if (status === "authenticated") fetchTemplates();
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

  async function submitUrlJob(url: string, pm: number | "" , selected: string[], language: string, templateIds: string[]) {
    // Cache templates if any selected
    if (templateIds.length) {
      const selectedTemplates = templates.filter(t => templateIds.includes(t.id));
      await fetch(`${API_BASE_URL}/templates/cache`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedTemplates),
      });
    }

    const res = await fetch("/api/jobs/url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        url, 
        preview_minutes: pm || null, 
        features: selected.join(","), 
        language,
        template_ids: templateIds.join(",")
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `URL job failed (${res.status})`);
    if (!data?.id) throw new Error("Backend did not return a job id.");
    return data as JobStatus;
  }

  async function submitUploadJob(file: File, pm: number | "", selected: string[], language: string, templateIds: string[]) {
    // ✅ Keep existing template caching logic
    if (templateIds.length) {
      const selectedTemplates = templates.filter(t => templateIds.includes(t.id));
      await fetch(`${API_BASE_URL}/templates/cache`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedTemplates),
      });
    }

    // ✅ NEW: Upload directly to Railway backend instead of Vercel proxy
    const formData = new FormData();
    formData.append("file", file);
    if (pm) formData.append("preview_minutes", String(pm));
    formData.append("features", selected.join(","));
    formData.append("language", language);
    formData.append("template_ids", templateIds.join(","));
    
    // ✅ Add user email for notifications
    if (me?.email) {
      formData.append("user_email", me.email);
    }

    // ✅ Post directly to Railway backend
    const response = await fetch(`${API_BASE_URL}/jobs/upload`, {
      method: "POST",
      body: formData,
      // Don't set Content-Type - let browser set it with boundary
    });

    if (!response.ok) {
      let errorMessage = `Upload failed (${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.error || errorMessage;
      } catch {
        errorMessage = `Network error: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data?.id) {
      throw new Error("Backend did not return a job id.");
    }

    return data as JobStatus;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setJobStatus({ id: "pending", status: "pending", stage: "submitting…", result: {} });
    setJobId(null);
    setIsSubmitting(true);
    
    try {
      // ✅ Filter features based on user's plan and selections
      const allSelected = Object.entries(features).filter(([, v]) => v).map(([k]) => k);
      
      // ✅ Remove premium features for FREE users (unless they have team access)
      const selected = allSelected.filter(feature => {
        // If user has PRO/AGENCY plan or team access, allow all features
        if (!isFree || me?.isTeamMember) {
          return true;
        }
        
        // For FREE users, exclude premium features
        const premiumFeatures = ['seo', 'newsletter'];
        return !premiumFeatures.includes(feature);
      });
      
      let data: JobStatus;
      if (file) {
        data = await submitUploadJob(file, previewMinutes, selected, language, selectedTemplateIds);
      } else if (url) {
        data = await submitUrlJob(url, previewMinutes, selected, language, selectedTemplateIds);
      } else {
        throw new Error("Please upload a file or enter a URL.");
      }
      
      setJobId(data.id);
      setJobStatus({ 
        id: data.id, 
        status: data.status || "pending", 
        stage: data.stage, 
        billed_minutes: data.billed_minutes, 
        result: {} 
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create job");
      setIsSubmitting(false);
      setJobStatus(null);
    }
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
            // Refresh user data after usage update
            if (meData) {
              const updatedData = await fetcher("/api/me");
              if (updatedData?.user) {
                // SWR will automatically update
              }
            }
          } catch {}
        }
        if (d.status === "failed" && usageBooked[jobId] && typeof d.billed_minutes === "number") {
          try {
            await fetch("/api/usage/adjust", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ minutes: d.billed_minutes, op: "dec" }),
            });
            // Refresh user data after usage update
            if (meData) {
              const updatedData = await fetcher("/api/me");
              if (updatedData?.user) {
                // SWR will automatically update
              }
            }
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
  }, [jobId, usageBooked, meData]);

  useEffect(() => () => { if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl); }, [coverPreviewUrl]);

  const selectedFeatureCount = Object.values(features).filter(Boolean).length;

  return (
    <>
      <Head>
        <title>AI Content Generator – Professional Podcast Production | CastLumen</title>
        <meta name="description" content="Transform your podcast into professional content. Generate show notes, timestamps, SEO content, and social media snippets with enterprise-grade AI." />
      </Head>
      <SiteHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Jobs status at the top */}
        <JobsStatus />
        
        {/* Rest of your generate page content */}
        {/* Enhanced Hero Section */}
        <div className="bg-gradient-to-br from-white via-blue-50/30 to-green-50/30 border-b border-gray-200/60">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                AI-Powered Content Generation
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Transform Audio into <span className="text-[#9CEE69]">Professional Content</span>
              </h1>
              <p className="text-xl text-gray-600 mt-6 max-w-2xl mx-auto leading-relaxed">
                Upload your podcast or paste a URL. Our AI generates show notes, timestamps, SEO content, and social snippets – all optimized for maximum engagement.
              </p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center items-center gap-8 mt-8 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">95% faster workflow</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Enterprise-grade AI</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Multi-format output</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Progress Bar */}
          {isBusy && (
            <div className="h-2 w-full bg-gray-200 relative overflow-hidden">
              <div 
                className="h-2 bg-gradient-to-r from-[#9CEE69] to-green-400 transition-all duration-500 ease-out relative"
                style={{ width: `${Math.max(1, progress)}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              </div>
            </div>
          )}
        </div>

        <main className="max-w-7xl mx-auto px-4 py-10">
          {/* Professional Status Bar */}
          {me && !isOnlyTeamMember && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${active ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                    <span className="font-semibold text-gray-900">{planLabel} Plan</span>
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">{me.monthlyMinutesUsed}</span>
                    <span className="mx-1">/</span>
                    <span>{me.monthlyMinutesLimit === 999999 ? '∞' : me.monthlyMinutesLimit}</span>
                    <span className="ml-1 text-sm">minutes used</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Usage Progress */}
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isNearLimit ? 'bg-red-500' : usagePercent > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, usagePercent)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{usagePercent}%</span>
                  </div>
                  
                  {!active && (
                    <Link 
                      href="/#pricing" 
                      className="px-4 py-2 bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 rounded-lg font-medium hover:shadow-md transition-all text-sm"
                    >
                      Upgrade Plan
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-5 gap-10">
            {/* Enhanced Left Sidebar */}
            <section className="lg:col-span-2 space-y-6">
              {/* Input Section */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-green-50">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Content Input</h2>
                  <p className="text-sm text-gray-600">Upload audio or provide a URL to get started</p>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Enhanced File Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Audio File Upload</label>
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                        dragActive 
                          ? 'border-[#9CEE69] bg-green-50' 
                          : file 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {file ? (
                        <div className="space-y-3">
                          <div className="text-3xl">📁</div>
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {(file.size / (1024 * 1024)).toFixed(1)} MB
                            </p>
                          </div>
                          <button
                            onClick={() => setFile(null)}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-3xl">☁️</div>
                          <div>
                            <p className="font-medium text-gray-900">Drop your audio file here</p>
                            <p className="text-sm text-gray-500">or click to browse</p>
                          </div>
                          <input
                            type="file"
                            accept="audio/*,video/*"
                            onChange={handleFileChange}
                            disabled={isBusy}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Supported Formats */}
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">Supported formats:</p>
                      <div className="flex flex-wrap gap-2">
                        {SUPPORTED_FORMATS.map((format) => (
                          <span 
                            key={format.ext}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            <span>{format.icon}</span>
                            <span className="uppercase">{format.ext}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-gray-400 font-medium">OR</div>

                  {/* Enhanced URL Input */}
                  <div>
                    <label htmlFor="url" className="block text-sm font-semibold text-gray-700 mb-3">
                      Podcast URL
                    </label>
                    <div className="relative">
                      <input
                        id="url"
                        type="url"
                        placeholder="https://example.com/podcast.mp3 or YouTube URL"
                        value={url}
                        onChange={handleUrlChange}
                        disabled={isBusy}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-[#9CEE69] focus:border-[#9CEE69] transition-colors"
                      />
                      {url && (
                        <button
                          onClick={() => setUrl("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {url && /youtu\.be|youtube\.com/i.test(url) && previewMinutes === 2 && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">YouTube detected:</span> Using 2-minute preview for faster results
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Cover Upload */}
                  <div>
                    <label htmlFor="cover" className="block text-sm font-semibold text-gray-700 mb-3">
                      Episode Cover <span className="text-gray-500 font-normal">(optional)</span>
                    </label>
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <input
                          id="cover"
                          type="file"
                          accept="image/*"
                          onChange={handleCoverChange}
                          disabled={isBusy}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#9CEE69] focus:border-[#9CEE69]"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Added to downloaded files only (not uploaded to server)
                        </p>
                      </div>
                      {coverPreviewUrl && (
                        <div className="relative group">
                          <img
                            src={coverPreviewUrl}
                            alt="Cover preview"
                            className="w-16 h-16 rounded-lg border border-gray-200 object-cover"
                          />
                          <button
                            onClick={() => {
                              setCoverImage(null);
                              if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
                              setCoverPreviewUrl(null);
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Configuration Section */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Configuration</h2>
                  <p className="text-sm text-gray-600">Customize your content generation</p>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Preview Duration */}
                  <div>
                    <label htmlFor="preview" className="block text-sm font-semibold text-gray-700 mb-3">
                      Processing Duration
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        id="preview"
                        type="number"
                        min={1}
                        max={isFree ? 3 : 60}
                        step={1}
                        value={previewMinutes}
                        onChange={handlePreviewChange}
                        disabled={isBusy}
                        className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-[#9CEE69] focus:border-[#9CEE69]"
                        placeholder="Full"
                      />
                      <span className="text-sm text-gray-600">minutes</span>
                      {!previewMinutes && (
                        <span className="text-sm text-green-600 font-medium">Process entire file</span>
                      )}
                    </div>
                    {isFree && (
                      <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm text-orange-800">
                          <span className="font-medium">Free plan:</span> Maximum 3 minutes per job
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Language Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Output Language</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#9CEE69] focus:border-[#9CEE69]"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as any)}
                      disabled={isBusy}
                    >
                      <option value="auto">🌐 Auto-detect source language</option>
                      <option value="en">🇺🇸 English</option>
                      <option value="de">🇩🇪 Deutsch (German)</option>
                    </select>
                  </div>

                  {/* Feature Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-gray-700">Content to Generate</label>
                      <span className="text-xs text-gray-500">
                        {selectedFeatureCount} of {Object.keys(features).length} selected
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { key: "summary", label: "Summary", desc: "Key points and overview", icon: "📋", free: true },
                        { key: "show_notes", label: "Show Notes", desc: "Detailed episode notes", icon: "📝", free: true },
                        { key: "timestamps", label: "Timestamps", desc: "Chapter markers & timing", icon: "⏰", free: true },
                        { key: "social_snippets", label: "Social Snippets", desc: "Ready-to-post content", icon: "📱", free: true },
                        { key: "seo", label: "SEO Content", desc: "Titles & meta descriptions", icon: "🔍", free: false },
                        { key: "newsletter", label: "Newsletter", desc: "Email-ready content", icon: "📧", free: false },
                      ].map(({ key, label, desc, icon, free }) => {
                        const disabled = !free && isFree && !me?.isTeamMember;
                        const featureKey = key as keyof typeof features;
                        return (
                          <label
                            key={key}
                            className={`relative flex items-start gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                              disabled
                                ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50'
                                : features[featureKey]
                                ? 'border-[#9CEE69] bg-green-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={features[featureKey] && (free || !isFree || me?.isTeamMember)}
                              onChange={() => !disabled && toggleFeature(featureKey)}
                              disabled={disabled || (isBusy)}
                              className="mt-1 w-4 h-4 text-[#9CEE69] border-gray-300 rounded focus:ring-[#9CEE69]"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{icon}</span>
                                <span className="font-medium text-gray-900">{label}</span>
                                {!free && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                    Pro
                                  </span>
                                )}
                                {!free && me?.isTeamMember && (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                    Team Access
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{desc}</p>
                            </div>
                            {features[featureKey] && !disabled && (
                              <svg className="w-5 h-5 text-[#9CEE69] mt-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Template Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Custom Templates
                      {selectedTemplateIds.length > 0 && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({selectedTemplateIds.length} selected)
                        </span>
                      )}
                    </label>
                    <TemplatesDrawer 
                      onSelect={setSelectedTemplateIds} 
                      selectedIds={selectedTemplateIds}
                    />
                    {selectedTemplateIds.length > 0 && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">{selectedTemplateIds.length}</span> custom template
                          {selectedTemplateIds.length !== 1 ? 's' : ''} will be applied to enhance your content
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Error Display */}
                  {errorMessage && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-red-800">Generation Failed</p>
                          <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Submit Button */}
                  <div className="pt-4">
                    <button
                      onClick={handleSubmit}
                      disabled={isBusy || (!file && !url)}
                      className="w-full px-6 py-4 bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Starting Generation...
                        </span>
                      ) : isBusy ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Processing... {progress}%
                        </span>
                      ) : (
                        "🚀 Generate Content"
                      )}
                    </button>

                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Results appear progressively as they're generated
                    </p>
                  </div>

                  {/* Processing Status */}
                  {isBusy && jobStatus?.stage && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            {jobStatus.stage.charAt(0).toUpperCase() + jobStatus.stage.slice(1)}...
                          </p>
                          <div className="w-48 h-1.5 bg-blue-200 rounded-full mt-2 overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Enhanced Results Section */}
            <section className="lg:col-span-3 space-y-6">
              {!jobStatus?.result ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#9CEE69] to-green-400 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-10 h-10 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    
                    {isBusy ? (
                      <>
                        <StageTimeline stage={jobStatus?.stage} />
                        <div className="space-y-4 max-w-md mx-auto">
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                          <Skeleton className="h-4 w-4/6" />
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-2xl font-bold text-gray-900">Ready to Generate Content</h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                          Upload an audio file or paste a URL in the sidebar to start generating professional podcast content with AI.
                        </p>
                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                          <div className="p-4 bg-gray-50 rounded-lg text-center">
                            <div className="text-2xl mb-2">⚡</div>
                            <p className="text-sm font-medium text-gray-700">Lightning Fast</p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg text-center">
                            <div className="text-2xl mb-2">🎯</div>
                            <p className="text-sm font-medium text-gray-700">Highly Accurate</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Results Header */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Generated Content</h2>
                        <p className="text-gray-600 mt-1">Your AI-generated podcast content is ready</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-700">Complete</span>
                      </div>
                    </div>
                  </div>

                  {/* Results Grid */}
                  {jobStatus.result.summary && features.summary && (
                    <ProCard 
                      title="Summary" 
                      icon="📋" 
                      expanded={expandedCard === 'summary'}
                      onToggle={() => setExpandedCard(expandedCard === 'summary' ? null : 'summary')}
                    >
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">{jobStatus.result.summary}</p>
                    </ProCard>
                  )}

                  {jobStatus.result.show_notes && features.show_notes && (
                    <ProCard 
                      title="Show Notes" 
                      icon="📝"
                      expanded={expandedCard === 'show_notes'}
                      onToggle={() => setExpandedCard(expandedCard === 'show_notes' ? null : 'show_notes')}
                      actions={[
                        {
                          label: "Download Markdown",
                          icon: "📥",
                          onClick: () => {
                            const title = jobStatus.result?.seo?.title;
                            const md = mkShowNotesMarkdown(title, jobStatus.result!.show_notes!, coverPreviewUrl);
                            const base = title ? safeSlug(title) : "show-notes";
                            downloadTextAsFile(`${base}.md`, md);
                          }
                        }
                      ]}
                    >
                      <div className="prose prose-sm max-w-none">
                        <ul className="list-disc ml-6 space-y-2 text-gray-700">
                          {jobStatus.result.show_notes.split(/\r?\n/).filter(Boolean).map((line, i) => (
                            <li key={i} className="leading-relaxed">{line}</li>
                          ))}
                        </ul>
                      </div>
                    </ProCard>
                  )}

                  {jobStatus.result.timestamps && jobStatus.result.timestamps.length > 0 && features.timestamps && (
                    <ProCard 
                      title="Timestamps" 
                      icon="⏰"
                      expanded={expandedCard === 'timestamps'}
                      onToggle={() => setExpandedCard(expandedCard === 'timestamps' ? null : 'timestamps')}
                      actions={[
                        {
                          label: "Copy YouTube Chapters",
                          icon: "📺",
                          onClick: () => {
                            const txt = toYouTubeChapters(jobStatus.result!.timestamps!);
                            navigator.clipboard.writeText(txt);
                            showToast("YouTube chapters copied to clipboard!", "info", 3000);
                          }
                        }
                      ]}
                    >
                      <ul className="space-y-2">
                        {jobStatus.result.timestamps.map((t, i) => (
                          <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <span className="text-blue-600 font-mono text-sm mt-0.5">{i + 1}</span>
                            <span className="text-gray-700 leading-relaxed">{t}</span>
                          </li>
                        ))}
                      </ul>
                    </ProCard>
                  )}

                  {jobStatus.result.social_snippets && jobStatus.result.social_snippets.length > 0 && features.social_snippets && (
                    <ProCard 
                      title="Social Snippets" 
                      icon="📱"
                      expanded={expandedCard === 'social_snippets'}
                      onToggle={() => setExpandedCard(expandedCard === 'social_snippets' ? null : 'social_snippets')}
                    >
                      <div className="grid gap-4">
                        {jobStatus.result.social_snippets.map((snippet, i) => (
                          <div key={i} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                            <div className="flex items-start justify-between">
                              <p className="text-gray-700 leading-relaxed flex-1">{snippet}</p>
                              <button
                                onClick={() => navigator.clipboard.writeText(snippet)}
                                className="ml-3 p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                                title="Copy to clipboard"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ProCard>
                  )}

                  {jobStatus.result.seo && features.seo && (
                    <ProCard 
                      title="SEO Content" 
                      icon="🔍"
                      expanded={expandedCard === 'seo'}
                      onToggle={() => setExpandedCard(expandedCard === 'seo' ? null : 'seo')}
                    >
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <label className="block text-sm font-semibold text-green-800 mb-2">SEO Title</label>
                          <p className="text-gray-700 font-medium">{jobStatus.result.seo.title}</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <label className="block text-sm font-semibold text-blue-800 mb-2">Keywords</label>
                          <div className="flex flex-wrap gap-2">
                            {jobStatus.result.seo.keywords.split(',').map((keyword, i) => (
                              <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                {keyword.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </ProCard>
                  )}

                  {jobStatus.result.newsletter && features.newsletter && (
                    <ProCard 
                      title="Newsletter Draft" 
                      icon="📧"
                      expanded={expandedCard === 'newsletter'}
                      onToggle={() => setExpandedCard(expandedCard === 'newsletter' ? null : 'newsletter')}
                      actions={[
                        {
                          label: "Copy Markdown",
                          icon: "📋",
                          onClick: () => {
                            const n = jobStatus.result!.newsletter!;
                            navigator.clipboard.writeText(`# ${n.subject}\n\n${n.body_markdown}`);
                          }
                        },
                        {
                          label: "Download File",
                          icon: "📥",
                          onClick: () => {
                            const n = jobStatus.result!.newsletter!;
                            const md = mkNewsletterMarkdown(n.subject, n.body_markdown, coverPreviewUrl);
                            const base = n.subject ? safeSlug(n.subject) : "newsletter";
                            downloadTextAsFile(`${base}.md`, md);
                          }
                        },
                        {
                          label: "Publish to WordPress",
                          icon: "🌐",
                          onClick: async () => {
                            const newsletter = jobStatus.result!.newsletter!;
                            const title = newsletter.subject || "New Episode Highlights";
                            const md = mkNewsletterMarkdown(newsletter.subject, newsletter.body_markdown, coverPreviewUrl);
                            try {
                              const r = await fetch("/api/wp/publish", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ title, markdown: md, status: "draft" }),
                              });
                              const j = await r.json();
                              if (!r.ok) throw new Error(j.error || "Failed to publish");
                              if (j.demo) {
                                showToast(`📝 Demo published! ${j.message}`, "success");
                              } else {
                                showToast(`✅ Published to WordPress! View: ${j.link}`, "success");
                              }
                            } catch (error: any) {
                              showToast(`Publishing failed: ${error.message}`, "error", 5000);
                            }
                          }
                        }
                      ]}
                    >
                      <div className="space-y-4">
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <label className="block text-sm font-semibold text-purple-800 mb-2">Subject Line</label>
                          <p className="text-gray-700 font-medium">{jobStatus.result.newsletter.subject}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Content</label>
                          <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                            {jobStatus.result.newsletter.body_markdown}
                          </pre>
                        </div>
                      </div>
                    </ProCard>
                  )}

                  {jobStatus.result.transcript && (
                    <ProCard 
                      title="Full Transcript" 
                      icon="📄"
                      expanded={showTranscript}
                      onToggle={() => setShowTranscript(!showTranscript)}
                    >
                      <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                          {jobStatus.result.transcript}
                        </pre>
                      </div>
                    </ProCard>
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      <SiteFooter />
    </>
  );
}

/* ---------- Enhanced UI Components ---------- */
interface ProCardProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  expanded?: boolean;
  onToggle?: () => void;
  actions?: Array<{
    label: string;
    icon: string;
    onClick: () => void;
  }>;
}

function ProCard({ title, icon, children, expanded = true, onToggle, actions }: ProCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {actions && (
              <div className="flex gap-2">
                {actions.map((action, i) => (
                  <button
                    key={i}
                    onClick={action.onClick}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium"
                    title={action.label}
                  >
                    <span>{action.icon}</span>
                    <span className="hidden sm:inline">{action.label}</span>
                  </button>
                ))}
              </div>
            )}
            {onToggle && (
              <button
                onClick={onToggle}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <svg 
                  className={`w-5 h-5 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      {expanded && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
}
