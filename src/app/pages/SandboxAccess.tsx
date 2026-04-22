import { useState, type ComponentType } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { Building2, HeartHandshake, PlayCircle, ShieldCheck, Sparkles, UserRound, X } from 'lucide-react';
import { sandboxExperienceConfig, isSandboxPersona } from '../config/sandboxExperience';
import { isSandboxEnvironment } from '../config/environment';
import { useApp } from '../context/AppContext';
import { authApi, SandboxPersona } from '../lib/api';
import { clearSandboxTourLaunch, queueSandboxTourLaunch } from '../lib/sandboxTourSession';
import logoImg from '../../assets/df29d28e06eae9a96d131fc75e2fd7064bd951d1.png';

type PersonaCard = {
  persona: SandboxPersona;
  accent: string;
  icon: ComponentType<{ className?: string }>;
};

const cards: PersonaCard[] = [
  {
    persona: 'paciente',
    accent: 'from-pink-500 to-rose-500',
    icon: UserRound,
  },
  {
    persona: 'apoiador',
    accent: 'from-teal-500 to-cyan-500',
    icon: HeartHandshake,
  },
  {
    persona: 'instituicao',
    accent: 'from-indigo-500 to-sky-500',
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7ed_0%,#fff7ed_18%,#fff_52%,#f8fafc_100%)] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-6 rounded-[2rem] border border-amber-100 bg-white/90 p-8 shadow-[0_30px_80px_rgba(245,158,11,0.12)] backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                <Sparkles className="h-3.5 w-3.5" />
                {sandboxExperienceConfig.page.badge}
              </div>
              <img src={logoImg} alt="NextDream" className="mb-5 h-12 w-auto" />
              <h1 className="mb-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {sandboxExperienceConfig.page.title}
              </h1>
              <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                {sandboxExperienceConfig.page.description}
              </p>
            </div>
            <div className="rounded-3xl border border-amber-100 bg-amber-50/80 p-5 text-sm text-amber-950 md:max-w-sm">
              <div className="mb-3 flex items-center gap-2 text-amber-800">
                <ShieldCheck className="h-4 w-4" />
                <span className="font-semibold">{sandboxExperienceConfig.page.trustTitle}</span>
              </div>
              <ul className="space-y-2 leading-6 text-amber-900/80">
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
                className={`relative overflow-hidden rounded-[2rem] border bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] transition-transform hover:-translate-y-1 ${
                  selected ? 'border-slate-900' : 'border-slate-100'
                }`}
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${card.accent}`} />
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className={`rounded-2xl bg-gradient-to-br ${card.accent} p-3 text-white shadow-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  {selected && (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                      perfil sugerido
                    </span>
                  )}
                </div>
                <h2 className="mb-3 text-xl font-semibold text-slate-950">{content.title}</h2>
                <p className="mb-6 min-h-24 text-sm leading-7 text-slate-600">{content.summary}</p>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => void handleSandboxLogin(card.persona)}
                    disabled={loadingPersona !== null}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:whitespace-nowrap disabled:cursor-not-allowed disabled:bg-slate-400"
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
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 sm:whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Tour guiado do ${sandboxExperienceConfig.personas[previewPersona].title}`}
            className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                  <PlayCircle className="h-3.5 w-3.5" />
                  Tour guiado
                </div>
                <h2 className="text-2xl font-semibold text-slate-950">
                  Tour guiado do {sandboxExperienceConfig.personas[previewPersona].title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Veja como a jornada funciona antes de entrar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPersona(null)}
                className="rounded-full border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                aria-label="Fechar tour"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-900">O que você vai ver em cada etapa</p>
              {sandboxExperienceConfig.tours[previewPersona].map((step, index) => (
                <div key={step.id} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{step.label}</p>
                    <p className="mt-1 text-sm text-slate-600">{step.title}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPreviewPersona(null)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Agora não
              </button>
              <button
                type="button"
                onClick={() => void handleSandboxLogin(previewPersona, { startTour: true })}
                disabled={loadingPersona !== null}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:whitespace-nowrap disabled:cursor-not-allowed disabled:bg-slate-400"
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
