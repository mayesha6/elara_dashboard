import { slugify } from '@/utils/slugify';

describe('slugify utility function', () => {
  it('converts title to lowercase slug with hyphens', () => {
    expect(slugify('My Organization Name')).toBe('my-organization-name');
  });

  it('removes special characters and handles whitespace correctly', () => {
    expect(slugify('  Tech Innovation Co  ')).toBe('tech-innovation-co');
  });

  it('handles empty string gracefully', () => {
    expect(slugify('')).toBe('');
  });
});
