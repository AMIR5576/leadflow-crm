// src/app/dashboard/settings/lead-sources/page.tsx
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { generateWebhookUrl } from "@/lib/utils";
import { Copy, CheckCircle, Facebook, Globe, Zap } from "lucide-react";
import WebhookCopyBox from "@/components/dashboard/WebhookCopyBox";

export default async function LeadSourcesPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const webhookUrl = generateWebhookUrl(session.id);

  const sources = await prisma.leadSource.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="page-title">Lead Sources</h1>
        <p className="text-sm text-gray-500">Connect your lead sources to receive instant alerts</p>
      </div>

      {/* Webhook URL */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-[#E0F7FA] flex items-center justify-center">
            <Globe className="w-5 h-5 text-[#00B4C8]" />
          </div>
          <div>
            <h2 className="section-title">Universal Webhook URL</h2>
            <p className="text-xs text-gray-500">Use this URL to receive leads from any platform</p>
          </div>
        </div>

        <WebhookCopyBox url={webhookUrl} />

        <div className="mt-4 text-sm text-gray-600 space-y-1">
          <p className="font-medium text-gray-700">Supported platforms via webhook:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {[
              "WordPress (Contact Form 7)", "WPForms", "Elementor Forms",
              "Gravity Forms", "Ninja Forms", "Typeform",
              "JotForm", "Google Ads Lead Forms", "Zapier",
            ].map((p) => (
              <div key={p} className="flex items-center gap-1.5 text-xs text-gray-500">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                {p}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-xs font-mono text-gray-600">
          <div className="font-semibold text-gray-700 mb-1">POST format:</div>
          {`{
  "name": "Lead Name",
  "phone": "+919800000000",
  "email": "lead@email.com",
  "source": "Website Form",
  "notes": "Any additional info"
}`}
        </div>
      </div>

      {/* Facebook Lead Ads */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Facebook className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="section-title">Facebook & Instagram Lead Ads</h2>
              <p className="text-xs text-gray-500">Receive leads instantly from your Meta ad campaigns</p>
            </div>
          </div>
          <button className="btn-primary text-sm py-2 flex items-center gap-1.5">
            Connect Facebook
          </button>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
          <strong>How it works:</strong> Click &quot;Connect Facebook&quot;, log in with your Facebook Business account,
          select which ad account and lead forms to connect. New leads will appear in your dashboard within seconds.
        </div>
      </div>

      {/* Zapier */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="section-title">Zapier Integration</h2>
              <p className="text-xs text-gray-500">Connect 5,000+ apps via Zapier</p>
            </div>
          </div>
          <a
            href={`https://zapier.com/apps`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm py-2"
          >
            Open Zapier
          </a>
        </div>
        <p className="text-sm text-gray-600">
          Use the Webhook URL above in Zapier to connect TikTok Lead Ads, LinkedIn Lead Gen Forms,
          IndiaMART, 99acres, and hundreds of other platforms.
        </p>
      </div>

      {/* Connected sources */}
      {sources.length > 0 && (
        <div className="card p-6">
          <h2 className="section-title mb-4">Connected Sources</h2>
          <div className="space-y-2">
            {sources.map((s: { id: string; name: string; isActive: boolean; leadCount: number }) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm text-gray-800">{s.name}</div>
                  <div className="text-xs text-gray-400">{s.leadCount} leads received</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
