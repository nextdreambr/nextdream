import { describe, expect, it, vi } from 'vitest';
import { DreamsService } from '../src/modules/dreams/dreams.service';

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

  const service = new (DreamsService as any)(
    dreamsRepository,
    usersRepository,
    proposalsRepository,
    conversationsRepository,
    institutionService,
    notificationsService,
  ) as DreamsService;

  return {
    service,
    dreamsRepository,
    usersRepository,
    proposalsRepository,
    conversationsRepository,
    institutionService,
    notificationsService,
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
