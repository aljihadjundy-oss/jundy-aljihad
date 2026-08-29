import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { getAllPosts } from "@/lib/posts";

const siteUrl = "https://jundyaljihad.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/about", "/portfolio", "/writing", "/contact"].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));

  const projectRoutes = projects.map((p) => ({
    url: `${siteUrl}/portfolio/${p.slug}`,
    lastModified: new Date(),
  }));

  const posts = await getAllPosts();
  const postRoutes = posts
    .filter((p) => p.postType !== "link")
    .map((p) => ({
      url: `${siteUrl}/writing/${p.slug}`,
      lastModified: new Date(p.date || Date.now()),
    }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}
