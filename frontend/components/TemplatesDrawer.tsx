import { useState, useEffect } from "react";
import Link from "next/link";

export default function TemplatesDrawer({ onSelect }: { onSelect: (ids: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((j) => setTemplates(j.list || []));
  }, []);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      onSelect(next);
      return next;
    });
  }

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded-md border bg-white hover:bg-slate-50"
      >
        Templates
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/40 flex">
          <div className="ml-auto w-96 h-full bg-white shadow-xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Templates</h2>
              <Link
                href="/templates"
                className="text-sm text-blue-600 hover:underline"
                onClick={() => setOpen(false)}
              >
                Manage
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {templates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No templates yet</p>
                  <Link
                    href="/templates"
                    className="text-blue-600 hover:underline text-sm"
                    onClick={() => setOpen(false)}
                  >
                    Create your first template
                  </Link>
                </div>
              ) : (
                templates.map((t) => (
                  <label key={t.id} className="flex items-center gap-2 border p-2 rounded hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={selected.includes(t.id)}
                      onChange={() => toggle(t.id)}
                    />
                    <div>
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.kind}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
