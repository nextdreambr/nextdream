import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MyDreams from './MyDreams';
import { dreamsApi, type PublicDream } from '../../lib/api';

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../../lib/api')>('../../lib/api');

  return {
    ...actual,
    dreamsApi: {
      ...actual.dreamsApi,
      listMinePage: vi.fn(),
    },
  };
});

const listMinePageMock = vi.mocked(dreamsApi.listMinePage);

function makeDream(id: number): PublicDream {
  return {
    id: `dream-${id}`,
    title: `Sonho ${id}`,
    description: `Descrição do sonho ${id}`,
    category: 'Arte e Música',
    format: 'presencial',
    urgency: 'media',
    privacy: 'publico',
    status: id % 2 === 0 ? 'publicado' : 'em-conversa',
    patientId: 'patient-1',
    canEdit: true,
    createdAt: '2026-04-20T10:00:00.000Z',
    updatedAt: '2026-04-20T10:00:00.000Z',
  };
}

describe('MyDreams', () => {
  beforeEach(() => {
    listMinePageMock.mockReset();
    listMinePageMock
      .mockResolvedValueOnce({
        items: [1, 2, 3, 4, 5, 6].map(makeDream),
        page: 1,
        pageSize: 6,
        total: 10,
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        items: [7, 8, 9, 10].map(makeDream),
        page: 2,
        pageSize: 6,
        total: 10,
        totalPages: 2,
      });
  });

  it('loads paginated dreams from the API and moves to the next page', async () => {
    render(
      <MemoryRouter>
        <MyDreams />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Sonho 1')).toBeInTheDocument();
    expect(listMinePageMock).toHaveBeenNthCalledWith(1, {
      page: 1,
      pageSize: 6,
      query: '',
      status: '',
      category: '',
      format: '',
    });
    expect(screen.getByText(/10 sonhos no total/i)).toBeInTheDocument();
    expect(screen.getByText(/página 1 de 2/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/próxima página/i));

    await waitFor(() => {
      expect(listMinePageMock).toHaveBeenNthCalledWith(2, {
        page: 2,
        pageSize: 6,
        query: '',
        status: '',
        category: '',
        format: '',
      });
    });

    expect(await screen.findByText('Sonho 10')).toBeInTheDocument();
    expect(screen.queryByText('Sonho 1')).not.toBeInTheDocument();
  });

  it('forwards category and format filters to the paginated API call', async () => {
    listMinePageMock.mockReset();
    listMinePageMock.mockResolvedValue({
      items: [makeDream(1)],
      page: 1,
      pageSize: 6,
      total: 1,
      totalPages: 1,
    });

    render(
      <MemoryRouter>
        <MyDreams />
      </MemoryRouter>,
    );

    await screen.findByText('Sonho 1');

    fireEvent.click(screen.getByRole('button', { name: /filtros/i }));
    fireEvent.click(screen.getByRole('button', { name: /arte e música/i }));

    await waitFor(() => {
      expect(listMinePageMock).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 6,
        query: '',
        status: '',
        category: 'Arte e Música',
        format: '',
      });
    });

    fireEvent.click(screen.getByRole('button', { name: /online/i }));

    await waitFor(() => {
      expect(listMinePageMock).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 6,
        query: '',
        status: '',
        category: 'Arte e Música',
        format: 'remoto',
      });
    });
  });
});
