#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const blogJsonPath = path.join(root, 'src', 'features', 'blog', 'blogData.json');

const SITE_URL = (process.env.VITE_SITE_URL || 'https://safeguard.lunes.io').replace(/\/$/, '');
const today = new Date().toISOString().slice(0, 10);

function absUrl(p) {
  const s = p.startsWith('/') ? p : `/${p}`;
  return `${SITE_URL}${s}`;
}

/** Load blog posts */
let blogPosts = [];
try {
  const raw = fs.readFileSync(blogJsonPath, 'utf8');
  blogPosts = JSON.parse(raw);
} catch (e) {
  console.warn('[sitemap] Could not read blogData.json, proceeding with empty posts.', e.message);
}

/** Static routes present in the app */
const staticRoutes = [
  { loc: '/', changefreq: 'daily', priority: 1.0 },
  { loc: '/como-funciona', changefreq: 'weekly', priority: 0.8 },
  { loc: '/score-de-garantia', changefreq: 'weekly', priority: 0.8 },
  { loc: '/projetos', changefreq: 'weekly', priority: 0.7 },
  { loc: '/governanca', changefreq: 'weekly', priority: 0.6 },
  { loc: '/blog', changefreq: 'weekly', priority: 0.6 },
  { loc: '/termos', changefreq: 'yearly', priority: 0.4 },
  { loc: '/privacidade', changefreq: 'yearly', priority: 0.4 },
];

/** Blog routes from data */
const blogRoutes = blogPosts.map(p => ({
  loc: `/blog/${p.slug}`,
  changefreq: 'monthly',
  priority: 0.5,
}));

const routes = [...staticRoutes, ...blogRoutes];

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  routes.map(r => `  <url>\n    <loc>${absUrl(r.loc)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority.toFixed(1)}</priority>\n  </url>`).join('\n') +
  `\n</urlset>\n`;

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');

console.log(`[sitemap] Generated ${routes.length} entries to public/sitemap.xml using base ${SITE_URL}`);
