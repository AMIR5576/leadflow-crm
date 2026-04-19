"use client";
// src/components/dashboard/ContentLibrary.tsx
import { useState, useRef } from "react";
import { Upload, FileText, Film, FolderOpen, Eye, Trash2, Copy, Check } from "lucide-react";

interface ContentFile {
  id: string; name: string; description?: string;
  fileUrl: string; fileType: string; fileSize: number;
  folder: string; trackingKey: string; totalViews: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ContentLibrary({ initialFiles = [] }: { initialFiles?: ContentFile[] }) {
  const [files, setFiles] = useState<ContentFile[]>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ name: "", description: "", folder: "General" });

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", form.name || file.name);
      fd.append("description", form.description);
      fd.append("folder", form.folder);
      const res = await fetch("/api/content/upload", { method: "POST", body: fd, credentials: "include" });
      const data = await res.json();
      if (!data.success) { setUploadError(data.error || "Upload failed"); return; }
      setFiles((f) => [data.data, ...f]);
      setShowModal(false);
      setForm({ name: "", description: "", folder: "General" });
    } catch {
      setUploadError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function copyLink(trackingKey: string, id: string) {
    navigator.clipboard.writeText(`${window.location.origin}/api/content/view/${trackingKey}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);
  }

  const FileTypeIcon = ({ type }: { type: string }) => {
    if (type === "video") return <Film className="w-8 h-8 text-purple-500" />;
    if (type === "image") return <FileText className="w-8 h-8 text-blue-500" />;
    return <FileText className="w-8 h-8 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Content Library</h1>
          <p className="text-sm text-gray-500">Upload and share brochures, PDFs, images with leads — track when they view</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Upload className="w-4 h-4" /> Upload File
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Files", value: files.length },
          { label: "Total Views", value: files.reduce((a, f) => a + f.totalViews, 0) },
          { label: "Storage Used", value: formatSize(files.reduce((a, f) => a + f.fileSize, 0)) },
        ].map((s) => (
          <div key={s.label} className="card p-5 text-center">
            <div className="text-2xl font-bold text-[#00B4C8]">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Upload File</h2>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer mb-4 transition-colors ${dragOver ? "border-[#00B4C8] bg-[#E0F7FA]" : "border-gray-300 hover:border-[#00B4C8]"}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleUpload(f); }}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Drop file here or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">PDF, Images, Videos — Max 10MB</p>
            </div>
            <input
              ref={fileRef} type="file" className="hidden"
              accept=".pdf,image/*,video/*"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
            />
            <div className="space-y-3">
              <div>
                <label className="label">File Name <span className="text-gray-400 font-normal">(optional)</span></label>
                <input className="input" placeholder="e.g. Property Brochure 2026" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Folder</label>
                <select className="input" value={form.folder} onChange={(e) => setForm(f => ({ ...f, folder: e.target.value }))}>
                  {["General", "Brochures", "Property Photos", "Insurance Plans", "Course Materials", "Proposals"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            {uploadError && (
              <div className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg p-3">{uploadError}</div>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowModal(false); setUploadError(""); }} className="btn-secondary flex-1">
                Cancel
              </button>
              {uploading && (
                <div className="flex-1 btn-primary text-center opacity-70 py-2">Uploading...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Files or Empty State */}
      {files.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[#E0F7FA] flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-[#00B4C8]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No content yet</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Upload PDFs, brochures and images. Share trackable links with leads and get notified when they open them.
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 mx-auto">
            <Upload className="w-4 h-4" /> Upload Your First File
          </button>
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg mx-auto text-left">
            {[
              { icon: "📄", title: "PDF Brochures", desc: "Share property brochures, insurance plans" },
              { icon: "🖼️", title: "Images", desc: "Property photos, product images" },
              { icon: "👁️", title: "Track Views", desc: "Get notified when a lead opens your file" },
            ].map((f) => (
              <div key={f.title} className="p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="text-sm font-semibold text-gray-800">{f.title}</div>
                <div className="text-xs text-gray-500 mt-1">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div key={file.id} className="card p-5 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <FileTypeIcon type={file.fileType} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{file.name}</div>
                  <div className="text-xs text-gray-400">{formatSize(file.fileSize)} • {file.folder}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> {file.totalViews} views
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyLink(file.trackingKey, file.id)}
                  className="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1"
                >
                  {copiedId === file.id
                    ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied!</>
                    : <><Copy className="w-3.5 h-3.5" /> Copy Link</>}
                </button>
                <a href={file.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500">
                  <Eye className="w-4 h-4" />
                </a>
                <button className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500">
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
