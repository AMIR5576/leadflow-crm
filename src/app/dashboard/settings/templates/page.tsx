import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

export default async function TemplatesPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Message Templates</h1>
          <p className="text-sm text-gray-500">Create reusable WhatsApp, SMS and Email templates</p>
        </div>
        <button className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> New Template</button>
      </div>
      <div className="card p-4 bg-[#E0F7FA] border-[#00B4C8] border">
        <p className="text-sm font-semibold text-[#00B4C8] mb-2">📌 Personalization Tokens</p>
        <div className="flex flex-wrap gap-2">
          {["{{name}}", "{{agent_name}}", "{{company}}", "{{phone}}", "{{email}}"].map((t) => (
            <code key={t} className="bg-white px-2 py-1 rounded text-xs text-gray-700 border">{t}</code>
          ))}
        </div>
      </div>
      <div className="card p-16 text-center">
        <div className="text-4xl mb-3">💬</div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">No templates yet</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">Create message templates to send personalized WhatsApp messages with one tap.</p>
        <button className="btn-primary flex items-center gap-2 mx-auto"><Plus className="w-4 h-4" /> Create First Template</button>
      </div>
    </div>
  );
}
