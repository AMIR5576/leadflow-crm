import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="page-title">Account & Billing</h1>
        <p className="text-sm text-gray-500">Manage your profile, plan and billing</p>
      </div>
      <div className="card p-6">
        <h2 className="section-title mb-4">Profile Information</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00B4C8] to-[#7B2FBE] flex items-center justify-center text-white text-2xl font-bold">
            {session.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-lg">{session.name}</div>
            <div className="text-gray-500 text-sm">{session.email}</div>
            {session.companyName && <div className="text-gray-400 text-xs">{session.companyName}</div>}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Full Name</label><input className="input" defaultValue={session.name || ""} /></div>
          <div><label className="label">Company</label><input className="input" defaultValue={session.companyName || ""} /></div>
          <div><label className="label">Email</label><input className="input bg-gray-50" defaultValue={session.email} disabled /></div>
          <div><label className="label">Plan</label><input className="input bg-gray-50" defaultValue={session.plan} disabled /></div>
        </div>
        <button className="btn-primary text-sm mt-4">Save Changes</button>
      </div>
      <div className="card p-6">
        <h2 className="section-title mb-2">Current Plan: {session.plan}</h2>
        <p className="text-sm text-gray-500 mb-4">{session.plan === "FREE" ? "You are on the free plan." : "Active subscription."}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[["Free","₹0"],["Starter","₹999/mo"],["Pro","₹2,499/mo"],["Team","₹5,999/mo"]].map(([name, price]) => (
            <div key={name} className={`p-4 rounded-xl border-2 text-center ${session.plan === name.toUpperCase() ? "border-[#00B4C8] bg-[#E0F7FA]" : "border-gray-200"}`}>
              <div className="font-bold text-sm">{name}</div>
              <div className="text-sm text-gray-600">{price}</div>
              {session.plan !== name.toUpperCase() && <button className="btn-primary w-full text-xs py-1 mt-2">Upgrade</button>}
              {session.plan === name.toUpperCase() && <div className="text-xs text-[#00B4C8] font-semibold mt-2">✓ Current</div>}
            </div>
          ))}
        </div>
      </div>
      <div className="card p-6">
        <h2 className="section-title mb-4">Change Password</h2>
        <div className="space-y-3">
          <div><label className="label">Current Password</label><input type="password" className="input" placeholder="••••••••" /></div>
          <div><label className="label">New Password</label><input type="password" className="input" placeholder="Min 8 characters" /></div>
          <button className="btn-secondary text-sm">Change Password</button>
        </div>
      </div>
    </div>
  );
}
