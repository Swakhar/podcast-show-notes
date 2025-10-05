import { useState, useEffect, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Head from "next/head";
import Link from "next/link";
import useSWR from "swr";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps } from 'next';

import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import Skeleton from "../components/Skeleton";
import JobsStatus from '../components/JobsStatus';
import { StageTimeline } from "../components/StageTimeline";
import { toYouTubeChapters } from "../lib/chapters";
import { useToast } from "../contexts/ToastContext";
import GuestResearchForm from '../components/GuestResearchForm';
import AudioUploadForm from '../components/AudioUploadForm';

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
  guest_name?: string;
  guest_info?: string;
  guest_research?: string;
  interview_questions?: string;
  conversation_starters?: string;
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

export default function Generate() {
  const { data: session, status } = useSession();
  const { showToast } = useToast();
  const { t } = useTranslation('common');
  
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

  // New state for tab navigation
  const [activeTab, setActiveTab] = useState<'audio' | 'guest'>('audio');

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

  const toggleFeature = (key: keyof typeof features) => setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));

  async function submitGuestResearchJob(data: any) {
    // ✅ Authentication check
    if (!me?.email) {
      throw new Error("Sign in required");
    }

    // ✅ Business logic checks
    const features = data.features.join(",");
    
    // Gate paid features on FREE plan
    if (isFree && /\b(conversation_starters)\b/i.test(features)) {
      throw new Error("Feature requires upgrade.");
    }

    // ✅ Quota pre-check - guest research costs 1 minute
    const estimatedMinutes = 1;
    if (me.monthlyMinutesUsed + estimatedMinutes > me.monthlyMinutesLimit) {
      throw new Error("Quota exceeded. Please upgrade.");
    }

    // ✅ Template caching
    if (data.templateIds.length) {
      const selectedTemplates = templates.filter(t => data.templateIds.includes(t.id));
      await fetch(`${API_BASE_URL}/templates/cache`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedTemplates),
      });
    }

    // ✅ Prepare guest research request
    const formData = new FormData();
    formData.append("guest_name", data.guestName);
    formData.append("guest_info", data.guestInfo);
    formData.append("additional_context", data.additionalContext);
    formData.append("show_focus", data.showFocus);
    formData.append("features", features);
    formData.append("language", data.language);
    formData.append("template_ids", data.templateIds.join(","));
    formData.append("user_email", me.email);

    console.log("🔍 Direct guest research to backend:", {
      guestName: data.guestName,
      features: data.features,
      userEmail: me.email,
      backend: API_BASE_URL
    });

    // ✅ Submit directly to Railway backend
    const response = await fetch(`${API_BASE_URL}/jobs/guest-research`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Guest research failed (${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.error || errorMessage;
      } catch {
        errorMessage = `Network error: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    if (!result?.id) {
      throw new Error("Backend did not return a job id.");
    }

    console.log("✅ Guest research request successful:", result);
    return result as JobStatus;
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

  return (
    <>
      <Head>
        <title>{t('generate.title')} | CastLumen</title>
        <meta name="description" content={t('generate.metaDescription')} />
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
                {t('generate.hero.badge')}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                {t('generate.hero.title')}
              </h1>
              <p className="text-xl text-gray-600 mt-6 max-w-2xl mx-auto leading-relaxed">
                {t('generate.hero.subtitle')}
              </p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center items-center gap-8 mt-8 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{t('generate.hero.stats.workflow')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{t('generate.hero.stats.ai')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{t('generate.hero.stats.output')}</span>
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
                    <span className="font-semibold text-gray-900">{planLabel} {t('generate.status.plan')}</span>
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">{me.monthlyMinutesUsed}</span>
                    <span className="mx-1">/</span>
                    <span>{me.monthlyMinutesLimit === 999999 ? '∞' : me.monthlyMinutesLimit}</span>
                    <span className="ml-1 text-sm">{t('generate.status.minutesUsed')}</span>
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
                      {t('generate.status.upgrade')}
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
                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                  <nav className="flex">
                    <button
                      onClick={() => setActiveTab('audio')}
                      className={`px-6 py-4 text-sm font-semibold ${
                        activeTab === 'audio'
                          ? 'border-b-2 border-[#9CEE69] text-[#9CEE69] bg-green-50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {t('generate.tabs.audio')}
                    </button>
                    <button
                      onClick={() => setActiveTab('guest')}
                      className={`px-6 py-4 text-sm font-semibold ${
                        activeTab === 'guest'
                          ? 'border-b-2 border-purple-500 text-purple-600 bg-purple-50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {t('generate.tabs.guest')}
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'audio' ? (
                  <AudioUploadForm
                    isSubmitting={isSubmitting}
                    setIsSubmitting={setIsSubmitting}
                    templates={templates}
                    me={me}
                    file={file}
                    setFile={setFile}
                    url={url}
                    setUrl={setUrl}
                    previewMinutes={previewMinutes}
                    setPreviewMinutes={setPreviewMinutes}
                    language={language}
                    setLanguage={setLanguage}
                    features={features}
                    toggleFeature={toggleFeature}
                    selectedTemplateIds={selectedTemplateIds}
                    setSelectedTemplateIds={setSelectedTemplateIds}
                    coverImage={coverImage}
                    setCoverImage={setCoverImage}
                    coverPreviewUrl={coverPreviewUrl}
                    setCoverPreviewUrl={setCoverPreviewUrl}
                    errorMessage={errorMessage}
                    dragActive={dragActive}
                    setDragActive={setDragActive}
                    progress={progress}
                    jobStatus={jobStatus}
                    setJobId={setJobId}
                    setJobStatus={setJobStatus}
                    setErrorMessage={setErrorMessage}
                  />
                ) : (
                  <GuestResearchForm
                    onSubmit={async (data) => {
                      try {
                        setIsSubmitting(true);
                        const result = await submitGuestResearchJob(data);
                        setJobId(result.id);
                        setJobStatus({
                          id: result.id,
                          status: result.status || "pending",
                          stage: result.stage,
                          billed_minutes: result.billed_minutes,
                          result: {}
                        });
                      } catch (err: any) {
                        setErrorMessage(err.message || "Failed to create guest research job");
                        setIsSubmitting(false);
                      }
                    }}
                    isSubmitting={isSubmitting}
                    templates={templates}
                    me={me}
                  />
                )}
              </div>
            </section>

            {/* Enhanced Results Section */}
            <section className="lg:col-span-3 space-y-6">
              {!jobStatus?.result ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                  <div className="text-center space-y-6">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
                      activeTab === 'guest' 
                        ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
                        : 'bg-gradient-to-br from-[#9CEE69] to-green-400'
                    }`}>
                      {activeTab === 'guest' ? (
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      ) : (
                        <svg className="w-10 h-10 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                    </div>
                    
                    {isBusy ? (
                      <>
                        {/* Show stage timeline with current stage */}
                        <StageTimeline stage={jobStatus?.stage || "queued"} />
                        
                        {/* Show current stage text */}
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {jobStatus?.stage ? 
                              jobStatus.stage.charAt(0).toUpperCase() + jobStatus.stage.slice(1) : 
                              "Starting..."
                            }
                          </h3>
                          <p className="text-gray-600">
                            {progress}% {t('generate.processing.complete')} • {t('generate.processing.takesTime')}
                          </p>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="w-full max-w-md mx-auto">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                activeTab === 'guest' 
                                  ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                                  : 'bg-gradient-to-r from-[#9CEE69] to-green-400'
                              }`}
                              style={{ width: `${Math.max(5, progress)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="space-y-4 max-w-md mx-auto">
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                          <Skeleton className="h-4 w-4/6" />
                        </div>
                      </>
                    ) : activeTab === 'guest' ? (
                      <>
                        <h3 className="text-2xl font-bold text-gray-900">{t('generate.ready.guest.title')}</h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                          {t('generate.ready.guest.subtitle')}
                        </p>
                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                          <div className="p-4 bg-purple-50 rounded-lg text-center">
                            <div className="text-2xl mb-2">🔍</div>
                            <p className="text-sm font-medium text-gray-700">{t('generate.ready.guest.features.research')}</p>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-lg text-center">
                            <div className="text-2xl mb-2">❓</div>
                            <p className="text-sm font-medium text-gray-700">{t('generate.ready.guest.features.questions')}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-2xl font-bold text-gray-900">{t('generate.ready.audio.title')}</h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                          {t('generate.ready.audio.subtitle')}
                        </p>
                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                          <div className="p-4 bg-gray-50 rounded-lg text-center">
                            <div className="text-2xl mb-2">⚡</div>
                            <p className="text-sm font-medium text-gray-700">{t('generate.ready.audio.features.fast')}</p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg text-center">
                            <div className="text-2xl mb-2">🎯</div>
                            <p className="text-sm font-medium text-gray-700">{t('generate.ready.audio.features.accurate')}</p>
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
                        <h2 className="text-2xl font-bold text-gray-900">{t('generate.results.title')}</h2>
                        <p className="text-gray-600 mt-1">{t('generate.results.subtitle')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-700">{t('generate.results.complete')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Results Grid */}
                  {jobStatus.result.summary && features.summary && (
                    <ProCard 
                      title={t('generate.cards.summary')} 
                      icon="📋" 
                      expanded={expandedCard === 'summary'}
                      onToggle={() => setExpandedCard(expandedCard === 'summary' ? null : 'summary')}
                    >
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">{jobStatus.result.summary}</p>
                    </ProCard>
                  )}

                  {jobStatus.result.show_notes && features.show_notes && (
                    <ProCard 
                      title={t('generate.cards.showNotes')} 
                      icon="📝"
                      expanded={expandedCard === 'show_notes'}
                      onToggle={() => setExpandedCard(expandedCard === 'show_notes' ? null : 'show_notes')}
                      actions={[
                        {
                          label: t('generate.actions.downloadMarkdown'),
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
                      title={t('generate.cards.timestamps')} 
                      icon="⏰"
                      expanded={expandedCard === 'timestamps'}
                      onToggle={() => setExpandedCard(expandedCard === 'timestamps' ? null : 'timestamps')}
                      actions={[
                        {
                          label: t('generate.actions.copyYouTubeChapters'),
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
                      title={t('generate.cards.socialSnippets')} 
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
                      title={t('generate.cards.seo')} 
                      icon="🔍"
                      expanded={expandedCard === 'seo'}
                      onToggle={() => setExpandedCard(expandedCard === 'seo' ? null : 'seo')}
                    >
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <label className="block text-sm font-semibold text-green-800 mb-2">{t('generate.seo.title')}</label>
                          <p className="text-gray-700 font-medium">{jobStatus.result.seo.title}</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <label className="block text-sm font-semibold text-blue-800 mb-2">{t('generate.seo.keywords')}</label>
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
                      title={t('generate.cards.newsletter')} 
                      icon="📧"
                      expanded={expandedCard === 'newsletter'}
                      onToggle={() => setExpandedCard(expandedCard === 'newsletter' ? null : 'newsletter')}
                      actions={[
                        {
                          label: t('generate.actions.copyMarkdown'),
                          icon: "📋",
                          onClick: () => {
                            const n = jobStatus.result!.newsletter!;
                            navigator.clipboard.writeText(`# ${n.subject}\n\n${n.body_markdown}`);
                          }
                        },
                        {
                          label: t('generate.actions.downloadFile'),
                          icon: "📥",
                          onClick: () => {
                            const n = jobStatus.result!.newsletter!;
                            const md = mkNewsletterMarkdown(n.subject, n.body_markdown, coverPreviewUrl);
                            const base = n.subject ? safeSlug(n.subject) : "newsletter";
                            downloadTextAsFile(`${base}.md`, md);
                          }
                        },
                        {
                          label: t('generate.actions.publishWordPress'),
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
                                showToast(`${t('generate.messages.demoPublished')} ${j.message}`, "success");
                              } else {
                                showToast(`${t('generate.messages.publishedWordPress')} ${j.link}`, "success");
                              }
                            } catch (error: any) {
                              showToast(`${t('generate.messages.publishingFailed')} ${error.message}`, "error", 5000);
                            }
                          }
                        }
                      ]}
                    >
                      <div className="space-y-4">
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <label className="block text-sm font-semibold text-purple-800 mb-2">{t('generate.newsletter.subject')}</label>
                          <p className="text-gray-700 font-medium">{jobStatus.result.newsletter.subject}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">{t('generate.newsletter.content')}</label>
                          <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                            {jobStatus.result.newsletter.body_markdown}
                          </pre>
                        </div>
                      </div>
                    </ProCard>
                  )}

                  {jobStatus.result.transcript && (
                    <ProCard 
                      title={t('generate.cards.transcript')}
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

                  {/* New Guest Research Results */}
                  {jobStatus.result.guest_research && (
                    <ProCard 
                      title={t('generate.cards.guestResearch')}
                      icon="📊"
                      expanded={expandedCard === 'guest_research'}
                      onToggle={() => setExpandedCard(expandedCard === 'guest_research' ? null : 'guest_research')}
                      actions={[
                        {
                          label: t('generate.actions.downloadReport'),
                          icon: "📥",
                          onClick: () => {
                            const guestName = jobStatus.result?.guest_name || "guest";
                            const content = `# Guest Research: ${guestName}\n\n${jobStatus.result!.guest_research}`;
                            downloadTextAsFile(`${safeSlug(guestName)}-research.md`, content);
                          }
                        }
                      ]}
                    >
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                          {jobStatus.result.guest_research}
                        </pre>
                      </div>
                    </ProCard>
                  )}

                  {jobStatus.result.interview_questions && (
                    <ProCard 
                      title={t('generate.cards.interviewQuestions')}
                      icon="❓"
                      expanded={expandedCard === 'interview_questions'}
                      onToggle={() => setExpandedCard(expandedCard === 'interview_questions' ? null : 'interview_questions')}
                      actions={[
                        {
                          label: t('generate.actions.copyQuestions'),
                          icon: "📋",
                          onClick: () => {
                            navigator.clipboard.writeText(jobStatus.result!.interview_questions!);
                            showToast(t('generate.messages.questionsCopied'), "info", 3000);
                          }
                        }
                      ]}
                    >
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                          {jobStatus.result.interview_questions}
                        </pre>
                      </div>
                    </ProCard>
                  )}

                  {jobStatus.result.conversation_starters && (
                    <ProCard 
                      title={t('generate.cards.conversationStarters')} 
                      icon="💬"
                      expanded={expandedCard === 'conversation_starters'}
                      onToggle={() => setExpandedCard(expandedCard === 'conversation_starters' ? null : 'conversation_starters')}
                    >
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                          {jobStatus.result.conversation_starters}
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

/* ---------- i18n Support ---------- */
export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};
