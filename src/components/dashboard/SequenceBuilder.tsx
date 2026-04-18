"use client";
// src/components/dashboard/SequenceBuilder.tsx
import { useState } from "react";
import { Zap, Plus, Clock, MessageCircle, Phone, Mail, Trash2, Save, Star } from "lucide-react";

interface Step {
  order: number;
  channel: string;
  delayMinutes: number;
  customBody: string;
  stepName?: string;
}

interface Sequence {
  id: string;
  name: string;
  description?: string | null;
  isDefault: boolean;
  steps: Step[];
}

const CHANNEL_ICONS = {
  WHATSAPP: MessageCircle,
  SMS: Phone,
  EMAIL: Mail,
};

const CHANNEL_COLORS = {
  WHATSAPP: "text-green-600 bg-green-50",
  SMS: "text-blue-600 bg-blue-50",
  EMAIL: "text-purple-600 bg-purple-50",
};

function delayLabel(minutes: number): string {
  if (minutes === 0) return "Immediately";
  if (minutes < 60) return `After ${minutes} min`;
  if (minutes < 1440) return `After ${minutes / 60}h`;
  return `After ${minutes / 1440}d`;
}

export default function SequenceBuilder({ sequences }: { sequences: Sequence[] }) {
  const [aiForm, setAiForm] = useState({
    businessType: "",
    productOrService: "",
    tone: "friendly" as "professional" | "friendly" | "urgent",
    steps: 3,
  });
  const [generated, setGenerated] = useState<Sequence | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiError, setAiError] = useState("");

  async function handleGenerate() {
    setGenerating(true);
    setAiError("");
    try {
      const res = await fetch("/api/generate/sequence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiForm),
      });
      const data = await res.json();
      if (!data.success) { setAiError(data.error || "Generation failed"); return; }
      setGenerated({
        id: "preview",
        name: data.data.sequenceName,
        description: data.data.description,
        isDefault: false,
        steps: data.data.steps.map((s: Step & { templateBody: string }) => ({
          order: s.order,
          channel: s.channel,
          delayMinutes: s.delayMinutes,
          customBody: s.templateBody,
          stepName: s.stepName,
        })),
      });
    } catch {
      setAiError("Network error");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!generated) return;
    setSaving(true);
    try {
      const res = await fetch("/api/generate/sequence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...aiForm, save: true }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Generator */}
      <div className="card p-6 border-[#7B2FBE] border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#F3E8FF] flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#7B2FBE]" />
          </div>
          <div>
            <h2 className="section-title">AI Sequence Generator</h2>
            <p className="text-xs text-gray-500">Describe your business and AI will create a perfect follow-up sequence</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">Business Type</label>
            <input
              className="input"
              placeholder="e.g. Real Estate, Insurance, Coaching"
              value={aiForm.businessType}
              onChange={(e) => setAiForm((f) => ({ ...f, businessType: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Product / Service</label>
            <input
              className="input"
              placeholder="e.g. Residential Apartments, Term Insurance"
              value={aiForm.productOrService}
              onChange={(e) => setAiForm((f) => ({ ...f, productOrService: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Tone</label>
            <select
              className="input"
              value={aiForm.tone}
              onChange={(e) => setAiForm((f) => ({ ...f, tone: e.target.value as never }))}
            >
              <option value="friendly">Friendly & Warm</option>
              <option value="professional">Professional</option>
              <option value="urgent">Urgent & Direct</option>
            </select>
          </div>
          <div>
            <label className="label">Number of Steps</label>
            <select
              className="input"
              value={aiForm.steps}
              onChange={(e) => setAiForm((f) => ({ ...f, steps: parseInt(e.target.value) }))}
            >
              {[2, 3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n}>{n} steps</option>
              ))}
            </select>
          </div>
        </div>

        {aiError && (
          <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{aiError}</div>
        )}

        <button
          className="btn-primary flex items-center gap-2"
          onClick={handleGenerate}
          disabled={generating || !aiForm.businessType || !aiForm.productOrService}
        >
          <Zap className="w-4 h-4" />
          {generating ? "Generating..." : "Generate with AI"}
        </button>

        {/* Preview */}
        {generated && (
          <div className="mt-5 border border-[#7B2FBE]/20 rounded-xl p-4 bg-[#F3E8FF]/30">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-semibold text-gray-900">{generated.name}</div>
                <div className="text-xs text-gray-500">{generated.description}</div>
              </div>
              <button
                className="btn-primary text-sm flex items-center gap-1.5 py-1.5"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Sequence"}
              </button>
            </div>
            <div className="space-y-2">
              {generated.steps.map((step, i) => {
                const Icon = CHANNEL_ICONS[step.channel as keyof typeof CHANNEL_ICONS] || MessageCircle;
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${CHANNEL_COLORS[step.channel as keyof typeof CHANNEL_COLORS] || "text-gray-600 bg-gray-100"}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      {i < generated.steps.length - 1 && <div className="w-px bg-gray-200 flex-1 my-1 h-4" />}
                    </div>
                    <div className="pb-3 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-600">Step {step.order}</span>
                        <span className="badge bg-gray-100 text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {delayLabel(step.delayMinutes)}
                        </span>
                        <span className="badge bg-gray-100 text-gray-500">{step.channel}</span>
                      </div>
                      <div className="text-sm text-gray-700 bg-white rounded-lg px-3 py-2 border border-gray-100">
                        {step.customBody}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Saved sequences */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Your Sequences ({sequences.length})</h2>
          <button className="btn-secondary text-sm flex items-center gap-1.5 py-1.5">
            <Plus className="w-4 h-4" /> New Sequence
          </button>
        </div>

        {sequences.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-3">🤖</div>
            <div className="font-medium text-gray-700">No sequences yet</div>
            <div className="text-sm text-gray-400 mt-1">Use the AI generator above to create your first sequence</div>
          </div>
        ) : (
          <div className="space-y-3">
            {sequences.map((seq) => (
              <div key={seq.id} className="card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{seq.name}</span>
                      {seq.isDefault && (
                        <span className="badge bg-[#E0F7FA] text-[#00B4C8] flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" /> Default
                        </span>
                      )}
                    </div>
                    {seq.description && (
                      <div className="text-xs text-gray-500 mt-0.5">{seq.description}</div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">{seq.steps.length} steps</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn-secondary text-xs py-1 px-2">Edit</button>
                    <button className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Steps preview */}
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  {seq.steps.map((step, i) => {
                    const Icon = CHANNEL_ICONS[step.channel as keyof typeof CHANNEL_ICONS] || MessageCircle;
                    return (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${CHANNEL_COLORS[step.channel as keyof typeof CHANNEL_COLORS] || "text-gray-600 bg-gray-100"}`}>
                          <Icon className="w-3 h-3" />
                          {delayLabel(step.delayMinutes)}
                        </div>
                        {i < seq.steps.length - 1 && <span className="text-gray-300">→</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
