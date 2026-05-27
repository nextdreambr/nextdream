import { HOME_HERO_VARIANTS, type HomeHeroVariant } from '../data/heroVariants';

export const HOME_HERO_VARIANT_STORAGE_KEY = 'nextdream.home.heroVariant.v1';

function findHeroVariantById(id: string | null): HomeHeroVariant | undefined {
  if (!id) return undefined;
  return HOME_HERO_VARIANTS.find((variant) => variant.id === id);
}

function getSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function getRandomHeroVariant(random = Math.random): HomeHeroVariant {
  const index = Math.min(
    Math.floor(random() * HOME_HERO_VARIANTS.length),
    HOME_HERO_VARIANTS.length - 1,
  );

  return HOME_HERO_VARIANTS[index];
}

export function selectHomeHeroVariant(options?: {
  storage?: Storage | null;
  random?: () => number;
}): HomeHeroVariant {
  const storage = options?.storage ?? getSessionStorage();
  const random = options?.random ?? Math.random;

  try {
    const storedVariant = findHeroVariantById(storage?.getItem(HOME_HERO_VARIANT_STORAGE_KEY) ?? null);
    if (storedVariant) return storedVariant;
  } catch {
    return getRandomHeroVariant(random);
  }

  const selectedVariant = getRandomHeroVariant(random);

  try {
    storage?.setItem(HOME_HERO_VARIANT_STORAGE_KEY, selectedVariant.id);
  } catch {
    // Storage can be unavailable in privacy modes; the visual still renders with one safe variant.
  }

  return selectedVariant;
}
