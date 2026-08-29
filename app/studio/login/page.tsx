"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function StudioLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/studio/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Password salah.");
      return;
    }
    router.push("/studio");
    router.refresh();
  }

  return (
    <div className="flex min-h-[80svh] items-center justify-center px-6 pt-24">
      <form onSubmit={handleSubmit} className="glass w-full max-w-sm rounded-3xl p-8">
        <h1 className="font-display text-xl font-bold text-white">Writing room</h1>
        <p className="mt-2 text-sm text-muted">Masuk buat nulis atau edit tulisan.</p>

        <div className="mt-6">
          <label htmlFor="password" className="mb-2 block text-sm text-muted">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
          />
          {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.01] disabled:opacity-60"
        >
          {loading ? "Masuk..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
