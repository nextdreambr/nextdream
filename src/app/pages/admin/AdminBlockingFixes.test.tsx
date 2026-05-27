import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminAudit from './AdminAudit';
import AdminMessages from './AdminMessages';
import { adminApi } from '../../lib/api';

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../../lib/api')>('../../lib/api');

  return {
    ...actual,
    adminApi: {
      ...actual.adminApi,
      listAudit: vi.fn(),
      listAuditPage: vi.fn(),
      listMessages: vi.fn(),
      getMessageDetail: vi.fn(),
    },
  };
});

const listAuditPageMock = vi.mocked(adminApi.listAuditPage);
const listMessagesMock = vi.mocked(adminApi.listMessages);
const getMessageDetailMock = vi.mocked(adminApi.getMessageDetail);

describe('admin blocking QA fixes', () => {
  beforeEach(() => {
    listAuditPageMock.mockReset();
    listMessagesMock.mockReset();
    getMessageDetailMock.mockReset();
  });

  it('loads audit logs through server-side pagination, search and filters', async () => {
    listAuditPageMock.mockResolvedValue({
      items: [
        {
          id: 'audit-1',
          action: 'Status de proposta alterado',
          by: 'Admin Root',
          target: 'Proposta Esperança',
          type: 'proposta',
          severity: 'alta',
          outcome: 'warn',
          details: 'Status alterado com motivo registrado.',
          refPath: '/admin/propostas',
          refId: 'proposal-1',
          date: '2026-04-22T12:00:00.000Z',
        },
      ],
      page: 1,
      pageSize: 10,
      total: 42,
      totalPages: 5,
    });

    render(
      <MemoryRouter>
        <AdminAudit />
      </MemoryRouter>,
    );

    await screen.findByText('Status de proposta alterado');
    expect(screen.getByText('Exibindo 1–10 de 42')).toBeInTheDocument();
    expect(listAuditPageMock).toHaveBeenLastCalledWith(expect.objectContaining({
      page: 1,
      pageSize: 10,
      query: '',
      type: '',
      outcome: '',
      severity: '',
    }));

    fireEvent.change(screen.getByLabelText(/tipo/i), { target: { value: 'proposta' } });
    fireEvent.change(screen.getByLabelText(/resultado/i), { target: { value: 'warn' } });

    await waitFor(() => {
      expect(listAuditPageMock).toHaveBeenLastCalledWith(expect.objectContaining({
        page: 1,
        type: 'proposta',
        outcome: 'warn',
      }));
    });
  });

  it('keeps messages in a paginated master-detail layout with real query params', async () => {
    listMessagesMock.mockResolvedValue({
      items: [
        {
          id: 'msg-1',
          name: 'Ana Cuidadora',
          email: 'ana@example.com',
          subject: 'Dúvida sobre sonho',
          status: 'novo',
          createdAt: '2026-04-21T10:00:00.000Z',
        },
      ],
      page: 1,
      pageSize: 10,
      total: 18,
      totalPages: 2,
    });
    getMessageDetailMock.mockResolvedValue({
      id: 'msg-1',
      name: 'Ana Cuidadora',
      email: 'ana@example.com',
      subject: 'Dúvida sobre sonho',
      status: 'novo',
      body: 'Gostaria de entender como posso ajudar sem envolver dinheiro.',
      createdAt: '2026-04-21T10:00:00.000Z',
    });

    render(
      <MemoryRouter initialEntries={['/admin/mensagens']}>
        <Routes>
          <Route path="/admin/mensagens" element={<AdminMessages />} />
          <Route path="/admin/mensagens/:messageId" element={<AdminMessages />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText('Dúvida sobre sonho');
    expect(screen.getByText('Exibindo 1–10 de 18')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/assunto, remetente ou conteúdo/i), {
      target: { value: 'sonho' },
    });
    fireEvent.change(screen.getByLabelText(/status/i), { target: { value: 'novo' } });

    await waitFor(() => {
      expect(listMessagesMock).toHaveBeenLastCalledWith(expect.objectContaining({
        page: 1,
        pageSize: 10,
        query: 'sonho',
        status: 'novo',
      }));
    });

    fireEvent.click(screen.getByRole('button', { name: /abrir mensagem dúvida sobre sonho/i }));
    expect(await screen.findByText(/gostaria de entender/i)).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
