import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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

interface JobResult {
  id: string;
  status: string;
  result?: {
    transcript?: string;
    summary?: string;
    show_notes?: string;
    timestamps?: string[];
    social_snippets?: string[];
    seo?: {title?: string, description?: string, keywords?: string[]};
    newsletter?: string | {subject?: string, body_markdown?: string};
  };
  url?: string;
  stage?: string;
  error?: string;
}

export default function JobResults() {
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
      console.error('Failed to load job:', err);
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

  function toggleSection(sectionName: string) {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName);
      } else {
        newSet.add(sectionName);
      }
      return newSet;
    });
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

  function getSourceIcon(url?: string) {
    if (!url) return '📄';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return '📺';
    if (url.includes('spotify.com')) return '🎵';
    if (url.includes('apple.com')) return '🎧';
    return '🎙️';
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <EyeIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please sign in to view your generated content.</p>
          <button 
            onClick={() => router.push('/auth/signin')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <SiteHeader />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto mb-6"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-blue-400 mx-auto"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Content</h2>
            <p className="text-gray-600">Retrieving your generated podcast content...</p>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  if (error || !job) {
    return (
      <>
        <SiteHeader />
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'This content may have expired or does not exist.'}</p>
            <button 
              onClick={() => router.push('/generate')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Content
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
        <SiteHeader />
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
            <div className="relative mb-6">
              <div className="w-20 h-20 border-4 border-yellow-200 rounded-full animate-spin border-t-yellow-500 mx-auto"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Processing</h1>
            <p className="text-gray-600 mb-2">Stage: <span className="font-medium text-yellow-600">{job.stage || 'Processing'}</span></p>
            <p className="text-gray-500 text-sm mb-6">We'll send you an email when it's ready!</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={fetchJob}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
              <button 
                onClick={() => router.push('/generate')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Generate
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
        <SiteHeader />
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Processing Failed</h1>
            <p className="text-gray-600 mb-6">{job.error || 'Something went wrong during processing.'}</p>
            <button 
              onClick={() => router.push('/generate')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  const result = job.result;
  console.log('Job result:', result);
  if (!result) {
    return (
      <>
        <SiteHeader />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="w-8 h-8 text-gray-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">No Content Available</h1>
            <p className="text-gray-600 mb-6">The content may not have been generated yet.</p>
            <button 
              onClick={() => router.push('/generate')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Content
            </button>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{getSourceIcon(job.url)}</span>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                    Generated Content
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    Completed
                  </span>
                  {job.url && (
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
                  Back to Generate
                </button>
                <button 
                  onClick={() => copyToClipboard(JSON.stringify(result, null, 2), 'all')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  Copy All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Main Content - Left Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Summary */}
              {result.summary && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Summary</h2>
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
                            Copied!
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentIcon className="w-4 h-4" />
                            Copy
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
                        <h2 className="text-xl font-semibold text-gray-900">Show Notes</h2>
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
                            Copied!
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentIcon className="w-4 h-4" />
                            Copy
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
                        <h2 className="text-xl font-semibold text-gray-900">Newsletter Content</h2>
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
                            Copied!
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentIcon className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="space-y-4">
                      {typeof result.newsletter === 'object' && result.newsletter !== null && 'subject' in result.newsletter && (
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <label className="text-sm font-medium text-purple-800 block mb-1">Subject Line:</label>
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
            </div>

            {/* Sidebar - Right Column */}
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
                        <h2 className="text-lg font-semibold text-gray-900">Timestamps</h2>
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
                      <h2 className="text-lg font-semibold text-gray-900">Social Media</h2>
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
                      <h2 className="text-lg font-semibold text-gray-900">SEO Content</h2>
                    </div>
                    <div className="space-y-4">
                      {result.seo.title && (
                        <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-medium text-indigo-800">Title</label>
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
                            <label className="text-xs font-medium text-indigo-800">Description</label>
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
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
