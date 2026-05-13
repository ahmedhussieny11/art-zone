"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      let message = "اسم المستخدم أو كلمة المرور غير صحيحة";
      try {
        const data = await res.json();
        if (data?.error && typeof data.error === "string") message = data.error;
      } catch {
        /* ignore */
      }
      setError(message);
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal px-6">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <span className="font-serif text-3xl font-bold tracking-wider text-white">
            ART<span className="text-gold">ZONE</span>
          </span>
          <p className="mt-3 text-sm text-white/50">لوحة التحكم</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label htmlFor="username" className="mb-2 block text-xs font-medium tracking-wider text-white/60">
              اسم المستخدم
            </label>
            <input
              type="text"
              id="username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white outline-none transition-colors focus:border-gold placeholder:text-white/30"
              placeholder="اسم المستخدم"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-xs font-medium tracking-wider text-white/60">
              كلمة المرور
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white outline-none transition-colors focus:border-gold placeholder:text-white/30"
              placeholder="أدخل كلمة المرور"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold py-3.5 text-sm font-medium tracking-wider text-white transition-all hover:bg-gold-dark disabled:opacity-50"
          >
            {loading ? "جاري الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
