import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

export default async function CustomFieldsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Custom Client Fields</h1>
          <p className="text-sm text-gray-500">Add custom fields to capture extra information about your leads</p>
        </div>
        <button className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Field</button>
      </div>
      <div className="card p-4 border-orange-200 bg-orange-50">
        <p className="text-sm text-orange-700"><strong>FREE plan:</strong> Custom fields available on Starter plan and above.</p>
      </div>
      <div className="card p-6">
        <h2 className="section-title mb-4">Popular Custom Fields</h2>
        <div className="space-y-2">
          {[["Budget", "Number", "e.g. 5000000"],["Property Type", "Dropdown", "e.g. 2BHK / 3BHK"],["Location", "Text", "e.g. Andheri, Mumbai"],["Priority", "Dropdown", "e.g. High / Medium / Low"]].map(([name, type, ex]) => (
            <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div><span className="text-sm font-medium text-gray-800">{name}</span><span className="ml-2 text-xs text-gray-400">({type})</span></div>
              <span className="text-xs text-gray-400">{ex}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card p-6">
        <h2 className="section-title mb-4">Your Custom Fields (0)</h2>
        <div className="text-center py-8">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-sm text-gray-500">No custom fields yet.</p>
          <button className="btn-primary mt-4 text-sm">Upgrade to Add Fields</button>
        </div>
      </div>
    </div>
  );
}
