const GOOGLE_TAG_BASE_URL = 'https://www.googletagmanager.com/gtag/js?id=';

function getExternalScriptSelector(measurementId: string) {
  return `script[src="${GOOGLE_TAG_BASE_URL}${measurementId}"]`;
}

function getInlineScriptSelector(measurementId: string) {
  return `script[data-ga-inline="${measurementId}"]`;
}

export function initGoogleAnalytics(measurementId: string | undefined) {
  if (!measurementId) {
    return;
  }

  const win = window as typeof window & {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __NEXTDREAM_GA_INITIALIZED__?: boolean;
  };

  if (win.__NEXTDREAM_GA_INITIALIZED__) {
    return;
  }

  if (!document.querySelector(getExternalScriptSelector(measurementId))) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `${GOOGLE_TAG_BASE_URL}${measurementId}`;
    document.head.appendChild(script);
  }

  if (!document.querySelector(getInlineScriptSelector(measurementId))) {
    const inlineScript = document.createElement('script');
    inlineScript.setAttribute('data-ga-inline', measurementId);
    inlineScript.text = [
      'window.dataLayer = window.dataLayer || [];',
      'function gtag(){dataLayer.push(arguments);}',
      "gtag('js', new Date());",
      `gtag('config', '${measurementId}');`,
    ].join('\n');

    document.head.appendChild(inlineScript);
  }

  win.dataLayer = win.dataLayer || [];
  win.gtag = win.gtag || ((...args: unknown[]) => win.dataLayer?.push(args));
  win.__NEXTDREAM_GA_INITIALIZED__ = true;
}
