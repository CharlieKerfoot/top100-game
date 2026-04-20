import { describe, it, expect } from 'vitest';
import { GET } from '../src/routes/sitemap.xml/+server';

describe('sitemap.xml', () => {
  it('returns valid XML', async () => {
    const response = GET();
    const text = await response.text();
    expect(text).toContain('<?xml version="1.0"');
    expect(text).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  });

  it('includes home and daily URLs', async () => {
    const response = GET();
    const text = await response.text();
    expect(text).toContain('<loc>https://commoncents.fun/</loc>');
    expect(text).toContain('<loc>https://commoncents.fun/daily</loc>');
  });

  it('does not include multiplayer or API routes', async () => {
    const response = GET();
    const text = await response.text();
    expect(text).not.toContain('/api/');
    expect(text).not.toMatch(/<loc>.*\/[A-Z]{5}-\d{4}<\/loc>/);
  });

  it('sets correct content type', () => {
    const response = GET();
    expect(response.headers.get('Content-Type')).toMatch(/^application\/xml/);
  });
});
