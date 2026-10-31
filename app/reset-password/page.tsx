"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus("error");
      setMsg("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setStatus("error");
      setMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setMsg("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setStatus("error");
        setMsg(error.message || "Failed to update password.");
      } else {
        setStatus("success");
        setMsg("Password updated successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch {
      setStatus("error");
      setMsg("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-brand-grey hover:text-brand-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>

          <Link href="/" className="relative h-9 w-32">
            <Image
              src="/logos/community-va-logo.png"
              alt="COMMUNITY.VA Logo"
              fill
              className="object-contain"
            />
          </Link>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-brand-border shadow-md">
          <div className="mb-6">
            <span className="text-[11px] font-mono font-bold tracking-widest text-brand-blue uppercase">
              Set New Password
            </span>
            <h1 className="font-display text-2xl font-extrabold text-brand-dark uppercase tracking-tight mt-1">
              Choose a New Password
            </h1>
          </div>

          {status === "success" && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs font-medium">{msg}</p>
            </div>
          )}

          {status === "error" && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs font-medium">{msg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                New Password (min 6 chars)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
                <Lock className="w-4 h-4 text-brand-grey absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-brand-grey hover:text-brand-dark"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-brand-blue text-white font-display text-sm font-bold uppercase tracking-wider hover:bg-brand-blue-hover transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
