import { describe, expect, it, vi } from 'vitest';
import { Conversation } from '../src/entities/conversation.entity';
import { ConversationsService } from '../src/modules/conversations/conversations.service';

describe('ConversationsService.serializeConversations', () => {
  it('returns undefined dreamPath when the related dream is missing', async () => {
    const conversationsRepository = {
      find: vi.fn(),
      createQueryBuilder: vi.fn(),
      findOneBy: vi.fn(),
      save: vi.fn(),
    };
    const messagesRepository = {
      find: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
    };
    const usersRepository = {
      findBy: vi.fn().mockResolvedValue([
        {
          id: 'patient-1',
          name: 'Paciente Operador',
          city: 'Recife',
          state: 'PE',
        },
      ]),
      findOneBy: vi.fn(),
    };
    const dreamsRepository = {
      findBy: vi.fn().mockResolvedValue([]),
      findOneBy: vi.fn(),
    };
    const managedPatientsRepository = {
      findBy: vi.fn().mockResolvedValue([]),
      findOneBy: vi.fn(),
    };
    const auditLogsRepository = {
      save: vi.fn(),
      create: vi.fn(),
    };
    const reportsRepository = {
      save: vi.fn(),
      create: vi.fn(),
    };
    const institutionService = {
      listLinkedManagedPatientIdsForUser: vi.fn(),
      overview: vi.fn(),
      isLinkedManagedPatient: vi.fn(),
    };
    const notificationsService = {
      createNotification: vi.fn(),
    };
    const chatModerationService = {
      moderateMessage: vi.fn(),
    };

    const service = new (ConversationsService as any)(
      conversationsRepository,
      messagesRepository,
      usersRepository,
      dreamsRepository,
      managedPatientsRepository,
      auditLogsRepository,
      reportsRepository,
      institutionService,
      notificationsService,
      chatModerationService,
    );

    const result = await (service as any).serializeConversations([
      {
        id: 'conversation-1',
        dreamId: 'missing-dream',
        patientId: 'patient-1',
        supporterId: 'supporter-1',
        status: 'ativa',
        managedPatientId: null,
        createdAt: new Date(),
      } as unknown as Conversation,
    ]);

    expect(result).toEqual([
      expect.objectContaining({
        id: 'conversation-1',
        dreamId: 'missing-dream',
        dreamTitle: undefined,
        dreamStatus: undefined,
        dreamPath: undefined,
      }),
    ]);
  });
});
