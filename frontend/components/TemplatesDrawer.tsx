import { useState, useEffect } from "react";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
  kind: string;
  system: string;
  user: string;
}

export default function TemplatesDrawer({ 
  onSelect, 
  selectedIds = [] 
}: { 
  onSelect: (ids: string[]) => void;
  selectedIds?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<string[]>(selectedIds);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelected(selectedIds);
  }, [selectedIds]);

  useEffect(() => {
    if (open && templates.length === 0) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/templates");
      const j = await r.json();
      setTemplates(j.list || []);
    } catch (e) {
      console.error("Failed to fetch templates:", e);
    } finally {
      setLoading(false);
    }
  };

  function toggle(id: string) {
    const next = selected.includes(id) 
      ? selected.filter((x) => x !== id) 
      : [...selected, id];
    setSelected(next);
    onSelect(next);
  }

  const templatesByKind = templates.reduce((acc, template) => {
    if (!acc[template.kind]) acc[template.kind] = [];
    acc[template.kind].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  const selectedCount = selected.length;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 transition-colors text-sm"
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Templates</span>
        {selectedCount > 0 && (
          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
            {selectedCount}
          </span>
        )}
      </button>

      {/* Drawer Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex">
          <div className="ml-auto w-full max-w-md h-full bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Custom Templates</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Select templates to customize your content generation
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-2 mt-4">
                <Link 
                  href="/templates" 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Manage Templates
                </Link>
                {selected.length > 0 && (
                  <button
                    onClick={() => {
                      setSelected([]);
                      onSelect([]);
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-white rounded-md transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading templates...</span>
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 font-medium mb-2">No templates yet</p>
                  <p className="text-sm text-gray-400 mb-4">Create custom templates to personalize your AI-generated content</p>
                  <Link 
                    href="/templates" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create your first template
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(templatesByKind).map(([kind, kindTemplates]) => (
                    <div key={kind}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                          {kind.replace('_', ' ')}
                        </h3>
                        <div className="flex-1 h-px bg-gray-200"></div>
                      </div>
                      
                      <div className="space-y-2">
                        {kindTemplates.map((template) => {
                          const isSelected = selected.includes(template.id);
                          return (
                            <label 
                              key={template.id} 
                              className={`block p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm ${
                                isSelected 
                                  ? "border-blue-500 bg-blue-50 shadow-sm" 
                                  : "border-gray-200 hover:border-gray-300 bg-white"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <input 
                                  type="checkbox" 
                                  checked={isSelected}
                                  onChange={() => toggle(template.id)}
                                  className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate">{template.name}</p>
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {template.system || template.user}
                                  </p>
                                </div>
                                {isSelected && (
                                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {selectedCount > 0 ? (
                    <span className="font-medium">{selectedCount} template{selectedCount !== 1 ? 's' : ''} selected</span>
                  ) : (
                    <span>No templates selected</span>
                  )}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Apply Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
