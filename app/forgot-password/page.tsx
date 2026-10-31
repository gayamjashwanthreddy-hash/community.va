"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setMsg("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setStatus("error");
        setMsg(error.message || "Unable to send reset instructions.");
      } else {
        setStatus("success");
        setMsg("Password reset instructions have been dispatched to your email address.");
      }
    } catch {
      setStatus("error");
      setMsg("An unexpected error occurred. Please try again.");
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
              Account Recovery
            </span>
            <h1 className="font-display text-2xl font-extrabold text-brand-dark uppercase tracking-tight mt-1">
              Reset Your Password
            </h1>
            <p className="font-body text-xs sm:text-sm text-brand-dark/70 mt-1">
              Enter your registered email address and we will send you a secure link to reset your portal password.
            </p>
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
                Registered Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
                <Mail className="w-4 h-4 text-brand-grey absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-brand-dark text-white font-display text-sm font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching Link...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
