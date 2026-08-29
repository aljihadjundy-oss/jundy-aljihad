"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { categories, type Post } from "@/lib/posts";

type FormState = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  postType: "article" | "link";
  externalUrl: string;
  externalPlatform: "instagram" | "youtube" | "";
  published: boolean;
  date: string;
};

function toFormState(post?: Post | null): FormState {
  return {
    slug: post?.slug || "",
    title: post?.title || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    category: post?.category || categories[0],
    tags: post?.tags?.join(", ") || "",
    postType: post?.postType || "article",
    externalUrl: post?.externalUrl || "",
    externalPlatform: (post?.externalPlatform as "instagram" | "youtube") || "instagram",
    published: post?.published ?? true,
    date: post?.date || new Date().toISOString().slice(0, 10),
  };
}

export default function StudioPostForm({
  initialPost,
}: {
  initialPost?: Post | null;
}) {
  const router = useRouter();
  const isEdit = !!initialPost;
  const [form, setForm] = useState<FormState>(toFormState(initialPost));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = {
      slug: form.slug,
      title: form.title,
      excerpt: form.excerpt,
      content: form.content,
      category: form.category,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      postType: form.postType,
      externalUrl: form.postType === "link" ? form.externalUrl : null,
      externalPlatform: form.postType === "link" ? form.externalPlatform : null,
      published: form.published,
      date: form.date,
    };

    const res = await fetch(
      isEdit ? `/api/studio/posts/${initialPost!.slug}` : "/api/studio/posts",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Gagal nyimpen.");
      return;
    }
    router.push("/studio");
    router.refresh();
  }

  async function handleDelete() {
    if (!isEdit) return;
    if (!confirm(`Hapus "${initialPost!.title}"? Gak bisa di-undo.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/studio/posts/${initialPost!.slug}`, {
      method: "DELETE",
    });
    setDeleting(false);
    if (res.ok) {
      router.push("/studio");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => update("postType", "article")}
          className={`rounded-full px-4 py-2 text-sm ${
            form.postType === "article" ? "bg-white text-black" : "glass text-muted"
          }`}
        >
          Tulisan
        </button>
        <button
          type="button"
          onClick={() => update("postType", "link")}
          className={`rounded-full px-4 py-2 text-sm ${
            form.postType === "link" ? "bg-white text-black" : "glass text-muted"
          }`}
        >
          Share link (IG/YouTube)
        </button>
      </div>

      <div>
        <label className="mb-2 block text-sm text-muted">Judul</label>
        <input
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          required
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/30"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-muted">
          Slug {isEdit ? "" : "(kosongin buat auto dari judul)"}
        </label>
        <input
          value={form.slug}
          onChange={(e) => update("slug", e.target.value)}
          placeholder="auto-dari-judul"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-muted">Ringkasan</label>
        <textarea
          value={form.excerpt}
          onChange={(e) => update("excerpt", e.target.value)}
          rows={2}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/30"
        />
      </div>

      {form.postType === "article" ? (
        <div>
          <label className="mb-2 block text-sm text-muted">Isi tulisan (Markdown/MDX)</label>
          <textarea
            value={form.content}
            onChange={(e) => update("content", e.target.value)}
            rows={14}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30"
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-muted">Link IG/YouTube</label>
            <input
              value={form.externalUrl}
              onChange={(e) => update("externalUrl", e.target.value)}
              placeholder="https://..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Platform</label>
            <select
              value={form.externalPlatform}
              onChange={(e) =>
                update("externalPlatform", e.target.value as "instagram" | "youtube")
              }
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/30"
            >
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm text-muted">Kategori</label>
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/30"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm text-muted">Tags (pisah koma)</label>
          <input
            value={form.tags}
            onChange={(e) => update("tags", e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/30"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-muted">Tanggal</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/30"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-white/80">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => update("published", e.target.checked)}
          className="h-4 w-4 rounded border-white/20 bg-white/5"
        />
        Publish (kalau off, jadi draft)
      </label>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.01] disabled:opacity-60"
        >
          {saving ? "Nyimpen..." : isEdit ? "Update" : "Simpan"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-full border border-rose-400/40 px-6 py-3 text-sm text-rose-300 hover:bg-rose-400/10 disabled:opacity-60"
          >
            {deleting ? "Menghapus..." : "Hapus"}
          </button>
        )}
      </div>
    </form>
  );
}
