import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FileText, Upload, FolderOpen } from "lucide-react";

export default async function ContentPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Content Library</h1>
          <p className="text-sm text-gray-500">Upload and share brochures, PDFs, images with your leads</p>
        </div>
        <button className="btn-primary flex items-center gap-2"><Upload className="w-4 h-4" /> Upload File</button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[{ label: "Total Files", value: "0" }, { label: "Total Views", value: "0" }, { label: "Storage Used", value: "0 MB" }].map((s) => (
          <div key={s.label} className="card p-5 text-center">
            <div className="text-2xl font-bold text-[#00B4C8]">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="card p-16 text-center">
        <div className="w-16 h-16 rounded-full bg-[#E0F7FA] flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="w-8 h-8 text-[#00B4C8]" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">No content yet</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">Upload PDFs, brochures, images. Share them with leads and track when they view your content.</p>
        <button className="btn-primary flex items-center gap-2 mx-auto"><Upload className="w-4 h-4" /> Upload Your First File</button>
      </div>
    </div>
  );
}
