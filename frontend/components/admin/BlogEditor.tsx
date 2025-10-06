import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface BlogPost {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  status: 'DRAFT' | 'PUBLISHED';
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

interface BlogEditorProps {
  post?: BlogPost;
  onSave: (post: BlogPost) => Promise<void>;
  loading?: boolean;
}

export default function BlogEditor({ post, onSave, loading }: BlogEditorProps) {
  const { t } = useTranslation('admin');
  const [formData, setFormData] = useState<BlogPost>({
    title: '',
    content: '',
    excerpt: '',
    status: 'DRAFT',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    ...post
  });

  const [activeTab, setActiveTab] = useState('content');

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'link', 'image', 'video', 'blockquote', 'code-block', 'align'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  // Add separate handlers for Save Draft and Publish
  const handleSaveDraft = async () => {
    const draftData = { ...formData, status: 'DRAFT' as const };
    setFormData(draftData);
    await onSave(draftData);
  };

  const handlePublish = async () => {
    const publishData = { ...formData, status: 'PUBLISHED' as const };
    setFormData(publishData);
    await onSave(publishData);
  };

  const generateExcerpt = (content: string) => {
    // Strip HTML and get first 160 characters
    const text = content.replace(/<[^>]*>/g, '');
    return text.length > 160 ? text.substring(0, 160) + '...' : text;
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content,
      excerpt: prev.excerpt || generateExcerpt(content)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {post?.id ? t('blog.editPost') : t('blog.newPost')}
          </h1>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading && formData.status === 'DRAFT' ? t('common.saving') : t('blog.saveDraft')}
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading && formData.status === 'PUBLISHED' ? t('common.saving') : t('blog.publish')}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {['content', 'seo'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t(`blog.tabs.${tab}`)}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('blog.fields.title')}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('blog.placeholders.title')}
                required
              />
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('blog.fields.content')}
              </label>
              <div className="bg-white border border-gray-300 rounded-lg">
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={handleContentChange}
                  modules={modules}
                  formats={formats}
                  style={{ minHeight: '300px' }}
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('blog.fields.excerpt')}
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('blog.placeholders.excerpt')}
              />
              <p className="text-sm text-gray-500 mt-1">
                {t('blog.hints.excerpt')}
              </p>
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('blog.seo.metaTitle')}
              </label>
              <input
                type="text"
                value={formData.meta_title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={formData.title}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('blog.seo.metaDescription')}
              </label>
              <textarea
                value={formData.meta_description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={formData.excerpt}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('blog.seo.keywords')}
              </label>
              <input
                type="text"
                value={formData.meta_keywords || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_keywords: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="keyword1, keyword2, keyword3"
              />
              <p className="text-sm text-gray-500 mt-1">
                {t('blog.hints.keywords')}
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
