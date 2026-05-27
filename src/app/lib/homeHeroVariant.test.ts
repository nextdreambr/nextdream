import { describe, expect, it, beforeEach } from 'vitest';
import { HOME_HERO_VARIANTS } from '../data/heroVariants';
import {
  HOME_HERO_VARIANT_STORAGE_KEY,
  getRandomHeroVariant,
  selectHomeHeroVariant,
} from './homeHeroVariant';

describe('home hero variants', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('defines ten complete curated hero combinations', () => {
    expect(HOME_HERO_VARIANTS).toHaveLength(10);
    expect(new Set(HOME_HERO_VARIANTS.map((variant) => variant.id)).size).toBe(10);

    for (const variant of HOME_HERO_VARIANTS) {
      expect(variant.image).toMatch(/^https:\/\/images\.(unsplash|pexels)\.com\//);
      expect(variant.headline.length).toBeGreaterThan(10);
      expect(variant.subheadline).toContain('momentos delicados de saúde');
      expect(variant.photoCaption.length).toBeGreaterThan(10);
      expect(variant.badge).toMatch(/presença/i);
      expect(variant.badge).not.toMatch(/dinheiro|financeir/i);
      expect(variant.alt.length).toBeGreaterThan(10);
    }
  });

  it('selects a random variant and stores only its curated id for the session', () => {
    const selected = selectHomeHeroVariant({
      storage: window.sessionStorage,
      random: () => 0.21,
    });

    expect(selected).toBe(HOME_HERO_VARIANTS[2]);
    expect(window.sessionStorage.getItem(HOME_HERO_VARIANT_STORAGE_KEY)).toBe(selected.id);
  });

  it('keeps the stored variant stable during the same session', () => {
    window.sessionStorage.setItem(HOME_HERO_VARIANT_STORAGE_KEY, 'carta-com-cuidado');

    const selected = selectHomeHeroVariant({
      storage: window.sessionStorage,
      random: () => 0,
    });

    expect(selected.id).toBe('carta-com-cuidado');
  });

  it('replaces an invalid stored id with a valid variant', () => {
    window.sessionStorage.setItem(HOME_HERO_VARIANT_STORAGE_KEY, 'unknown');

    const selected = selectHomeHeroVariant({
      storage: window.sessionStorage,
      random: () => 0.99,
    });

    expect(selected).toBe(HOME_HERO_VARIANTS[9]);
    expect(window.sessionStorage.getItem(HOME_HERO_VARIANT_STORAGE_KEY)).toBe(selected.id);
  });

  it('clamps random edge cases to the last variant', () => {
    expect(getRandomHeroVariant(() => 1)).toBe(HOME_HERO_VARIANTS[9]);
  });
});
