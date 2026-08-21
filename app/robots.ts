import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/dashboard', '/owner/', '/clients/', '/billing', '/documents', '/growth', '/launch', '/compliance'] }
    ],
    sitemap: 'https://new850.com/sitemap.xml'
  };
}
