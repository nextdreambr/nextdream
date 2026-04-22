import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  loadSandboxProfileState,
  persistSandboxProfileState,
  SANDBOX_PROFILE_STORAGE_PREFIX,
  type SandboxProfileState,
} from './sandboxProfileState';

const baseState: SandboxProfileState = {
  privacy: {
    showCity: true,
    showDreamContext: true,
    highlightSafetyReminder: true,
  },
  security: {
    demoPasswordDraft: 'Senha123!',
    safetyChecklist: true,
    lastSavedAt: '2026-04-22T09:00:00.000Z',
  },
  historyFilter: 'todos',
  visitedDreams: [],
};

describe('sandboxProfileState', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('falls back safely when sessionStorage access throws', () => {
    const getItemSpy = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('blocked');
      });
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('blocked');
      });

    expect(loadSandboxProfileState('supporter-1', 'apoiador')).toEqual({
      privacy: {
        showCity: true,
        showDreamContext: false,
        highlightSafetyReminder: true,
      },
      security: {
        demoPasswordDraft: '',
        safetyChecklist: true,
        lastSavedAt: undefined,
      },
      historyFilter: 'todos',
      visitedDreams: [],
    });

    expect(() => persistSandboxProfileState('supporter-1', baseState)).not.toThrow();
    expect(getItemSpy).toHaveBeenCalled();
    expect(setItemSpy).toHaveBeenCalled();
  });

  it('filters invalid visitedDream entries loaded from storage', () => {
    window.sessionStorage.setItem(
      `${SANDBOX_PROFILE_STORAGE_PREFIX}supporter-1`,
      JSON.stringify({
        historyFilter: 'todos',
        visitedDreams: [
          null,
          {
            dreamId: 'dream-1',
            title: 'Sonho válido',
            path: '/apoiador/sonhos/dream-1',
            visitedAt: '2026-04-20T10:00:00.000Z',
          },
          {
            dreamId: 'dream-2',
            title: 'Sem path',
          },
        ],
      }),
    );

    const state = loadSandboxProfileState('supporter-1', 'apoiador');

    expect(state.visitedDreams).toEqual([
      {
        dreamId: 'dream-1',
        title: 'Sonho válido',
        path: '/apoiador/sonhos/dream-1',
        visitedAt: '2026-04-20T10:00:00.000Z',
      },
    ]);
  });
});
