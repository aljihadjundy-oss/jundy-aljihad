"use client";

import { useState, type FormEvent } from "react";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function validate(): Errors {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Nama minimal 2 karakter.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Email-nya kayaknya belum valid.";
    if (message.trim().length < 10) next.message = "Ceritain sedikit lebih panjang ya, minimal 10 karakter.";
    return next;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const subject = encodeURIComponent(`Halo dari ${name} — via jundyaljihad.com`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:aljihadjundy@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm text-muted">
          Nama
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="glass w-full rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
          placeholder="Nama kamu"
        />
        {errors.name && <p className="mt-1.5 text-xs text-rose-400">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm text-muted">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="glass w-full rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
          placeholder="kamu@email.com"
        />
        {errors.email && <p className="mt-1.5 text-xs text-rose-400">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm text-muted">
          Pesan
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="glass w-full rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
          placeholder="Cerita singkat soal project atau ide kamu..."
        />
        {errors.message && <p className="mt-1.5 text-xs text-rose-400">{errors.message}</p>}
      </div>

      <button
        type="submit"
        data-cursor-hover
        className="w-full rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.01]"
      >
        Kirim pesan
      </button>

      {sent && (
        <p className="text-sm text-emerald-400">
          Mantap — client email kamu bakal kebuka buat kirim pesan ini ke aljihadjundy@gmail.com.
        </p>
      )}
    </form>
  );
}
