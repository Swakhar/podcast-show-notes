import { useState, ChangeEvent } from 'react';
import { useTranslation } from 'next-i18next';
import TemplatesDrawer from './TemplatesDrawer';

interface AudioUploadFormProps {
  templates: any[];
  me: any;
  file: File | null;
  setFile: (file: File | null) => void;
  url: string;
  setUrl: (url: string) => void;
  previewMinutes: number | "";
  setPreviewMinutes: (minutes: number | "") => void;
  language: "auto" | "en" | "de";
  setLanguage: (lang: "auto" | "en" | "de") => void;
  features: Record<string, boolean>;
  toggleFeature: (key: string) => void;
  selectedTemplateIds: string[];
  setSelectedTemplateIds: (ids: string[]) => void;
  coverImage: File | null;
  setCoverImage: (file: File | null) => void;
  coverPreviewUrl: string | null;
  setCoverPreviewUrl: (url: string | null) => void;
  errorMessage: string | null;
  dragActive: boolean;
  setDragActive: (active: boolean) => void;
  setJobId: (id: string | null) => void;
  setJobStatus: (status: any) => void;
  setErrorMessage: (error: string | null) => void;
  setIsSubmitting: (submitting: boolean) => void;
  isSubmitting: boolean;
  progress: number;
  jobStatus: any;
}

interface JobStatus {
  id: string;
  status: "pending" | "processing" | "complete" | "failed";
  stage?: string;
  error?: string;
  result?: any;
  billed_minutes?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const SUPPORTED_FORMATS = [
  { ext: "mp3", icon: "🎵" },
  { ext: "wav", icon: "🔊" },
  { ext: "m4a", icon: "📱" },
  { ext: "mp4", icon: "📹" },
  { ext: "youtube", icon: "📺" },
  { ext: "spotify", icon: "🎧" }
];

export default function AudioUploadForm({
  templates,
  me,
  file,
  setFile,
  url,
  setUrl,
  previewMinutes,
  setPreviewMinutes,
  language,
  setLanguage,
  features,
  toggleFeature,
  selectedTemplateIds,
  setSelectedTemplateIds,
  coverImage,
  setCoverImage,
  coverPreviewUrl,
  setCoverPreviewUrl,
  dragActive,
  setDragActive,
  setJobId,
  setJobStatus,
  setErrorMessage,
  setIsSubmitting,
  isSubmitting,
  progress,
  jobStatus
}: AudioUploadFormProps) {
  
  const { t } = useTranslation('common');
  const isFree = me?.plan === "FREE" && !me?.isTeamMember;
  const isBusy = isSubmitting || (jobStatus && jobStatus.status !== "complete" && jobStatus.status !== "failed");

  // ✅ Move submitUrlJob logic here
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

  // ✅ Move submitUploadJob logic here
  async function submitUploadJob(file: File, pm: number | "", selected: string[], language: string, templateIds: string[]) {
    // ✅ 1. Authentication check (moved from upload.ts)
    if (!me?.email) {
      throw new Error("Sign in required");
    }

    // ✅ 3. Business logic checks (moved from upload.ts)
    const features = selected.join(",");
    
    // Gate paid features on FREE plan
    if (isFree && /\b(seo|newsletter)\b/i.test(features)) {
      throw new Error("Feature requires upgrade.");
    }

    // Preview minutes with free cap
    const FREE_PREVIEW_CAP = 3;
    const reqPreview = Number(pm) || 0;
    const effectivePreview = reqPreview ? (isFree ? Math.min(reqPreview, FREE_PREVIEW_CAP) : reqPreview) : 0;

    // ✅ 4. File size validation
    const maxSize = 200 * 1024 * 1024; // 200MB
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    // ✅ 5. Quota pre-check (moved from upload.ts)
    // Estimate billed minutes conservatively
    const estimatedMinutes = effectivePreview || 2;
    if (me.monthlyMinutesUsed + estimatedMinutes > me.monthlyMinutesLimit) {
      throw new Error("Quota exceeded. Please upgrade.");
    }

    // ✅ 6. Keep existing template caching logic
    if (templateIds.length) {
      const selectedTemplates = templates.filter(t => templateIds.includes(t.id));
      await fetch(`${API_BASE_URL}/templates/cache`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedTemplates),
      });
    }

    // ✅ 7. Prepare upload with validated data
    const formData = new FormData();
    formData.append("file", file);
    if (effectivePreview) formData.append("preview_minutes", String(effectivePreview));
    formData.append("features", features);
    formData.append("language", language);
    formData.append("template_ids", templateIds.join(","));
    formData.append("user_email", me.email);

    // ✅ 8. Upload directly to Railway backend
    const response = await fetch(`${API_BASE_URL}/jobs/upload`, {
      method: "POST",
      body: formData,
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

  // ✅ Move handleSubmit logic here
  async function handleSubmit() {
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

  const selectedFeatureCount = Object.values(features).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-green-50">
        <h2 className="text-xl font-bold text-gray-900 mb-1">{t('audioUpload.title')}</h2>
        <p className="text-sm text-gray-600">{t('audioUpload.subtitle')}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Enhanced File Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">{t('audioUpload.fileUpload.label')}</label>
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
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  {t('audioUpload.fileUpload.removeFile')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-3xl">☁️</div>
                <div>
                  <p className="font-medium text-gray-900">{t('audioUpload.fileUpload.dropHere')}</p>
                  <p className="text-sm text-gray-500">{t('audioUpload.fileUpload.orClick')}</p>
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
            <p className="text-xs text-gray-500 mb-2">{t('audioUpload.fileUpload.supportedFormats')}</p>
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

        <div className="text-center text-gray-400 font-medium">{t('audioUpload.or')}</div>

        {/* Enhanced URL Input */}
        <div>
          <label htmlFor="url" className="block text-sm font-semibold text-gray-700 mb-3">
            {t('audioUpload.url.label')}
          </label>
          <div className="relative">
            <input
              id="url"
              type="url"
              placeholder={t('audioUpload.url.placeholder')}
              value={url}
              onChange={handleUrlChange}
              disabled={isBusy}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-[#9CEE69] focus:border-[#9CEE69] transition-colors"
            />
            {url && (
              <button
                type="button"
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
                <span className="font-medium">{t('audioUpload.url.youtubeDetected')}</span> {t('audioUpload.url.youtubePreview')}
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Cover Upload */}
        <div>
          <label htmlFor="cover" className="block text-sm font-semibold text-gray-700 mb-3">
            {t('audioUpload.cover.label')} <span className="text-gray-500 font-normal">{t('audioUpload.cover.optional')}</span>
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
                {t('audioUpload.cover.disclaimer')}
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
                  type="button"
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

        {/* Preview Duration */}
        <div>
          <label htmlFor="preview" className="block text-sm font-semibold text-gray-700 mb-3">
            {t('audioUpload.duration.label')}
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
            <span className="text-sm text-gray-600">{t('audioUpload.duration.minutes')}</span>
            {!previewMinutes && (
              <span className="text-sm text-green-600 font-medium">{t('audioUpload.duration.processEntire')}</span>
            )}
          </div>
          {isFree && (
            <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <span className="font-medium">{t('audioUpload.duration.freeLimit')}</span> {t('audioUpload.duration.maxMinutes')}
              </p>
            </div>
          )}
        </div>

        {/* Language Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">{t('audioUpload.language.label')}</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#9CEE69] focus:border-[#9CEE69]"
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            disabled={isBusy}
          >
            <option value="auto">{t('audioUpload.language.autoDetect')}</option>
            <option value="en">{t('audioUpload.language.english')}</option>
            <option value="de">{t('audioUpload.language.german')}</option>
          </select>
        </div>

        {/* Feature Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-700">{t('audioUpload.features.label')}</label>
            <span className="text-xs text-gray-500">
              {selectedFeatureCount} {t('audioUpload.features.of')} {Object.keys(features).length} {t('audioUpload.features.selected')}
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {[
              { key: "summary", icon: "📋", free: true },
              { key: "show_notes", icon: "📝", free: true },
              { key: "timestamps", icon: "⏰", free: true },
              { key: "social_snippets", icon: "📱", free: true },
              { key: "seo", icon: "🔍", free: false },
              { key: "newsletter", icon: "📧", free: false },
            ].map(({ key, icon, free }) => {
              const disabled = !free && isFree;
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
                    checked={features[featureKey] && (free || !isFree)}
                    onChange={() => !disabled && toggleFeature(featureKey)}
                    disabled={disabled || isBusy}
                    className="mt-1 w-4 h-4 text-[#9CEE69] border-gray-300 rounded focus:ring-[#9CEE69]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{icon}</span>
                      <span className="font-medium text-gray-900">{t(`audioUpload.features.${key}.label`)}</span>
                      {!free && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                          {t('audioUpload.features.pro')}
                        </span>
                      )}
                      {!free && me?.isTeamMember && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          {t('audioUpload.features.teamAccess')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{t(`audioUpload.features.${key}.desc`)}</p>
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
            {t('audioUpload.templates.label')}
            {selectedTemplateIds.length > 0 && (
              <span className="ml-2 text-xs text-gray-500">
                ({selectedTemplateIds.length} {t('audioUpload.templates.selected')})
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
                <span className="font-medium">{selectedTemplateIds.length}</span> {
                  selectedTemplateIds.length === 1 
                    ? t('audioUpload.templates.applied')
                    : t('audioUpload.templates.applied_plural')
                } {t('audioUpload.templates.willApply')}
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
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
                {t('audioUpload.submit.starting')}
              </span>
            ) : isBusy ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('audioUpload.submit.processing')} {progress}%
              </span>
            ) : (
              t('audioUpload.submit.generate')
            )}
          </button>

          <p className="text-xs text-gray-500 mt-3 text-center">
            {t('audioUpload.submit.disclaimer')}
          </p>
        </div>

        {/* Processing Status - keeping existing logic */}
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
  );
}
