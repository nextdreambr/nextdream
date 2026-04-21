export type ClientAppEnvironment = 'production' | 'sandbox';

const LOCAL_SANDBOX_HOSTNAMES = new Set(['localhost', '127.0.0.1']);

function getConfiguredSandboxHostname() {
  const rawHostname = import.meta.env.VITE_SANDBOX_HOSTNAME;
  if (!rawHostname) {
    return null;
  }

  const hostname = rawHostname.trim().toLowerCase();
  return hostname.length > 0 ? hostname : null;
}

function getCurrentHostname() {
  if (typeof window === 'undefined') {
    return null;
  }

  const hostname = window.location.hostname?.trim().toLowerCase();
  return hostname.length > 0 ? hostname : null;
}

export function getClientAppEnvironment(): ClientAppEnvironment {
  return isSandboxEnvironment() ? 'sandbox' : 'production';
}

export function isSandboxEnvironment() {
  const currentHostname = getCurrentHostname();
  const sandboxHostname = getConfiguredSandboxHostname();

  if (
    currentHostname !== null &&
    sandboxHostname !== null &&
    currentHostname === sandboxHostname
  ) {
    return true;
  }

  if (import.meta.env.VITE_APP_ENV !== 'sandbox') {
    return false;
  }

  if (currentHostname !== null) {
    return LOCAL_SANDBOX_HOSTNAMES.has(currentHostname);
  }

  return import.meta.env.MODE === 'test';
}
