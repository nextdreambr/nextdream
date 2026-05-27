import { describe, expect, it, vi } from 'vitest';
import { DreamsService } from '../src/modules/dreams/dreams.service';
import { DreamTranslationService } from '../src/modules/dreams/dream-translation.service';

function createService() {
  const dreamsRepository = {
    findOneBy: vi.fn(),
    findOneByOrFail: vi.fn(),
    save: vi.fn(),
  };
  const usersRepository = {
    findOneByOrFail: vi.fn(),
  };
  const proposalsRepository = {
    findOneBy: vi.fn(),
    find: vi.fn(),
    save: vi.fn(),
  };
  const conversationsRepository = {
    create: vi.fn((conversation) => conversation),
    save: vi.fn(),
  };
  const institutionService = {
    ensureManagedPatientForInstitution: vi.fn(async (_institutionId: string, managedPatientId: string) => {
      throw new Error(`unexpected managed patient lookup: ${managedPatientId}`);
    }),
    isLinkedManagedPatient: vi.fn(),
    overview: vi.fn(),
    listLinkedManagedPatientIdsForUser: vi.fn(),
  };
  const notificationsService = {
    createNotification: vi.fn(),
  };
  const translationService = {
    translateDream: vi.fn(),
  } satisfies Partial<DreamTranslationService>;

  const service = new (DreamsService as any)(
    dreamsRepository,
    usersRepository,
    proposalsRepository,
    conversationsRepository,
    institutionService,
    notificationsService,
    translationService,
  ) as DreamsService;

  return {
    service,
    dreamsRepository,
    usersRepository,
    proposalsRepository,
    conversationsRepository,
    institutionService,
    notificationsService,
    translationService,
  };
}

describe('DreamsService legacy institution dreams', () => {
  const currentUser = {
    sub: 'institution-1',
    email: 'institution@example.com',
    role: 'instituicao',
  } as const;

  const legacyDream = {
    id: 'dream-1',
    title: 'Sonho legado',
    description: 'Descricao',
    category: 'Saude',
    format: 'presencial',
    urgency: 'media',
    privacy: 'publico',
    status: 'publicado',
    patientId: 'institution-1',
    managedPatientId: null,
    createdAt: new Date('2026-01-01T12:00:00.000Z'),
    updatedAt: new Date('2026-01-02T12:00:00.000Z'),
  };

  it('serializes legacy dreams with pt-BR language metadata and an empty translation cache', async () => {
    const { service, dreamsRepository } = createService();

    dreamsRepository.findOneBy.mockResolvedValueOnce({ ...legacyDream });

    await expect(service.getDreamForUser(currentUser, legacyDream.id)).resolves.toMatchObject({
      id: legacyDream.id,
      originalLanguage: 'pt-BR',
      translations: {},
    });
  });

  it('allows institutions to view and update legacy dreams without managed patient lookup', async () => {
    const { service, dreamsRepository, institutionService } = createService();

    dreamsRepository.findOneBy
      .mockResolvedValueOnce({ ...legacyDream })
      .mockResolvedValueOnce({ ...legacyDream });
    dreamsRepository.save.mockImplementation(async (dream) => dream);

    await expect(service.getDreamForUser(currentUser, legacyDream.id)).resolves.toEqual(
      expect.objectContaining({
        id: legacyDream.id,
        managedPatientId: null,
      }),
    );

    await expect(
      service.updateDream(currentUser, legacyDream.id, { title: 'Sonho legado atualizado' }),
    ).resolves.toEqual(
      expect.objectContaining({
        id: legacyDream.id,
        title: 'Sonho legado atualizado',
      }),
    );

    expect(institutionService.ensureManagedPatientForInstitution).not.toHaveBeenCalled();
  });

  it('allows institutions to list proposals and respond on legacy dreams without managed patient lookup', async () => {
    const { service, dreamsRepository, usersRepository, proposalsRepository, conversationsRepository, institutionService, notificationsService } =
      createService();

    const proposal = {
      id: 'proposal-1',
      dreamId: legacyDream.id,
      supporterId: 'supporter-1',
      status: 'enviada',
      message: 'Posso ajudar',
      offering: 'Apoio',
      availability: 'fim de semana',
      duration: '2h',
      createdAt: new Date('2026-01-03T12:00:00.000Z'),
    };

    dreamsRepository.findOneBy
      .mockResolvedValueOnce({ ...legacyDream })
      .mockResolvedValueOnce({ ...legacyDream })
      .mockResolvedValueOnce({ ...legacyDream });
    dreamsRepository.findOneByOrFail.mockResolvedValueOnce({ ...legacyDream }).mockResolvedValueOnce({
      ...legacyDream,
    });
    proposalsRepository.find.mockResolvedValue([proposal]);
    proposalsRepository.findOneBy
      .mockResolvedValueOnce({ ...proposal })
      .mockResolvedValueOnce({ ...proposal, status: 'enviada' });
    proposalsRepository.save.mockImplementation(async (savedProposal) => savedProposal);
    dreamsRepository.save.mockImplementation(async (savedDream) => savedDream);
    conversationsRepository.save.mockResolvedValue({ id: 'conversation-1' });
    usersRepository.findOneByOrFail.mockResolvedValue({
      id: currentUser.sub,
      role: 'instituicao',
      name: 'Casa Esperanca',
    });
    notificationsService.createNotification.mockResolvedValue(undefined);

    await expect(service.listDreamProposals(currentUser, legacyDream.id)).resolves.toEqual([
      expect.objectContaining({
        id: proposal.id,
      }),
    ]);

    await expect(service.acceptProposal(currentUser, proposal.id)).resolves.toEqual(
      expect.objectContaining({
        id: proposal.id,
        conversationId: 'conversation-1',
        status: 'aceita',
      }),
    );

    await expect(service.rejectProposal(currentUser, proposal.id)).resolves.toEqual(
      expect.objectContaining({
        id: proposal.id,
        status: 'recusada',
      }),
    );

    expect(institutionService.ensureManagedPatientForInstitution).not.toHaveBeenCalled();
  });
});

describe('DreamsService translations', () => {
  const supporterUser = {
    sub: 'supporter-1',
    email: 'supporter@example.com',
    role: 'apoiador',
  } as const;

  const baseDream = {
    id: 'dream-translation-1',
    title: 'Ver o mar outra vez',
    description: 'Quero uma tarde tranquila para sentir a brisa.',
    category: 'Experiencia',
    format: 'presencial',
    urgency: 'media',
    privacy: 'publico',
    status: 'publicado',
    patientId: 'patient-1',
    managedPatientId: null,
    originalLanguage: 'pt-BR',
    translations: {},
    createdAt: new Date('2026-01-01T12:00:00.000Z'),
    updatedAt: new Date('2026-01-02T12:00:00.000Z'),
  };

  it('returns a cached translation without calling OpenAI', async () => {
    const { service, dreamsRepository, translationService } = createService();
    const cachedTranslation = {
      title: 'See the sea once more',
      description: 'I want a quiet afternoon to feel the breeze.',
      source: 'machine' as const,
      createdAt: '2026-02-01T12:00:00.000Z',
      updatedAt: '2026-02-01T12:00:00.000Z',
    };

    dreamsRepository.findOneBy.mockResolvedValueOnce({
      ...baseDream,
      translations: {
        'en-US': cachedTranslation,
      },
    });

    await expect(service.translateDream(supporterUser, baseDream.id, 'en-US')).resolves.toMatchObject(cachedTranslation);
    expect(translationService.translateDream).not.toHaveBeenCalled();
    expect(dreamsRepository.save).not.toHaveBeenCalled();
  });

  it('generates and saves a translation without changing the original title or description', async () => {
    const { service, dreamsRepository, translationService } = createService();
    translationService.translateDream.mockResolvedValue({
      title: 'See the sea once more',
      description: 'I want a quiet afternoon to feel the breeze.',
    });
    dreamsRepository.findOneBy.mockResolvedValueOnce({ ...baseDream, translations: {} });
    dreamsRepository.save.mockImplementation(async (dream) => dream);

    const translation = await service.translateDream(supporterUser, baseDream.id, 'en-US');

    expect(translation).toMatchObject({
      title: 'See the sea once more',
      description: 'I want a quiet afternoon to feel the breeze.',
      source: 'machine',
    });
    expect(translation.createdAt).toEqual(expect.any(String));
    expect(translation.updatedAt).toEqual(expect.any(String));
    expect(translationService.translateDream).toHaveBeenCalledWith({
      title: baseDream.title,
      description: baseDream.description,
      sourceLanguage: 'pt-BR',
      targetLanguage: 'en-US',
    });
    expect(dreamsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        title: baseDream.title,
        description: baseDream.description,
        translations: expect.objectContaining({
          'en-US': expect.objectContaining({
            title: 'See the sea once more',
          }),
        }),
      }),
    );
  });

  it('rejects unsupported or matching translation locales', async () => {
    const { service, dreamsRepository } = createService();

    dreamsRepository.findOneBy
      .mockResolvedValueOnce({ ...baseDream })
      .mockResolvedValueOnce({ ...baseDream });

    await expect(service.translateDream(supporterUser, baseDream.id, 'fr-FR')).rejects.toMatchObject({
      status: 400,
    });
    await expect(service.translateDream(supporterUser, baseDream.id, 'pt-BR')).rejects.toMatchObject({
      status: 400,
    });
  });
});
