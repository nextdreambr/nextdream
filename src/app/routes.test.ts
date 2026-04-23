import { describe, expect, it } from 'vitest';
import { router } from './routes';

function flattenPaths(routes: Array<{ path?: string; children?: unknown }>, prefix = ''): string[] {
  return routes.flatMap((route) => {
    const current = route.path
      ? route.path.startsWith('/')
        ? route.path
        : `${prefix}/${route.path}`.replace(/\/+/g, '/')
      : prefix;
    const childRoutes = Array.isArray(route.children)
      ? flattenPaths(route.children as Array<{ path?: string; children?: unknown }>, current)
      : [];
    return route.path ? [current, ...childRoutes] : childRoutes;
  });
}

describe('router', () => {
  it('exposes public recovery and email verification routes', () => {
    const paths = flattenPaths(router.routes as Array<{ path?: string; children?: unknown }>);
    expect(paths).toContain('/redefinir-senha');
    expect(paths).toContain('/verificar-email');
  });
});
