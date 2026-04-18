import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { CheckCircle, Globe, Zap } from "lucide-react";
import WebhookCopyBox from "@/components/dashboard/WebhookCopyBox";

export default async function LeadSourcesPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://leadflow-crm-mu.vercel.app";
  const webhookUrl = `${appUrl}/api/webhook/${session.id}`;

  let sources: { id: string; name: string; isActive: boolean; leadCount: number }[] = [];
  try {
    sources = await prisma.leadSource.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    sources = [];
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="page-title">Lead Sources</h1>
        <p className="text-sm text-gray-500">Connect your lead sources to receive instant alerts</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-[#E0F7FA] flex items-center justify-center">
            <Globe className="w-5 h-5 text-[#00B4C8]" />
          </div>
          <div>
            <h2 className="section-title">Your Unique Webhook URL</h2>
            <p className="text-xs text-gray-500">Send leads to this URL from any platform</p>
          </div>
        </div>
        <WebhookCopyBox url={webhookUrl} />
        <div className="mt-4 text-sm text-gray-600">
          <p className="font-medium text-gray-700 mb-2">Works with:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {["WordPress","WPForms","Elementor Forms","Gravity Forms","Typeform","JotForm","Google Ads","Zapier","Facebook Ads"].map((p) => (
              <div key={p} className="flex items-center gap-1.5 text-xs text-gray-500">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                {p}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-700 mb-2">POST format:</p>
          <pre className="text-xs font-mono text-gray-600">{`{ "name": "Lead Name", "phone": "+919800000000", "email": "lead@email.com", "source": "Website" }`}</pre>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold">f</div>
            <div>
              <h2 className="section-title">Facebook & Instagram Lead Ads</h2>
              <p className="text-xs text-gray-500">Receive leads instantly from your Meta ad campaigns</p>
            </div>
          </div>
          <button className="btn-primary text-sm py-2">Connect Facebook</button>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
          Connect your Facebook Business account — new leads appear in your dashboard within seconds.
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="section-title">Zapier Integration</h2>
              <p className="text-xs text-gray-500">Connect 5,000+ apps using your webhook URL above</p>
            </div>
          </div>
          <a href="https://zapier.com" target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm py-2">Open Zapier</a>
        </div>
      </div>

      {sources.length > 0 && (
        <div className="card p-6">
          <h2 className="section-title mb-4">Connected Sources</h2>
          <div className="space-y-2">
            {sources.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm text-gray-800">{s.name}</div>
                  <div className="text-xs text-gray-400">{s.leadCount} leads received</div>
                </div>
                <span className={`badge ${s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {s.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
