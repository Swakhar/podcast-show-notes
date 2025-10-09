import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps } from 'next';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import { 
  DocumentTextIcon,
  ClipboardDocumentIcon,
  ClockIcon,
  ShareIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  CheckIcon,
  ArrowLeftIcon,
  EyeIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { logger } from '../../lib/logger';
import ContentRepurposingPanel from '../../components/ContentRepurposingPanel';
import RepurposedContentDisplay from '../../components/RepurposedContentDisplay';

interface JobResult {
  id: string;
  status: string;
  result?: {
    // Audio processing results
    transcript?: string;
    summary?: string;
    show_notes?: string;
    timestamps?: string[];
    social_snippets?: string[];
    seo?: {title?: string, description?: string, keywords?: string[]};
    newsletter?: string | {subject?: string, body_markdown?: string};
    
    // ✅ Guest research results
    guest_research?: string;
    interview_questions?: string;
    conversation_starters?: string;
    
    // ✅ Add repurposed content type
    repurposed_content?: {
      linkedin_carousel?: any;
      twitter_thread?: any;
      instagram_story?: any;
      tiktok_script?: any;
      blog_outline?: any;
      email_course?: any;
      infographic_data?: any;
    };
  };
  url?: string;
  stage?: string;
  error?: string;
  // ✅ Add type to distinguish between job types
  job_type?: 'audio' | 'guest_research' | 'podcast' | 'repurposing';
}

export default function JobResults() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { jobId } = router.query;
  const { data: session } = useSession();
  const [job, setJob] = useState<JobResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary']));

  useEffect(() => {
    if (jobId && session) {
      fetchJob();
    }
  }, [jobId, session]);

  async function fetchJob() {
    try {
      setLoading(true);
      const res = await fetch(`/api/jobs/${jobId}`);
      if (res.ok) {
        const jobData = await res.json();
        setJob(jobData);
      } else {
        setError('Job not found');
      }
    } catch (err) {
      logger.error('Failed to load job:', err);
      setError('Failed to load job');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string, sectionName: string) {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    setTimeout(() => setCopiedSection(null), 2000);
  }

  // Helper functions
  function renderContent(content: any): string {
    if (typeof content === 'string') {
      return content;
    }
    if (typeof content === 'object' && content !== null) {
      if (content.body_markdown) {
        return content.body_markdown;
      }
      return JSON.stringify(content, null, 2);
    }
    return String(content || '');
  }

  function getNewsletterCopyText(newsletter: any): string {
    if (typeof newsletter === 'string') {
      return newsletter;
    }
    if (typeof newsletter === 'object' && newsletter !== null) {
      if (newsletter.subject && newsletter.body_markdown) {
        return `Subject: ${newsletter.subject}\n\n${newsletter.body_markdown}`;
      }
      if (newsletter.body_markdown) {
        return newsletter.body_markdown;
      }
    }
    return String(newsletter || '');
  }

  function getSourceIcon(url?: string, jobType?: string) {
    // ✅ Check job type first
    if (jobType === 'guest_research') return '🔍';
    
    // Existing audio logic
    if (!url) return '📄';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return '📺';
    if (url.includes('spotify.com')) return '🎵';
    if (url.includes('apple.com')) return '🎧';
    return '🎙️';
  }

  if (!session) {
    return (
      <>
        <Head>
          <title>{t('jobResults.title')}</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <EyeIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('jobResults.authRequired.title')}</h1>
            <p className="text-gray-600 mb-4">{t('jobResults.authRequired.message')}</p>
            <button 
              onClick={() => router.push('/auth/signin')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('jobResults.authRequired.signInButton')}
            </button>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>{t('jobResults.title')}</title>
        </Head>
        <SiteHeader />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto mb-6"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-blue-400 mx-auto"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('jobResults.loading.title')}</h2>
            <p className="text-gray-600">{t('jobResults.loading.message')}</p>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  if (error || !job) {
    return (
      <>
        <Head>
          <title>{t('jobResults.title')}</title>
        </Head>
        <SiteHeader />
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('jobResults.notFound.title')}</h1>
            <p className="text-gray-600 mb-6">{error || t('jobResults.notFound.message')}</p>
            <button 
              onClick={() => router.push('/generate')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('jobResults.notFound.createButton')}
            </button>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  if (job.status === 'processing' || job.status === 'pending') {
    return (
      <>
        <Head>
          <title>{t('jobResults.title')}</title>
        </Head>
        <SiteHeader />
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
            <div className="relative mb-6">
              <div className="w-20 h-20 border-4 border-yellow-200 rounded-full animate-spin border-t-yellow-500 mx-auto"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('jobResults.processing.title')}</h1>
            <p className="text-gray-600 mb-2">
              {t('jobResults.processing.stage')} <span className="font-medium text-yellow-600">{job.stage || 'Processing'}</span>
            </p>
            <p className="text-gray-500 text-sm mb-6">{t('jobResults.processing.emailNotice')}</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={fetchJob}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('jobResults.processing.refreshButton')}
              </button>
              <button 
                onClick={() => router.push('/generate')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                {t('jobResults.processing.backButton')}
              </button>
            </div>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  if (job.status === 'failed') {
    return (
      <>
        <Head>
          <title>{t('jobResults.title')}</title>
        </Head>
        <SiteHeader />
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">{t('jobResults.failed.title')}</h1>
            <p className="text-gray-600 mb-6">{job.error || t('jobResults.failed.message')}</p>
            <button 
              onClick={() => router.push('/generate')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('jobResults.failed.tryAgainButton')}
            </button>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  const result = job.result;
  const hasContent = result && (
    // Audio content
    result.summary || result.show_notes || result.timestamps || result.social_snippets || result.seo || result.newsletter ||
    // ✅ Guest research content
    result.guest_research || result.interview_questions || result.conversation_starters
    // ✅ Repurposed content
    || (result.repurposed_content && Object.keys(result.repurposed_content).length > 0)
  );

  if (!hasContent) {
    return (
      <>
        <Head>
          <title>{t('jobResults.title')}</title>
        </Head>
        <SiteHeader />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="w-8 h-8 text-gray-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('jobResults.noContent.title')}</h1>
            <p className="text-gray-600 mb-6">{t('jobResults.noContent.message')}</p>
            <button 
              onClick={() => router.push('/generate')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('jobResults.noContent.createButton')}
            </button>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{job.job_type === 'guest_research' ? t('jobResults.guestResearchTitle') : t('jobResults.title')}</title>
        <meta name="description" content={t('jobResults.metaDescription')} />
      </Head>
      <SiteHeader />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{getSourceIcon(job.url, job.job_type)}</span>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                    {job.job_type === 'guest_research' 
                      ? t('jobResults.header.guestResearchResults') 
                      : t('jobResults.header.generatedContent')
                    }
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    {t('jobResults.header.completed')}
                  </span>
                  {job.job_type === 'guest_research' ? (
                    <span className="flex items-center gap-1">
                      <MagnifyingGlassIcon className="w-4 h-4" />
                      {t('jobResults.header.researchGenerated')}
                    </span>
                  ) : job.url && (
                    <span className="flex items-center gap-1 max-w-md truncate">
                      <ShareIcon className="w-4 h-4 flex-shrink-0" />
                      {job.url.length > 50 ? `${job.url.substring(0, 50)}...` : job.url}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => router.push('/generate')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  {t('jobResults.header.backToGenerate')}
                </button>
                <button 
                  onClick={() => copyToClipboard(JSON.stringify(result, null, 2), 'all')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  {t('jobResults.header.copyAll')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className={`grid gap-6 ${
            job.job_type === 'guest_research' 
              ? 'lg:grid-cols-1' // Single column for guest research
              : 'lg:grid-cols-3' // Three columns for audio content
          }`}>
            
            {/* Main Content */}
            <div className={`space-y-6 ${
              job.job_type === 'guest_research' 
                ? '' // Full width for guest research
                : 'lg:col-span-2' // 2/3 width for audio content
            }`}>
              
              {/* Summary */}
              {result.summary && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">{t('jobResults.sections.summary.title')}</h2>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(renderContent(result.summary), 'summary')}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-all ${
                          copiedSection === 'summary' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {copiedSection === 'summary' ? (
                          <>
                            <CheckIcon className="w-4 h-4" />
                            {t('jobResults.sections.summary.copied')}
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentIcon className="w-4 h-4" />
                            {t('jobResults.sections.summary.copy')}
                          </>
                        )}
                      </button>
                    </div>
                    <div className="prose max-w-none text-gray-700 leading-relaxed">
                      <p className="whitespace-pre-wrap">{renderContent(result.summary)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Show Notes */}
              {result.show_notes && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <ClipboardDocumentIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">{t('jobResults.sections.showNotes.title')}</h2>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(renderContent(result.show_notes), 'show_notes')}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-all ${
                          copiedSection === 'show_notes' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {copiedSection === 'show_notes' ? (
                          <>
                            <CheckIcon className="w-4 h-4" />
                            {t('jobResults.sections.showNotes.copied')}
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentIcon className="w-4 h-4" />
                            {t('jobResults.sections.showNotes.copy')}
                          </>
                        )}
                      </button>
                    </div>
                    <div className="prose max-w-none text-gray-700">
                      <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border">
                        {renderContent(result.show_notes)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Newsletter */}
              {result.newsletter && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <EnvelopeIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">{t('jobResults.sections.newsletter.title')}</h2>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(getNewsletterCopyText(result.newsletter), 'newsletter')}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-all ${
                          copiedSection === 'newsletter' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {copiedSection === 'newsletter' ? (
                          <>
                            <CheckIcon className="w-4 h-4" />
                            {t('jobResults.sections.newsletter.copied')}
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentIcon className="w-4 h-4" />
                            {t('jobResults.sections.newsletter.copy')}
                          </>
                        )}
                      </button>
                    </div>
                    <div className="space-y-4">
                      {typeof result.newsletter === 'object' && result.newsletter !== null && 'subject' in result.newsletter && (
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <label className="text-sm font-medium text-purple-800 block mb-1">
                            {t('jobResults.sections.newsletter.subjectLabel')}
                          </label>
                          <p className="text-purple-900 font-medium">{result.newsletter.subject}</p>
                        </div>
                      )}
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border text-gray-700">
                          {renderContent(result.newsletter)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Guest Research */}
              {result.guest_research && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <MagnifyingGlassIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">{t('jobResults.sections.guestResearch.title')}</h2>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(renderContent(result.guest_research), 'guest_research')}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-all ${
                          copiedSection === 'guest_research' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {copiedSection === 'guest_research' ? (
                          <>
                            <CheckIcon className="w-4 h-4" />
                            {t('jobResults.sections.guestResearch.copied')}
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentIcon className="w-4 h-4" />
                            {t('jobResults.sections.guestResearch.copy')}
                          </>
                        )}
                      </button>
                    </div>
                    <div className="prose max-w-none text-gray-700">
                      <div className="whitespace-pre-wrap bg-purple-50 p-4 rounded-lg border border-purple-200">
                        {renderContent(result.guest_research)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Interview Questions */}
              {result.interview_questions && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">{t('jobResults.sections.interviewQuestions.title')}</h2>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(renderContent(result.interview_questions), 'interview_questions')}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-all ${
                          copiedSection === 'interview_questions' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {copiedSection === 'interview_questions' ? (
                          <>
                            <CheckIcon className="w-4 h-4" />
                            {t('jobResults.sections.interviewQuestions.copied')}
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentIcon className="w-4 h-4" />
                            {t('jobResults.sections.interviewQuestions.copy')}
                          </>
                        )}
                      </button>
                    </div>
                    <div className="prose max-w-none text-gray-700">
                      <div className="whitespace-pre-wrap bg-blue-50 p-4 rounded-lg border border-blue-200">
                        {renderContent(result.interview_questions)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Conversation Starters */}
              {result.conversation_starters && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <ClipboardDocumentIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">{t('jobResults.sections.conversationStarters.title')}</h2>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(renderContent(result.conversation_starters), 'conversation_starters')}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-all ${
                          copiedSection === 'conversation_starters' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {copiedSection === 'conversation_starters' ? (
                          <>
                            <CheckIcon className="w-4 h-4" />
                            {t('jobResults.sections.conversationStarters.copied')}
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentIcon className="w-4 h-4" />
                            {t('jobResults.sections.conversationStarters.copy')}
                          </>
                        )}
                      </button>
                    </div>
                    <div className="prose max-w-none text-gray-700">
                      <div className="whitespace-pre-wrap bg-green-50 p-4 rounded-lg border border-green-200">
                        {renderContent(result.conversation_starters)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Repurposing Panel - Show for completed audio/podcast jobs that haven't been repurposed yet */}
              {(job.job_type === 'audio' || job.job_type === 'podcast' || !job.job_type) &&
               !job.result?.repurposed_content && (
                <ContentRepurposingPanel 
                  jobId={job.id} 
                  onRepurposeStart={(repurposingJobId) => {
                    // Redirect to the new repurposing job
                    router.push(`/results/${repurposingJobId}`);
                  }}
                />
              )}

              {/* Repurposed Content Display - Show when repurposed content exists */}
              {job.result?.repurposed_content && Object.keys(job.result.repurposed_content).length > 0 && (
                <RepurposedContentDisplay content={job.result.repurposed_content} />
              )}
            </div>

            {/* Sidebar - Only show for audio content */}
            {job.job_type !== 'guest_research' && (
              <div className="space-y-6">
                
                {/* Timestamps */}
                {result.timestamps && result.timestamps.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <ClockIcon className="w-5 h-5 text-orange-600" />
                          </div>
                          <h2 className="text-lg font-semibold text-gray-900">{t('jobResults.sections.timestamps.title')}</h2>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(result.timestamps!.join('\n'), 'timestamps')}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
                            copiedSection === 'timestamps' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {copiedSection === 'timestamps' ? (
                            <CheckIcon className="w-3 h-3" />
                          ) : (
                            <ClipboardDocumentIcon className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {result.timestamps.map((timestamp, index) => {
                          // Parse the timestamp string to extract time and text
                          const parts = timestamp.split(' - ');
                          const time = parts[0] || `${index + 1}`;
                          const text = parts.slice(1).join(' - ') || timestamp;
                          
                          return (
                            <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <span className="font-mono text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-medium min-w-[50px] text-center">
                                {time}
                              </span>
                              <span className="text-sm text-gray-700 flex-1">{text}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Social Snippets */}
                {result.social_snippets && result.social_snippets.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                          <ShareIcon className="w-5 h-5 text-pink-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">{t('jobResults.sections.socialMedia.title')}</h2>
                      </div>
                      <div className="space-y-3">
                        {result.social_snippets.map((snippet, index) => (
                          <div key={index} className="group p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm text-gray-700 flex-1">{renderContent(snippet)}</p>
                              <button 
                                onClick={() => copyToClipboard(renderContent(snippet), `social_${index}`)}
                                className={`flex-shrink-0 p-1 rounded transition-all ${
                                  copiedSection === `social_${index}` 
                                    ? 'bg-green-100 text-green-600' 
                                    : 'bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                }`}
                              >
                                {copiedSection === `social_${index}` ? (
                                  <CheckIcon className="w-4 h-4" />
                                ) : (
                                  <ClipboardDocumentIcon className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SEO Content */}
                {result.seo && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <MagnifyingGlassIcon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">{t('jobResults.sections.seoContent.title')}</h2>
                      </div>
                      <div className="space-y-4">
                        {result.seo.title && (
                          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-medium text-indigo-800">{t('jobResults.sections.seoContent.titleLabel')}</label>
                              <button 
                                onClick={() => copyToClipboard(renderContent(result.seo!.title), 'seo_title')}
                                className={`p-1 rounded transition-all ${
                                  copiedSection === 'seo_title' 
                                    ? 'bg-green-100 text-green-600' 
                                    : 'bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                }`}
                              >
                                {copiedSection === 'seo_title' ? (
                                  <CheckIcon className="w-3 h-3" />
                                ) : (
                                  <ClipboardDocumentIcon className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            <p className="text-sm text-indigo-900 font-medium">{renderContent(result.seo.title)}</p>
                          </div>
                        )}
                        {result.seo.description && (
                          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-medium text-indigo-800">{t('jobResults.sections.seoContent.descriptionLabel')}</label>
                              <button 
                                onClick={() => copyToClipboard(renderContent(result.seo!.description), 'seo_description')}
                                className={`p-1 rounded transition-all ${
                                  copiedSection === 'seo_description' 
                                    ? 'bg-green-100 text-green-600' 
                                    : 'bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                }`}
                              >
                                {copiedSection === 'seo_description' ? (
                                  <CheckIcon className="w-3 h-3" />
                                ) : (
                                  <ClipboardDocumentIcon className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            <p className="text-sm text-indigo-900">{renderContent(result.seo.description)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};
