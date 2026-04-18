"use client";
// src/app/auth/register/page.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", companyName: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Registration failed"); return; }
      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const pwStrength = form.password.length >= 12 ? "strong" : form.password.length >= 8 ? "good" : form.password.length > 0 ? "weak" : "";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#00B4C8] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">LeadFlow</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Free forever. No credit card required.</p>
        </div>

        <div className="card p-8">
          {/* Benefits */}
          <div className="bg-[#E0F7FA] rounded-lg p-4 mb-6 space-y-1.5">
            {["Unlimited lead alerts for free", "Connect Facebook & Google Ads", "WhatsApp one-tap outreach"].map((b) => (
              <div key={b} className="flex items-center gap-2 text-sm text-[#0096A8]">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {b}
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input type="text" className="input" placeholder="Rajesh Sharma" value={form.name} onChange={update("name")} required />
            </div>
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={update("email")} required />
            </div>
            <div>
              <label className="label">Company / Business name <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="text" className="input" placeholder="Sharma Realty" value={form.companyName} onChange={update("companyName")} />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="input pr-10"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={update("password")}
                  required
                  minLength={8}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pwStrength && (
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {["weak", "good", "strong"].map((s, i) => (
                      <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${
                        pwStrength === "weak" && i === 0 ? "bg-red-400" :
                        pwStrength === "good" && i <= 1 ? "bg-yellow-400" :
                        pwStrength === "strong" ? "bg-green-400" : "bg-gray-200"
                      }`} />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${pwStrength === "weak" ? "text-red-500" : pwStrength === "good" ? "text-yellow-600" : "text-green-600"}`}>
                    {pwStrength}
                  </span>
                </div>
              )}
            </div>
            <button type="submit" className="btn-primary w-full py-2.5 mt-2" disabled={loading}>
              {loading ? "Creating account..." : "Create Free Account"}
            </button>
          </form>

          <p className="mt-4 text-xs text-gray-400 text-center">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="underline">Terms</Link> and{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>

          <div className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#00B4C8] font-medium hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
