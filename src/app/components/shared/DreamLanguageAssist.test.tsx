import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '../../i18n/I18nProvider';
import { dreamsApi, type PublicDream } from '../../lib/api';
import { DreamLanguageAssist } from './DreamLanguageAssist';

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../../lib/api')>('../../lib/api');

  return {
    ...actual,
    dreamsApi: {
      ...actual.dreamsApi,
      translateDream: vi.fn(),
    },
  };
});

const translateDreamMock = vi.mocked(dreamsApi.translateDream);

const portugueseDream: PublicDream = {
  id: 'dream-1',
  title: 'Ver o mar outra vez',
  description: 'Quero uma tarde tranquila para sentir a brisa.',
  category: 'Experiência',
  format: 'presencial',
  urgency: 'media',
  privacy: 'publico',
  status: 'publicado',
  patientId: 'patient-1',
  patientName: 'Ana',
  patientCity: 'Recife, PE',
  originalLanguage: 'pt-BR',
  translations: {},
  createdAt: '2026-04-20T10:00:00.000Z',
  updatedAt: '2026-04-20T10:00:00.000Z',
};

function renderAssist(dream: PublicDream, locale: 'pt-BR' | 'en-US' | 'es-ES' = 'en-US') {
  return render(
    <I18nProvider locale={locale}>
      <DreamLanguageAssist dream={dream} variant="card">
        {({ title, description, controls }) => (
          <article>
            <h2>{title}</h2>
            <p>{description}</p>
            {controls}
          </article>
        )}
      </DreamLanguageAssist>
    </I18nProvider>,
  );
}

describe('DreamLanguageAssist', () => {
  beforeEach(() => {
    translateDreamMock.mockReset();
    translateDreamMock.mockResolvedValue({
      title: 'See the sea once more',
      description: 'I want a quiet afternoon to feel the breeze.',
      source: 'machine',
      createdAt: '2026-04-21T12:00:00.000Z',
      updatedAt: '2026-04-21T12:00:00.000Z',
    });
  });

  it('does not show translation controls when the dream is already in the active language', () => {
    renderAssist(portugueseDream, 'pt-BR');

    expect(screen.getByText('Ver o mar outra vez')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /traduzir|translate|traducir/i })).not.toBeInTheDocument();
  });

  it('translates on demand and toggles back to the original without a second request', async () => {
    renderAssist(portugueseDream, 'en-US');

    expect(screen.getByText('Originally written in Portuguese')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Translate to English' }));

    expect(screen.getByText('Translating...')).toBeInTheDocument();
    expect(await screen.findByText('See the sea once more')).toBeInTheDocument();
    expect(screen.getByText('I want a quiet afternoon to feel the breeze.')).toBeInTheDocument();
    expect(translateDreamMock).toHaveBeenCalledWith('dream-1', 'en-US');

    fireEvent.click(screen.getByRole('button', { name: 'View original' }));
    expect(screen.getByText('Ver o mar outra vez')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Translate to English' }));
    expect(screen.getByText('See the sea once more')).toBeInTheDocument();
    expect(translateDreamMock).toHaveBeenCalledTimes(1);
  });

  it('keeps the original visible and shows a small message when translation fails', async () => {
    translateDreamMock.mockRejectedValueOnce(new Error('provider unavailable'));
    renderAssist(portugueseDream, 'en-US');

    fireEvent.click(screen.getByRole('button', { name: 'Translate to English' }));

    await waitFor(() => {
      expect(screen.getByText('Translation is unavailable right now. The original stays visible.')).toBeInTheDocument();
    });
    expect(screen.getByText('Ver o mar outra vez')).toBeInTheDocument();
  });
});
