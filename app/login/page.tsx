"use client";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const emailRef    = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [show, setShow]   = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy]   = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const email    = emailRef.current?.value.trim() ?? "";
    const password = passwordRef.current?.value ?? "";
    const err = await login(email, password);
    if (err) { setError(err); setBusy(false); return; }
    // Don't navigate here — the useEffect redirects once user state is set by onAuthStateChange
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0FDF4] px-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-2xl bg-green-600 flex items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" />
            <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <span className="font-extrabold text-xl text-gray-900">Inzira Insights</span>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm p-8">
        <h1 className="text-lg font-bold text-gray-900 mb-1">Sign in</h1>
        <p className="text-sm text-gray-400 mb-6">Enter your account credentials</p>

        <form onSubmit={handleSubmit} method="post" className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Email</label>
            <input
              ref={emailRef}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@inzira.rw"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Password</label>
            <div className="relative">
              <input
                ref={passwordRef}
                type={show ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            Sign In
          </button>
        </form>
      </div>

      <p className="mt-6 text-[11px] text-gray-400">
        Built by <span className="font-bold text-green-600">OrynTech Ltd</span>
      </p>
    </div>
  );
}
