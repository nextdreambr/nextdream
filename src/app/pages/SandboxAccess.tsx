import { useState, type ComponentType } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { Building2, HeartHandshake, PlayCircle, ShieldCheck, Sparkles, UserRound, X } from 'lucide-react';
import { sandboxExperienceConfig, isSandboxPersona } from '../config/sandboxExperience';
import { isSandboxEnvironment } from '../config/environment';
import { useApp } from '../context/AppContext';
import { authApi, SandboxPersona } from '../lib/api';
import { clearSandboxTourLaunch, queueSandboxTourLaunch } from '../lib/sandboxTourSession';
import logoImg from '../../assets/df29d28e06eae9a96d131fc75e2fd7064bd951d1.png';
import careTextureImage from '../../assets/public/rede-de-cuidado-textura.webp';

type PersonaCard = {
  persona: SandboxPersona;
  accent: string;
  icon: ComponentType<{ className?: string }>;
};

const cards: PersonaCard[] = [
  {
    persona: 'paciente',
    accent: 'from-[#a8544a] to-[#f7d9c6]',
    icon: UserRound,
  },
  {
    persona: 'apoiador',
    accent: 'from-[#245b53] to-[#c9e5dc]',
    icon: HeartHandshake,
  },
  {
    persona: 'instituicao',
    accent: 'from-[#584478] to-[#d8cdeb]',
    icon: Building2,
  },
];

function routeByRole(role: SandboxPersona | 'admin') {
  if (role === 'paciente') return '/paciente/dashboard';
  if (role === 'apoiador') return '/apoiador/dashboard';
  if (role === 'instituicao') return '/instituicao/dashboard';
  return '/admin';
}

export default function SandboxAccess() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [searchParams] = useSearchParams();
  const requestedPersona = searchParams.get('tipo');
  const preferredPersona = isSandboxPersona(requestedPersona) ? requestedPersona : null;
  const [loadingPersona, setLoadingPersona] = useState<SandboxPersona | null>(null);
  const [error, setError] = useState('');
  const [previewPersona, setPreviewPersona] = useState<SandboxPersona | null>(null);

  if (!isSandboxEnvironment()) {
    return <Navigate to="/" replace />;
  }

  async function handleSandboxLogin(persona: SandboxPersona, options?: { startTour?: boolean }) {
    setError('');
    setLoadingPersona(persona);
    if (options?.startTour) {
      queueSandboxTourLaunch(persona);
    }

    try {
      const session = await authApi.demoLogin({ persona });
      login(session);
      navigate(routeByRole(session.user.role));
    } catch {
      if (options?.startTour) {
        clearSandboxTourLaunch();
      }
      setError('Não foi possível abrir esta experiência agora. Tente novamente em instantes.');
    } finally {
      setLoadingPersona(null);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#fffaf4] px-4 py-10 text-[#241b24] sm:px-6"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(255,250,244,0.98), rgba(255,250,244,0.92)), url(${careTextureImage})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-6 rounded-[2.2rem] border border-[#eadfd2] bg-white/88 p-8 shadow-[0_30px_80px_rgba(92,62,51,0.1)] backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ecd8c8] bg-[#fff4d8] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.2em] text-[#a8544a]">
                <Sparkles className="h-3.5 w-3.5" />
                {sandboxExperienceConfig.page.badge}
              </div>
              <img src={logoImg} alt="NextDream" className="mb-5 h-12 w-auto" />
              <h1 className="mb-3 max-w-3xl text-4xl font-extrabold leading-[0.98] text-[#241b24] sm:text-5xl">
                {sandboxExperienceConfig.page.title}
              </h1>
              <p className="max-w-xl text-base font-semibold leading-7 text-[#5c4b52]">
                {sandboxExperienceConfig.page.description}
              </p>
            </div>
            <div className="rounded-3xl border border-[#c9e5dc] bg-[#e5f4ee]/88 p-5 text-sm text-[#245b53] md:max-w-sm">
              <div className="mb-3 flex items-center gap-2 text-[#245b53]">
                <ShieldCheck className="h-4 w-4" />
                <span className="font-extrabold">{sandboxExperienceConfig.page.trustTitle}</span>
              </div>
              <ul className="space-y-2 font-semibold leading-6 text-[#50645d]">
                {sandboxExperienceConfig.page.trustItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            const content = sandboxExperienceConfig.personas[card.persona];
            const selected = preferredPersona === card.persona;
            const loading = loadingPersona === card.persona;

            return (
              <section
                key={card.persona}
                className={`relative overflow-hidden rounded-[2rem] border bg-white p-6 shadow-[0_24px_60px_rgba(92,62,51,0.08)] transition-transform hover:-translate-y-1 ${
                  selected ? 'border-[#241b24]' : 'border-[#eadfd2]'
                }`}
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${card.accent}`} />
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className={`rounded-2xl bg-gradient-to-br ${card.accent} p-3 text-white shadow-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  {selected && (
                    <span className="rounded-full border border-[#c9e5dc] bg-[#e5f4ee] px-3 py-1 text-xs font-bold text-[#245b53]">
                      perfil sugerido
                    </span>
                  )}
                </div>
                <h2 className="mb-3 text-xl font-extrabold text-[#241b24]">{content.title}</h2>
                <p className="mb-6 min-h-24 text-sm font-semibold leading-7 text-[#5c4b52]">{content.summary}</p>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => void handleSandboxLogin(card.persona)}
                    disabled={loadingPersona !== null}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#245b53] px-4 py-3 text-center text-sm font-extrabold text-white transition-colors hover:bg-[#17453f] sm:whitespace-nowrap disabled:cursor-not-allowed disabled:bg-[#9ed0c1]"
                  >
                    {loading ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      content.primaryCta
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewPersona(card.persona)}
                    disabled={loadingPersona !== null}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#c9e5dc] bg-white px-4 py-3 text-center text-sm font-extrabold text-[#245b53] transition-colors hover:border-[#9ed0c1] hover:bg-[#effaf6] sm:whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <PlayCircle className="h-4 w-4" />
                    {content.tourCta}
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {previewPersona && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#241b24]/55 px-4 py-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Tour guiado do ${sandboxExperienceConfig.personas[previewPersona].title}`}
            className="w-full max-w-xl rounded-[2rem] border border-[#eadfd2] bg-[#fffaf4] p-6 shadow-[0_30px_80px_rgba(36,27,36,0.22)]"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#ecd8c8] bg-[#fff4d8] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-[#a8544a]">
                  <PlayCircle className="h-3.5 w-3.5" />
                  Tour guiado
                </div>
                <h2 className="text-2xl font-extrabold text-[#241b24]">
                  Tour guiado do {sandboxExperienceConfig.personas[previewPersona].title}
                </h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#5c4b52]">
                  Veja o que aparece, o que fazer primeiro e por que isso faz diferença antes de entrar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPersona(null)}
                className="rounded-full border border-[#eadfd2] bg-white p-2 text-[#5c4b52] transition-colors hover:bg-[#fff4d8] hover:text-[#8b3d44]"
                aria-label="Fechar tour"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-extrabold text-[#241b24]">O que você vai encontrar em cada etapa</p>
              {sandboxExperienceConfig.tours[previewPersona].map((step, index) => (
                <div key={step.id} className="flex items-start gap-3 rounded-2xl border border-[#eadfd2] bg-white/82 px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e5f4ee] text-sm font-extrabold text-[#245b53]">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-[#241b24]">{step.label}</p>
                    <p className="mt-1 text-sm font-semibold text-[#5c4b52]">{step.title}</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-[#7a6d72]">{step.see}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPreviewPersona(null)}
                className="rounded-full border border-[#eadfd2] bg-white px-4 py-3 text-sm font-extrabold text-[#5c4b52] transition-colors hover:bg-[#fff4d8]"
              >
                Agora não
              </button>
              <button
                type="button"
                onClick={() => void handleSandboxLogin(previewPersona, { startTour: true })}
                disabled={loadingPersona !== null}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#245b53] px-4 py-3 text-center text-sm font-extrabold text-white transition-colors hover:bg-[#17453f] sm:whitespace-nowrap disabled:cursor-not-allowed disabled:bg-[#9ed0c1]"
              >
                {loadingPersona === previewPersona ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  sandboxExperienceConfig.personas[previewPersona].tourStartCta
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
