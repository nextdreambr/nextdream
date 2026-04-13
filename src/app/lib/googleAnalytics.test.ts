import { beforeEach, describe, expect, it } from 'vitest';
import { initGoogleAnalytics } from './googleAnalytics';

describe('initGoogleAnalytics', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';

    const win = window as typeof window & {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
      __NEXTDREAM_GA_INITIALIZED__?: boolean;
    };

    delete win.dataLayer;
    delete win.gtag;
    delete win.__NEXTDREAM_GA_INITIALIZED__;
  });

  it('does not initialize when measurement ID is missing', () => {
    initGoogleAnalytics('');

    expect(document.querySelectorAll('script').length).toBe(0);
    expect((window as typeof window & { dataLayer?: unknown[] }).dataLayer).toBeUndefined();
  });

  it('injects Google Analytics scripts and config for a valid ID', () => {
    initGoogleAnalytics('G-P7HEP47P2M');

    const script = document.querySelector(
      'script[src="https://www.googletagmanager.com/gtag/js?id=G-P7HEP47P2M"]',
    );
    expect(script).not.toBeNull();

    const inlineScript = document.querySelector(
      'script[data-ga-inline="G-P7HEP47P2M"]',
    );
    expect(inlineScript).not.toBeNull();
    expect(inlineScript?.textContent).toContain("gtag('config', 'G-P7HEP47P2M'");

    const win = window as typeof window & {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
    };

    expect(Array.isArray(win.dataLayer)).toBe(true);
    expect(typeof win.gtag).toBe('function');
  });

  it('does not duplicate scripts when called multiple times', () => {
    initGoogleAnalytics('G-P7HEP47P2M');
    initGoogleAnalytics('G-P7HEP47P2M');

    expect(
      document.querySelectorAll(
        'script[src="https://www.googletagmanager.com/gtag/js?id=G-P7HEP47P2M"]',
      ).length,
    ).toBe(1);

    expect(document.querySelectorAll('script[data-ga-inline="G-P7HEP47P2M"]').length).toBe(1);
  });
});
