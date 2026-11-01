"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Invalid email or password.");
      } else {
        router.push(data.redirectUrl || "/dashboard/student");
      }
    } catch {
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="max-w-md w-full">
        
        {/* Back Link & Brand Logo */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-brand-grey hover:text-brand-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <Link href="/" className="relative h-9 w-32">
            <Image
              src="/logos/community-va-logo.png"
              alt="COMMUNITY.VA Logo"
              fill
              className="object-contain"
              priority
            />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-brand-border shadow-md">
          
          <div className="mb-6">
            <span className="text-[11px] font-mono font-bold tracking-widest text-brand-blue uppercase">
              Secure Authentication
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-dark uppercase tracking-tight mt-1">
              Sign In to Your Portal
            </h1>
            <p className="font-body text-xs sm:text-sm text-brand-dark/70 mt-1">
              Enter your credentials to access your Student, Volunteer, College, or Administrative dashboard.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs font-medium">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                Email Address
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

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-mono font-bold uppercase text-brand-dark">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-mono text-brand-blue hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
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

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-brand-dark/80">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-brand-border text-brand-blue focus:ring-brand-blue"
                />
                <span>Remember session</span>
              </label>
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
                    <span>Verifying Session...</span>
                  </>
                ) : (
                  <span>Access Dashboard</span>
                )}
              </button>
            </div>

          </form>

          {/* Quick Demo Access Bar for Admin Evaluation */}
          <div className="mt-6 pt-5 border-t border-brand-border/70 text-xs text-brand-grey">
            <div className="flex items-center gap-1.5 text-brand-dark font-mono font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-blue" />
              <span>Administrative Access Note:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Administrators are provisioned through server credentials (<code className="bg-brand-bg px-1 rounded text-brand-dark">community.vaofficial@gmail.com</code>). Public self-selection of the Admin role is strictly disabled.
            </p>
          </div>

        </div>

        {/* Footer Prompt */}
        <p className="text-center text-xs font-mono text-brand-grey mt-6">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="text-brand-dark font-bold hover:text-brand-blue underline">
            Register here
          </Link>
        </p>

      </div>
    </div>
  );
}
