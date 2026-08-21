import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'New850 Financial Readiness',
    short_name: 'New850',
    description: 'Financial readiness and approval preparation platform.',
    start_url: '/',
    display: 'standalone',
    background_color: '#02060b',
    theme_color: '#02060b'
  };
}
