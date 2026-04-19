"use client";
import { useState } from "react";
import { Plus, MessageCircle, Phone, Mail, Trash2, X } from "lucide-react";

interface Template {
  id: string; name: string; body: string;
  channel: string; category: string; isGlobal: boolean;
}

const CHANNELS = ["WHATSAPP", "SMS", "EMAIL"];
const CATEGORIES = ["INTRODUCTION", "FOLLOWUP", "REMINDER", "CLOSING", "AFTER_SALE"];
const CHANNEL_COLORS: Record<string, string> = {
  WHATSAPP: "bg-green-100 text-green-700",
  SMS: "bg-blue-100 text-blue-700",
  EMAIL: "bg-purple-100 text-purple-700",
};
const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  WHATSAPP: <MessageCircle className="w-4 h-4" />,
  SMS: <Phone className="w-4 h-4" />,
  EMAIL: <Mail className="w-4 h-4" />,
};
const TOKENS = ["{{name}}", "{{agent_name}}", "{{company}}", "{{phone}}", "{{email}}"];
const DEFAULT_FORM = { name: "", body: "", channel: "WHATSAPP", category: "INTRODUCTION", isGlobal: false };

interface Props {
  initialTemplates?: Template[];
  createTemplate: (formData: FormData) => Promise<{ error?: string; success?: boolean; data?: Template }>;
  deleteTemplate: (id: string) => Promise<{ error?: string; success?: boolean }>;
}

export default function TemplatesManager({ initialTemplates = [], createTemplate, deleteTemplate }: Props) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(DEFAULT_FORM);

  function insertToken(token: string) {
    setForm(f => ({ ...f, body: f.body + token }));
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Template name is required"); return; }
    if (!form.body.trim()) { setError("Message body is required"); return; }
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("body", form.body);
      fd.append("channel", form.channel);
      fd.append("category", form.category);
      fd.append("isGlobal", String(form.isGlobal));
      const result = await createTemplate(fd);
      if (result.error) { setError(result.error); return; }
      if (result.data) setTemplates(t => [result.data!, ...t]);
      setShowModal(false);
      setForm(DEFAULT_FORM);
    } catch { setError("Failed to save. Please try again."); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this template?")) return;
    const result = await deleteTemplate(id);
    if (result.error) { alert(result.error); return; }
    setTemplates(t => t.filter(x => x.id !== id));
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Message Templates</h1>
          <p className="text-sm text-gray-500">Create reusable WhatsApp, SMS and Email templates</p>
        </div>
        <button onClick={() => { setForm(DEFAULT_FORM); setError(""); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      <div className="card p-4 bg-[#E0F7FA] border-[#00B4C8] border">
        <p className="text-sm font-semibold text-[#00B4C8] mb-2">📌 Personalization Tokens — click to copy</p>
        <div className="flex flex-wrap gap-2">
          {TOKENS.map((t) => (
            <button key={t} onClick={() => navigator.clipboard.writeText(t)}
              className="bg-white px-2 py-1 rounded text-xs text-gray-700 border border-[#00B4C8]/30 hover:bg-[#E0F7FA]">
              {t}
            </button>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">New Template</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Template Name *</label>
                <input className="input" placeholder="e.g. New Lead Introduction"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Channel</label>
                  <select className="input" value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}>
                    {CHANNELS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c}>{c.replace("_", " ")}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label mb-0">Message Body *</label>
                  <div className="flex gap-1">
                    {TOKENS.slice(0, 3).map(t => (
                      <button key={t} onClick={() => insertToken(t)}
                        className="text-xs bg-[#E0F7FA] text-[#00B4C8] px-1.5 py-0.5 rounded hover:bg-[#00B4C8] hover:text-white">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea className="input min-h-[120px] resize-y"
                  placeholder="Hi {{name}}! 👋 Thanks for your enquiry."
                  value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
                <div className="text-xs text-gray-400 mt-1">{form.body.length} characters</div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="global" checked={form.isGlobal}
                  onChange={e => setForm(f => ({ ...f, isGlobal: e.target.checked }))} />
                <label htmlFor="global" className="text-sm text-gray-600">Make available to all team members</label>
              </div>
            </div>
            {error && <div className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</div>}
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? "Saving..." : "Save Template"}
              </button>
            </div>
          </div>
        </div>
      )}

      {templates.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-4xl mb-3">💬</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No templates yet</h2>
          <p className="text-sm text-gray-500 mb-6">Create message templates to send personalized WhatsApp messages with one tap.</p>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" /> Create First Template
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`flex items-center gap-1 badge ${CHANNEL_COLORS[t.channel]}`}>
                      {CHANNEL_ICONS[t.channel]} {t.channel}
                    </span>
                    <span className="font-semibold text-gray-900">{t.name}</span>
                    <span className="badge bg-gray-100 text-gray-500 text-xs">{t.category.replace("_", " ")}</span>
                    {t.isGlobal && <span className="badge bg-yellow-100 text-yellow-700">Global</span>}
                  </div>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{t.body}</p>
                </div>
                <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 ml-4 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
