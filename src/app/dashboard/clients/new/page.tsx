"use client";
// src/app/dashboard/clients/new/page.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

const SOURCES = ["Facebook Ads", "Instagram Ads", "Google Ads", "TikTok Ads", "Website Form", "IndiaMART", "99acres", "MagicBricks", "Referral", "WhatsApp", "Manual", "Other"];
const STATUSES = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "INTERESTED", label: "Interested" },
  { value: "FOLLOW_UP", label: "Follow Up" },
];

export default function NewClientPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", phone: "", email: "", leadSource: "Manual",
    status: "NEW", notes: "", followUpAt: "", tags: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
          followUpAt: form.followUpAt || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        if (res.status === 409) {
          setError(`A client with this phone already exists. View them here: /dashboard/clients/${data.data?.existingId}`);
        } else {
          setError(data.error || "Failed to create client");
        }
        return;
      }
      router.push(`/dashboard/clients/${data.data.id}`);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/clients" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="page-title">Add New Client</h1>
      </div>

      <div className="card p-6">
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input className="input" placeholder="Amit Kumar" value={form.name} onChange={update("name")} required />
            </div>
            <div>
              <label className="label">Phone Number *</label>
              <input className="input" placeholder="+919800000000" value={form.phone} onChange={update("phone")} required />
            </div>
            <div>
              <label className="label">Email <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="email" className="input" placeholder="amit@email.com" value={form.email} onChange={update("email")} />
            </div>
            <div>
              <label className="label">Lead Source</label>
              <select className="input" value={form.leadSource} onChange={update("leadSource")}>
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={update("status")}>
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Follow-up Date <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="datetime-local" className="input" value={form.followUpAt} onChange={update("followUpAt")} />
            </div>
          </div>

          <div>
            <label className="label">Tags <span className="text-gray-400 font-normal">(comma separated)</span></label>
            <input className="input" placeholder="hot-lead, property-buyer, 2bhk" value={form.tags} onChange={update("tags")} />
          </div>

          <div>
            <label className="label">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              className="input min-h-[80px] resize-y"
              placeholder="Any notes about this lead..."
              value={form.notes}
              onChange={update("notes")}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Adding..." : "Add Client"}
            </button>
            <Link href="/dashboard/clients" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
