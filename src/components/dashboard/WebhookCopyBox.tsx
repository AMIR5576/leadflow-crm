"use client";
// src/components/dashboard/WebhookCopyBox.tsx
import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function WebhookCopyBox({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <code className="text-xs text-gray-700 flex-1 break-all">{url}</code>
      <button
        onClick={copy}
        className={`shrink-0 p-2 rounded-lg transition-colors ${copied ? "bg-green-100 text-green-600" : "bg-white border border-gray-200 text-gray-500 hover:text-gray-700"}`}
        title="Copy webhook URL"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
