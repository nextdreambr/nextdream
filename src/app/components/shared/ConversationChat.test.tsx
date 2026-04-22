import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConversationChat } from './ConversationChat';
import { ApiError, conversationsApi } from '../../lib/api';

const useAppMock = vi.fn();

vi.mock('../../context/AppContext', () => ({
  useApp: () => useAppMock(),
}));

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../../lib/api')>('../../lib/api');

  return {
    ...actual,
    conversationsApi: {
      ...actual.conversationsApi,
      listMine: vi.fn(),
      listMessages: vi.fn(),
      sendMessage: vi.fn(),
    },
  };
});

const listMineMock = vi.mocked(conversationsApi.listMine);
const listMessagesMock = vi.mocked(conversationsApi.listMessages);
const sendMessageMock = vi.mocked(conversationsApi.sendMessage);

describe('ConversationChat', () => {
  beforeEach(() => {
    useAppMock.mockReset();
    listMineMock.mockReset();
    listMessagesMock.mockReset();
    sendMessageMock.mockReset();

    useAppMock.mockReturnValue({
      currentUser: {
        id: 'supporter-1',
        role: 'apoiador',
      },
    });

    listMineMock.mockResolvedValue([
      {
        id: 'conversation-1',
        dreamId: 'dream-1',
        dreamTitle: 'Serenata para a varanda',
        dreamPath: '/apoiador/sonhos/dream-1',
        patientId: 'patient-1',
        patientName: 'Ana',
        supporterId: 'supporter-1',
        status: 'ativa',
        createdAt: '2026-04-20T10:00:00.000Z',
      },
    ]);
    listMessagesMock.mockResolvedValue([
      {
        id: 'message-1',
        conversationId: 'conversation-1',
        senderId: 'patient-1',
        body: 'Mensagem retida pela moderação do sandbox por mencionar dinheiro.',
        moderated: true,
        createdAt: '2026-04-20T10:10:00.000Z',
      },
      {
        id: 'message-2',
        conversationId: 'conversation-1',
        senderId: 'supporter-1',
        body: 'Posso organizar uma visita tranquila no sábado.',
        moderated: false,
        createdAt: '2026-04-20T10:12:00.000Z',
      },
    ]);
  });

  it('highlights the dream title in the list and header, with a visible link to the dream', async () => {
    render(
      <MemoryRouter>
        <ConversationChat emptyActionTo="/apoiador/propostas" emptyActionLabel="Ver propostas" />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Serenata para a varanda')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver sonho/i })).toHaveAttribute('href', '/apoiador/sonhos/dream-1');
    expect(screen.getByText(/mensagem moderada/i)).toBeInTheDocument();
  });

  it('blocks financial language before sending and shows a clear sandbox warning', async () => {
    render(
      <MemoryRouter>
        <ConversationChat emptyActionTo="/apoiador/propostas" emptyActionLabel="Ver propostas" />
      </MemoryRouter>,
    );

    await screen.findByText('Serenata para a varanda');

    fireEvent.change(screen.getByPlaceholderText(/digite sua mensagem/i), {
      target: { value: 'Posso fazer um PIX para agilizar tudo.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      expect(screen.getByText(/mensagens com pix, dinheiro ou doações são bloqueadas no sandbox/i)).toBeInTheDocument();
    });
    expect(sendMessageMock).not.toHaveBeenCalled();
  });

  it('shows the API moderation error if the backend still rejects the message', async () => {
    sendMessageMock.mockRejectedValueOnce(
      new ApiError(
        'No sandbox, mensagens com PIX, dinheiro ou doações são bloqueadas. Reformule oferecendo tempo, presença ou companhia.',
        400,
      ),
    );

    render(
      <MemoryRouter>
        <ConversationChat emptyActionTo="/apoiador/propostas" emptyActionLabel="Ver propostas" />
      </MemoryRouter>,
    );

    await screen.findByText('Serenata para a varanda');

    fireEvent.change(screen.getByPlaceholderText(/digite sua mensagem/i), {
      target: { value: 'Tudo bem, vou oferecer companhia e presença.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      expect(screen.getByText(/reformule oferecendo tempo, presença ou companhia/i)).toBeInTheDocument();
    });
  });

  it('tolerates an initial preload failure and retries when the selected conversation effect runs', async () => {
    listMessagesMock
      .mockReset()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce([
        {
          id: 'message-1',
          conversationId: 'conversation-1',
          senderId: 'patient-1',
          body: 'Mensagem retida pela moderação do sandbox por mencionar dinheiro.',
          moderated: true,
          createdAt: '2026-04-20T10:10:00.000Z',
        },
      ]);

    render(
      <MemoryRouter>
        <ConversationChat emptyActionTo="/apoiador/propostas" emptyActionLabel="Ver propostas" />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Serenata para a varanda')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/mensagem moderada/i)).toBeInTheDocument();
    });
    expect(listMessagesMock).toHaveBeenCalledTimes(2);
  });
});
