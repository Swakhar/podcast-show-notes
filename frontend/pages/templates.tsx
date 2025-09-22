import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
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
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to save template", "error");
      }
    } catch (error) {
      logger.error("Error saving template:", error);
      showToast("Failed to save template", "error");
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
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const res = await fetch("/api/templates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        await fetchTemplates();
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to delete template", "error");
      }
    } catch (error) {
      logger.error("Error deleting template:", error);
      showToast("Failed to delete template", "error");
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
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Head><title>Templates - Sign in required</title></Head>
        <SiteHeader />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in required</h1>
          <p className="text-gray-600">Please sign in to manage your templates.</p>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <Head><title>Templates - AI Podcast Show Notes</title></Head>
      <SiteHeader />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Templates</h1>
            <p className="text-gray-600 mt-1">Create custom templates to personalize your AI-generated content</p>
          </div>
          <Link 
            href="/generate" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Generate
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Template" : "Create New Template"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="e.g., Formal Business Summary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type
                </label>
                <select
                  value={formData.kind}
                  onChange={(e) => setFormData({ ...formData, kind: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="summary">Summary</option>
                  <option value="show_notes">Show Notes</option>
                  <option value="social_snippets">Social Snippets</option>
                  <option value="seo">SEO</option>
                  <option value="newsletter">Newsletter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  System Prompt
                </label>
                <textarea
                  value={formData.system}
                  onChange={(e) => setFormData({ ...formData, system: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 h-24"
                  placeholder="You are a professional content writer who..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Define the AI's role and behavior
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Instructions
                </label>
                <textarea
                  value={formData.user}
                  onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 h-32"
                  placeholder="Create a professional summary with the following format..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Specific instructions for the content generation
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {editingId ? "Update Template" : "Create Template"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Templates List */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Your Templates</h2>
            
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No templates yet.</p>
                <p className="text-sm mt-1">Create your first template to get started!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-md p-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          {template.kind}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {template.system}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => handleEdit(template)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Delete
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
