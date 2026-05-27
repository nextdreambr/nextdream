import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminPagination,
  AdminSearchInput,
  AdminSensitiveActionPanel,
} from './index';

describe('Admin shared foundation components', () => {
  it('renders total-aware pagination and emits page and page-size changes', () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();

    render(
      <AdminPagination
        page={1}
        pageSize={20}
        total={248}
        totalPages={13}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />,
    );

    expect(screen.getByText('Exibindo 1–20 de 248')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /página anterior/i })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /próxima página/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);

    fireEvent.change(screen.getByLabelText(/itens por página/i), { target: { value: '50' } });
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });

  it('renders a controlled search input with quick clear', () => {
    const onChange = vi.fn();

    render(
      <AdminSearchInput
        value="ana"
        onChange={onChange}
        placeholder="Buscar usuário"
      />,
    );

    expect(screen.getByPlaceholderText('Buscar usuário')).toHaveValue('ana');

    fireEvent.click(screen.getByRole('button', { name: /limpar busca/i }));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('standardizes loading, error and empty states with optional actions', () => {
    const onRetry = vi.fn();
    const onCreate = vi.fn();

    render(
      <>
        <AdminLoadingState title="Carregando usuários" description="Buscando dados operacionais." />
        <AdminErrorState title="Falha ao carregar" description="Tente novamente." actionLabel="Recarregar" onAction={onRetry} />
        <AdminEmptyState title="Nenhum usuário" description="Não há contas com estes filtros." actionLabel="Limpar filtros" onAction={onCreate} />
      </>,
    );

    expect(screen.getByText('Carregando usuários')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Recarregar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('keeps sensitive actions visually separate and requires a reason before confirmation', async () => {
    const onConfirm = vi.fn();

    render(
      <AdminSensitiveActionPanel
        title="Ações sensíveis"
        description="Operações auditadas com impacto direto no acesso."
        actions={[
          {
            id: 'suspend',
            title: 'Suspender conta',
            description: 'Remove o acesso até reavaliação administrativa.',
            confirmLabel: 'Suspender',
            requiresReason: true,
            reasonLabel: 'Motivo da suspensão',
            onConfirm,
          },
        ]}
      />,
    );

    expect(screen.getByText('Ações sensíveis')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Suspender' })).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Motivo da suspensão'), {
      target: { value: 'Risco de acesso indevido' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Suspender' }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Confirmar ação' }));
    });

    expect(onConfirm).toHaveBeenCalledWith('Risco de acesso indevido');
  });
});
