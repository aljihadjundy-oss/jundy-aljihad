// Plain-JS copy of src/index.ts, for pasting straight into the Cloudflare
// dashboard's Worker editor when you don't want to use the CLI. Keep this in
// sync with src/index.ts if you ever edit the API by hand instead of via
// `npm run deploy`.

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function serializePost(row) {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category,
    tags: JSON.parse(row.tags || "[]"),
    postType: row.post_type,
    externalUrl: row.external_url,
    externalPlatform: row.external_platform,
    published: !!row.published,
    date: row.date,
    updatedAt: row.updated_at,
  };
}

function isAuthorized(request, env) {
  const header = request.headers.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "");
  return !!env.ADMIN_TOKEN && token === env.ADMIN_TOKEN;
}

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    if (pathname === "/api/posts" && method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT * FROM posts WHERE published = 1 ORDER BY date DESC"
      ).all();
      return json((results || []).map(serializePost));
    }

    const publicSlugMatch = pathname.match(/^\/api\/posts\/([a-z0-9-]+)$/i);
    if (publicSlugMatch && method === "GET") {
      const slug = publicSlugMatch[1];
      const row = await env.DB.prepare(
        "SELECT * FROM posts WHERE slug = ? AND published = 1"
      )
        .bind(slug)
        .first();
      if (!row) return json({ error: "not_found" }, 404);
      return json(serializePost(row));
    }

    if (pathname.startsWith("/api/admin/")) {
      if (!isAuthorized(request, env)) {
        return json({ error: "unauthorized" }, 401);
      }

      if (pathname === "/api/admin/posts" && method === "GET") {
        const { results } = await env.DB.prepare(
          "SELECT * FROM posts ORDER BY date DESC"
        ).all();
        return json((results || []).map(serializePost));
      }

      if (pathname === "/api/admin/posts" && method === "POST") {
        const body = await readBody(request);
        if (!body || typeof body.title !== "string" || !body.title.trim()) {
          return json({ error: "title_required" }, 400);
        }
        const slug =
          typeof body.slug === "string" && body.slug.trim()
            ? slugify(body.slug)
            : slugify(body.title);
        if (!slug) return json({ error: "invalid_slug" }, 400);

        const now = new Date().toISOString();
        try {
          await env.DB.prepare(
            `INSERT INTO posts
              (slug, title, excerpt, content, category, tags, post_type, external_url, external_platform, published, date, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
            .bind(
              slug,
              String(body.title),
              String(body.excerpt || ""),
              String(body.content || ""),
              String(body.category || "Topics"),
              JSON.stringify(Array.isArray(body.tags) ? body.tags : []),
              body.postType === "link" ? "link" : "article",
              body.externalUrl ? String(body.externalUrl) : null,
              body.externalPlatform ? String(body.externalPlatform) : null,
              body.published === false ? 0 : 1,
              String(body.date || now.slice(0, 10)),
              now,
              now
            )
            .run();
        } catch {
          return json({ error: "slug_taken" }, 409);
        }

        const row = await env.DB.prepare("SELECT * FROM posts WHERE slug = ?")
          .bind(slug)
          .first();
        return json(serializePost(row), 201);
      }

      const adminSlugMatch = pathname.match(/^\/api\/admin\/posts\/([a-z0-9-]+)$/i);
      if (adminSlugMatch) {
        const slug = adminSlugMatch[1];

        if (method === "GET") {
          const row = await env.DB.prepare("SELECT * FROM posts WHERE slug = ?")
            .bind(slug)
            .first();
          if (!row) return json({ error: "not_found" }, 404);
          return json(serializePost(row));
        }

        if (method === "PUT") {
          const body = await readBody(request);
          if (!body) return json({ error: "invalid_body" }, 400);

          const existing = await env.DB.prepare("SELECT * FROM posts WHERE slug = ?")
            .bind(slug)
            .first();
          if (!existing) return json({ error: "not_found" }, 404);

          const now = new Date().toISOString();
          const nextSlug =
            typeof body.slug === "string" && body.slug.trim()
              ? slugify(body.slug)
              : slug;

          await env.DB.prepare(
            `UPDATE posts SET
              slug = ?, title = ?, excerpt = ?, content = ?, category = ?, tags = ?,
              post_type = ?, external_url = ?, external_platform = ?, published = ?, date = ?, updated_at = ?
             WHERE slug = ?`
          )
            .bind(
              nextSlug,
              String(body.title ?? existing.title),
              String(body.excerpt ?? existing.excerpt),
              String(body.content ?? existing.content),
              String(body.category ?? existing.category),
              JSON.stringify(
                Array.isArray(body.tags) ? body.tags : JSON.parse(existing.tags || "[]")
              ),
              body.postType === "link" || body.postType === "article"
                ? body.postType
                : existing.post_type,
              body.externalUrl !== undefined
                ? body.externalUrl
                  ? String(body.externalUrl)
                  : null
                : existing.external_url,
              body.externalPlatform !== undefined
                ? body.externalPlatform
                  ? String(body.externalPlatform)
                  : null
                : existing.external_platform,
              body.published === undefined ? existing.published : body.published ? 1 : 0,
              String(body.date ?? existing.date),
              now,
              slug
            )
            .run();

          const row = await env.DB.prepare("SELECT * FROM posts WHERE slug = ?")
            .bind(nextSlug)
            .first();
          return json(serializePost(row));
        }

        if (method === "DELETE") {
          await env.DB.prepare("DELETE FROM posts WHERE slug = ?").bind(slug).run();
          return json({ ok: true });
        }
      }

      return json({ error: "not_found" }, 404);
    }

    return json({ error: "not_found" }, 404);
  },
};
