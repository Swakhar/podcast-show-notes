import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps } from 'next';
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { useToast } from "../contexts/ToastContext";
import { logger } from "../lib/logger";

interface Template {
  id: string;
  name: string;
  kind: string;
  system: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export default function Templates() {
  const { t } = useTranslation('common');
  const { data: session, status } = useSession();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    kind: "summary",
    system: "",
    user: "",
  });
  const { showToast } = useToast();

  // Fetch templates
  useEffect(() => {
    if (status === "authenticated") {
      fetchTemplates();
    }
  }, [status]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      setTemplates(data.list || []);
    } catch (error) {
      logger.error("Failed to fetch templates:", error);
      showToast(t('templates.toast.fetchFailed'), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId 
        ? { id: editingId, ...formData }
        : formData;

      const res = await fetch("/api/templates", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchTemplates();
        resetForm();
        showToast(t('templates.toast.saveSuccess'), "success");
      } else {
        const error = await res.json();
        showToast(error.error || t('templates.toast.saveFailed'), "error");
      }
    } catch (error) {
      logger.error("Error saving template:", error);
      showToast(t('templates.toast.saveFailed'), "error");
    }
  };

  const handleEdit = (template: Template) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      kind: template.kind,
      system: template.system,
      user: template.user,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('templates.confirmDelete'))) return;

    try {
      const res = await fetch("/api/templates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        await fetchTemplates();
        showToast(t('templates.toast.deleteSuccess'), "success");
      } else {
        const error = await res.json();
        showToast(error.error || t('templates.toast.deleteFailed'), "error");
      }
    } catch (error) {
      logger.error("Error deleting template:", error);
      showToast(t('templates.toast.deleteFailed'), "error");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      kind: "summary",
      system: "",
      user: "",
    });
  };

  if (status === "loading") {
    return <div>{t('templates.loading.general')}</div>;
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Head><title>{t('templates.signInRequired.title')}</title></Head>
        <SiteHeader />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('templates.signInRequired.heading')}</h1>
          <p className="text-gray-600">{t('templates.signInRequired.message')}</p>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{t('templates.title')}</title>
        <meta name="description" content={t('templates.metaDescription')} />
      </Head>
      <SiteHeader />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t('templates.header.title')}</h1>
            <p className="text-gray-600 mt-1">{t('templates.header.subtitle')}</p>
          </div>
          <Link 
            href="/generate" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('templates.header.backToGenerate')}
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? t('templates.form.edit.title') : t('templates.form.create.title')}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('templates.form.fields.templateName.label')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder={t('templates.form.fields.templateName.placeholder')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('templates.form.fields.contentType.label')}
                </label>
                <select
                  value={formData.kind}
                  onChange={(e) => setFormData({ ...formData, kind: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="summary">{t('templates.form.fields.contentType.options.summary')}</option>
                  <option value="show_notes">{t('templates.form.fields.contentType.options.showNotes')}</option>
                  <option value="social_snippets">{t('templates.form.fields.contentType.options.socialSnippets')}</option>
                  <option value="seo">{t('templates.form.fields.contentType.options.seo')}</option>
                  <option value="newsletter">{t('templates.form.fields.contentType.options.newsletter')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('templates.form.fields.systemPrompt.label')}
                </label>
                <textarea
                  value={formData.system}
                  onChange={(e) => setFormData({ ...formData, system: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                  placeholder={t('templates.form.fields.systemPrompt.placeholder')}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('templates.form.fields.systemPrompt.help')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('templates.form.fields.userInstructions.label')}
                </label>
                <textarea
                  value={formData.user}
                  onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                  placeholder={t('templates.form.fields.userInstructions.placeholder')}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('templates.form.fields.userInstructions.help')}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  {editingId ? t('templates.form.edit.submitButton') : t('templates.form.create.submitButton')}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors font-medium"
                  >
                    {t('templates.form.buttons.cancel')}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Templates List */}
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">{t('templates.list.title')}</h2>
            
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2">{t('templates.loading.templates')}</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="font-medium">{t('templates.list.empty.noTemplates')}</p>
                <p className="text-sm mt-1">{t('templates.list.empty.getStarted')}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-md p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mt-1">
                          {t(`templates.form.fields.contentType.options.${template.kind === 'show_notes' ? 'showNotes' : 
                             template.kind === 'social_snippets' ? 'socialSnippets' : template.kind}`)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {template.system}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => handleEdit(template)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors font-medium"
                        >
                          {t('templates.list.actions.edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors font-medium"
                        >
                          {t('templates.list.actions.delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

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
