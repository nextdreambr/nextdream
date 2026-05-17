import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  HandHeart,
  HeartHandshake,
  LockKeyhole,
  MapPin,
  Quote,
  ShieldCheck,
  Star,
  UsersRound,
} from 'lucide-react';
import { HomeHero } from '../components/home/HomeHero';
import { getSafeDreamVisual, SafeDreamArtwork, type SafeDreamScene } from '../components/shared/SafeDreamVisual';
import { dreamsApi, type PublicDream } from '../lib/api';
import careTextureImage from '../../assets/public/rede-de-cuidado-textura.webp';

type Step = {
  icon: LucideIcon;
  title: string;
  text: string;
};

type DreamPreview = {
  id: string;
  title: string;
  description: string;
  category: string;
  supportType: string;
  formatLabel: string;
  location?: string;
  status: string;
  href: string;
  source: 'api' | 'fallback';
  visualScene: SafeDreamScene;
  imageAlt: string;
};

const fallbackDreamPreviews: DreamPreview[] = [
  {
    id: 'preview-musica',
    title: 'Uma tarde com música ao vivo',
    description: 'Uma família gostaria de organizar um momento leve com música e presença.',
    category: 'Arte e Música',
    supportType: getSafeDreamVisual('Arte e Música').supportType,
    formatLabel: 'Presencial ou online',
    location: 'Localidade aproximada combinada depois',
    status: 'Exemplo seguro',
    href: '/apoiador/explorar',
    source: 'fallback',
    visualScene: getSafeDreamVisual('Arte e Música').scene,
    imageAlt: getSafeDreamVisual('Arte e Música').alt,
  },
  {
    id: 'preview-conversa',
    title: 'Visita para conversar sobre futebol',
    description: 'Um momento de conversa e companhia para tornar a semana mais leve.',
    category: 'Conversa e Companhia',
    supportType: getSafeDreamVisual('Conversa e Companhia').supportType,
    formatLabel: 'Presencial ou online',
    location: 'Localidade aproximada combinada depois',
    status: 'Exemplo seguro',
    href: '/apoiador/explorar',
    source: 'fallback',
    visualScene: getSafeDreamVisual('Conversa e Companhia').scene,
    imageAlt: getSafeDreamVisual('Conversa e Companhia').alt,
  },
  {
    id: 'preview-desenho',
    title: 'Oficina de desenho em família',
    description: 'Uma experiência simples e criativa, pensada com cuidado para uma pessoa e sua família.',
    category: 'Aprendizado e Educação',
    supportType: getSafeDreamVisual('Aprendizado e Educação').supportType,
    formatLabel: 'Presencial ou online',
    location: 'Localidade aproximada combinada depois',
    status: 'Exemplo seguro',
    href: '/apoiador/explorar',
    source: 'fallback',
    visualScene: getSafeDreamVisual('Aprendizado e Educação').scene,
    imageAlt: getSafeDreamVisual('Aprendizado e Educação').alt,
  },
];

const steps: Step[] = [
  {
    icon: Star,
    title: 'Compartilhe um sonho',
    text: 'Uma pessoa ou família conta uma cena possível.',
  },
  {
    icon: ShieldCheck,
    title: 'Cuidado antes de expor',
    text: 'A história respeita privacidade, limites e consentimento.',
  },
  {
    icon: HandHeart,
    title: 'Apoio pode virar conversa',
    text: 'Apoiadores oferecem presença, tempo ou habilidades possíveis.',
  },
];

const paths = [
  {
    icon: Star,
    title: 'Compartilhar um sonho',
    text: 'Conte uma história com cuidado e privacidade.',
    cta: 'Começar com cuidado',
    to: '/cadastro?tipo=paciente',
    tone: 'bg-[#fff4d8] border-[#efd7ac] text-[#8b3d44]',
  },
  {
    icon: HeartHandshake,
    title: 'Apoiar alguém',
    text: 'Ofereça presença, tempo ou uma habilidade.',
    cta: 'Quero apoiar',
    to: '/apoiador/explorar',
    tone: 'bg-[#e5f4ee] border-[#b7d8cd] text-[#245b53]',
  },
  {
    icon: Building2,
    title: 'Instituição ou comunidade',
    text: 'Ajude sonhos a encontrarem caminhos seguros.',
    cta: 'Conversar sobre parceria',
    to: '/parcerias',
    tone: 'bg-[#f6f0ff] border-[#d8cdeb] text-[#584478]',
  },
];

const formatLabels: Record<PublicDream['format'], string> = {
  remoto: 'Online',
  presencial: 'Presencial',
  ambos: 'Presencial ou online',
};

function toDreamPreview(dream: PublicDream): DreamPreview {
  const visual = getSafeDreamVisual(dream.category);

  return {
    id: dream.id,
    title: dream.title,
    description: dream.description,
    category: dream.category,
    supportType: visual.supportType,
    formatLabel: formatLabels[dream.format],
    location: dream.patientCity,
    status: 'História publicada',
    href: `/sonhos/${dream.id}`,
    source: 'api',
    visualScene: visual.scene,
    imageAlt: visual.alt,
  };
}

function useDreamPreviews() {
  const [dreams, setDreams] = useState<PublicDream[] | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDreams() {
      try {
        const items = await dreamsApi.listPublic();
        if (!active) return;
        setDreams(items);
      } catch {
        if (!active) return;
        setDreams([]);
      }
    }

    void loadDreams();

    return () => {
      active = false;
    };
  }, []);

  return useMemo(() => {
    if (dreams === null) return [];

    const previews = dreams
      .filter((dream) => dream.status === 'publicado' && dream.privacy === 'publico')
      .slice(0, 3)
      .map(toDreamPreview);

    return previews.length > 0 ? previews : fallbackDreamPreviews;
  }, [dreams]);
}

function SectionKicker({ children }: { children: string }) {
  return (
    <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-[#a8544a]">
      {children}
    </p>
  );
}

function DreamPreviewCard({ dream }: { dream: DreamPreview }) {
  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-[1.85rem] border border-[#eadfd2] bg-white shadow-[0_22px_64px_rgba(92,62,51,0.09)] transition-transform hover:-translate-y-1"
    >
      <div className="relative aspect-[1.34] shrink-0 overflow-hidden">
        <SafeDreamArtwork scene={dream.visualScene} alt={dream.imageAlt} className="min-h-[14rem]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#241b24]/58 via-transparent to-transparent" />
        <div className="absolute left-4 right-4 top-4 flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-[#fff4d8]/94 px-3 py-1 text-xs font-extrabold text-[#8b3d44] shadow-sm backdrop-blur">
            {dream.category}
          </span>
          <span className="rounded-full bg-[#e5f4ee]/94 px-3 py-1 text-xs font-extrabold text-[#245b53] shadow-sm backdrop-blur">
            {dream.status}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 min-h-[3.75rem] text-2xl font-extrabold leading-tight text-[#241b24]">
          {dream.title}
        </h3>
        <p className="mt-3 min-h-[4.875rem] line-clamp-3 text-sm font-semibold leading-relaxed text-[#5c4b52] md:text-base">
          {dream.description}
        </p>

        <div className="mt-5 grid min-h-[4.5rem] content-start gap-2 text-sm font-bold text-[#66585e] sm:grid-cols-2">
          <p className="inline-flex items-center gap-2">
            <UsersRound className="h-4 w-4 text-[#a8544a]" />
            {dream.supportType}
          </p>
          <p className="inline-flex items-center gap-2">
            <HeartHandshake className="h-4 w-4 text-[#245b53]" />
            {dream.formatLabel}
          </p>
          {dream.location && (
            <p className="inline-flex items-center gap-2 sm:col-span-2">
              <MapPin className="h-4 w-4 text-[#245b53]" />
              {dream.location}
            </p>
          )}
        </div>

        <div className="mt-5 flex min-h-[4rem] items-center rounded-2xl bg-[#e5f4ee] px-4 py-3 text-sm font-extrabold leading-relaxed text-[#245b53]">
          Apoio por presença, tempo ou habilidade.
        </div>

        <Link
          to={dream.href}
          className="mt-auto inline-flex min-h-[3.5rem] items-center gap-2 pt-5 text-sm font-extrabold text-[#a8544a] transition-colors hover:text-[#8b3d44]"
        >
          {dream.source === 'api' ? 'Ver detalhes' : 'Ver sonhos'}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function CareLineStep({ step, index, isLast }: { step: Step; index: number; isLast: boolean }) {
  return (
    <li className="relative h-full">
      {!isLast && (
        <div
          className="absolute left-6 top-14 h-[calc(100%+1rem)] w-px bg-[#b7d8cd] md:left-1/2 md:top-8 md:h-px md:w-full"
          aria-hidden
        />
      )}
      <div className="relative flex h-full flex-col rounded-[1.45rem] border border-white/70 bg-white/82 p-5 shadow-[0_18px_52px_rgba(49,91,78,0.08)] backdrop-blur md:min-h-[14rem]">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#245b53] text-white shadow-[0_12px_28px_rgba(36,91,83,0.18)]">
            <step.icon className="h-5 w-5" />
          </div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#a8544a]">Passo {index + 1}</p>
        </div>
        <h3 className="text-xl font-extrabold leading-tight">{step.title}</h3>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-[#50645d]">{step.text}</p>
      </div>
    </li>
  );
}

export default function Landing() {
  const dreamPreviews = useDreamPreviews();

  return (
    <div className="overflow-x-hidden bg-[#fffaf4] text-[#241b24]">
      <HomeHero />

      <section
        id="sonhos"
        className="relative overflow-hidden px-4 py-14 sm:px-6 lg:py-20"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(255,250,244,0.98), rgba(255,250,244,0.9)), url(${careTextureImage})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute right-0 top-10 hidden h-80 w-32 rounded-l-[4rem] bg-[#f7d9c6]/70 lg:block" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-9 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
            <div className="max-w-3xl">
              <SectionKicker>Sonhos cadastrados</SectionKicker>
              <h2 className="text-4xl font-extrabold leading-[0.98] md:text-6xl">
                Histórias públicas, mostradas com cuidado.
              </h2>
              <p className="mt-4 max-w-2xl text-base font-semibold leading-relaxed text-[#5c4b52] md:text-lg">
                Uma prévia de sonhos públicos que podem encontrar apoio por presença, tempo ou habilidade.
              </p>
            </div>
            <Link
              to="/apoiador/explorar"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#c9e5dc] bg-white px-5 py-3 text-sm font-extrabold text-[#245b53] shadow-sm transition-colors hover:bg-[#effaf6]"
            >
              Ver todos os sonhos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-3 lg:items-stretch">
            {dreamPreviews.map((dream) => (
              <DreamPreviewCard key={dream.id} dream={dream} />
            ))}
          </div>
        </div>
      </section>

      <section
        className="relative overflow-hidden bg-[#e8f4ee] px-4 py-14 sm:px-6 lg:py-20"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(232,244,238,0.95), rgba(255,248,239,0.72)), url(${careTextureImage})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.68fr_1.32fr] lg:items-center">
          <div>
            <SectionKicker>Como funciona</SectionKicker>
            <h2 className="text-4xl font-extrabold leading-[0.98] md:text-6xl">
              Uma linha de cuidado até o encontro.
            </h2>
            <p className="mt-5 max-w-xl text-base font-semibold leading-relaxed text-[#50645d]">
              O fluxo evita pressa: primeiro escuta, depois privacidade, então uma proposta possível.
            </p>
          </div>

          <ol className="relative grid items-stretch gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <CareLineStep key={step.title} step={step} index={index} isLast={index === steps.length - 1} />
            ))}
          </ol>
        </div>
      </section>

      <section className="px-4 pb-8 pt-14 sm:px-6 lg:pb-10 lg:pt-20">
        <div className="mx-auto grid max-w-7xl gap-6 rounded-[2rem] border border-[#eadfd2] bg-[#fff8ef]/92 p-4 shadow-[0_18px_54px_rgba(92,62,51,0.06)] md:p-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-stretch">
          <div className="flex flex-col justify-between rounded-[1.45rem] border border-white/70 bg-white/68 p-6">
            <div>
              <SectionKicker>Caminhos principais</SectionKicker>
              <h2 className="text-4xl font-extrabold leading-[0.98] md:text-5xl">
                Escolha como estar perto.
              </h2>
            </div>
            <p className="mt-5 text-base font-semibold leading-relaxed text-[#5c4b52]">
              Três portas simples para começar com cuidado, apoiar uma história ou construir uma parceria segura.
            </p>
          </div>

          <div className="grid items-stretch gap-4 md:grid-cols-3">
            {paths.map((path) => (
              <Link
                key={path.title}
                to={path.to}
                className={`group relative flex h-full min-h-[16.5rem] overflow-hidden rounded-[1.45rem] border p-5 transition-transform hover:-translate-y-1 ${path.tone}`}
              >
                <span className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/45" />
                <span className="absolute bottom-4 left-5 right-5 h-px bg-current/18" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/78 shadow-sm">
                    <path.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold leading-tight">{path.title}</h3>
                    <p className="mt-3 text-sm font-bold leading-relaxed text-[#5c4b52]">{path.text}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold">
                      {path.cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 pt-0 sm:px-6 lg:pb-20">
        <div
          className="mx-auto grid max-w-7xl gap-6 overflow-hidden rounded-[2rem] border border-[#eadfd2] bg-[#fff8ef] p-5 text-[#241b24] shadow-[0_18px_58px_rgba(92,62,51,0.07)] md:p-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(255,248,239,0.94), rgba(229,244,238,0.82)), url(${careTextureImage})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
          <div>
            <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-[#a8544a] shadow-sm">
              <Quote className="h-5 w-5" />
            </span>
            <SectionKicker>Segurança e consentimento</SectionKicker>
            <h2 className="max-w-2xl text-3xl font-extrabold leading-[1.02] text-[#241b24] md:text-4xl">
              Cada história merece cuidado antes de virar encontro.
            </h2>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-relaxed text-[#5c4b52]">
              Nenhuma exposição acontece sem consentimento. A conexão só avança com privacidade,
              respeito aos limites e apoio por presença, tempo ou habilidade.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: LockKeyhole, text: 'Privacidade primeiro' },
              { icon: ShieldCheck, text: 'Consentimento antes de qualquer exposição' },
              { icon: CheckCircle2, text: 'Apoio por presença, tempo ou habilidade' },
            ].map((item) => (
              <div key={item.text} className="rounded-[1.2rem] border border-white/80 bg-white/72 p-4 text-[#245b53] shadow-sm backdrop-blur">
                <item.icon className="mb-4 h-5 w-5 text-[#a8544a]" />
                <p className="text-sm font-extrabold leading-relaxed text-[#245b53]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
