import type { MetadataRoute } from 'next';
import { categories } from '@/content/categories';
import { projectsByCategory, sortedProjects } from '@/content/projects';
import { siteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const statics = ['', '/projects', '/categories', '/about', '/contact'].map((p) => ({ url: `${siteUrl}${p}`, lastModified: now }));
  const work = sortedProjects().map((p) => ({ url: `${siteUrl}/projects/${p.slug}`, lastModified: now }));
  const cats = categories.filter((c) => projectsByCategory(c.slug).length).map((c) => ({ url: `${siteUrl}/categories/${c.slug}`, lastModified: now }));
  return [...statics, ...work, ...cats];
}
