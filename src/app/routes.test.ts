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
    expect(paths).toContain('/pt-br/redefinir-senha');
    expect(paths).toContain('/en-us/reset-password');
    expect(paths).toContain('/es-es/restablecer-contrasena');
    expect(paths).toContain('/verificar-email');
    expect(paths).toContain('/en-us/verify-email');
    expect(paths).toContain('/concept-a/paciente/sonhos/criar');
    expect(paths).toContain('/concept-b/paciente/sonhos/criar');
    expect(paths).toContain('/concept-c/paciente/sonhos/criar');
  });

  it('exposes translated public routes without localizing admin', () => {
    const paths = flattenPaths(router.routes as Array<{ path?: string; children?: unknown }>);

    expect(paths).toContain('/pt-br/como-funciona');
    expect(paths).toContain('/en-us/how-it-works');
    expect(paths).toContain('/en-us/partnerships');
    expect(paths).toContain('/es-es/seguridad');
    expect(paths).toContain('/es-es/suenos/:id');
    expect(paths).toContain('/en-us/paciente/dashboard');
    expect(paths).not.toContain('/en-us/admin');
  });

  it('exposes admin detail routes for complex operational entities', () => {
    const paths = flattenPaths(router.routes as Array<{ path?: string; children?: unknown }>);
    expect(paths).toContain('/admin/chats/:chatId');
    expect(paths).toContain('/admin/denuncias/:reportId');
    expect(paths).toContain('/admin/sonhos/:dreamId');
    expect(paths).toContain('/admin/usuarios/:userId');
    expect(paths).toContain('/admin/propostas/:proposalId');
    expect(paths).toContain('/admin/admins/:adminId');
    expect(paths).toContain('/admin/mensagens/:messageId');
  });
});
