import type { MetadataRoute } from 'next';

const routes = ['', '/services', '/loan-readiness', '/loans', '/auto', '/mortgage', '/business-funding', '/marketplace', '/get-started'];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({ url: `https://new850.com${route}`, changeFrequency: route === '' ? 'weekly' : 'monthly', priority: route === '' ? 1 : route === '/get-started' ? 0.9 : 0.8 }));
}
