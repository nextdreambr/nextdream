import { KeyboardEvent } from 'react';
import { MapPin, Users, Video, MapPinned, ChevronRight, HeartHandshake } from 'lucide-react';
import { DreamStatusBadge, ProposalStatusBadge } from './StatusBadge';
import { getSafeDreamVisual, SafeDreamArtwork } from './SafeDreamVisual';
import { DreamLanguageAssist } from './DreamLanguageAssist';
import { type DreamLanguage, type DreamTranslation } from '../../lib/api';

interface DreamCardProps {
  dream: {
    id: string;
    title: string;
    description: string;
    originalLanguage?: DreamLanguage;
    translations?: Partial<Record<DreamLanguage, DreamTranslation>>;
    category: string;
    format: 'remoto' | 'presencial' | 'ambos';
    urgency: 'baixa' | 'media' | 'alta';
    status: 'rascunho' | 'publicado' | 'em-conversa' | 'realizando' | 'concluido' | 'pausado' | 'cancelado';
    patientCity?: string;
    tags?: string[];
    proposalsCount?: number;
    proposalStatus?: 'enviada' | 'em-analise' | 'aceita' | 'recusada' | 'expirada';
  };
  onClick?: () => void;
  variant?: 'supporter' | 'patient';
  showStatus?: boolean;
}

export function DreamCard({ dream, onClick, showStatus = false }: DreamCardProps) {
  const visual = getSafeDreamVisual(dream.category);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className="group cursor-pointer overflow-hidden rounded-[1.65rem] border border-[#eadfd2] bg-white shadow-[0_18px_52px_rgba(92,62,51,0.07)] transition-all hover:-translate-y-0.5 hover:border-[#c9e5dc] hover:shadow-[0_22px_60px_rgba(36,91,83,0.1)] focus-visible:ring-2 focus-visible:ring-[#a8544a]/35"
    >
      <div className="relative aspect-[2.1] overflow-hidden">
        <SafeDreamArtwork scene={visual.scene} alt={visual.alt} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#241b24]/55 via-transparent to-transparent" />
        <div className="absolute left-4 right-4 top-4 flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-[#fff4d8]/94 px-3 py-1 text-xs font-extrabold text-[#8b3d44] shadow-sm backdrop-blur">
            {dream.category}
          </span>
          {showStatus && <DreamStatusBadge status={dream.status} />}
        </div>
      </div>

      <DreamLanguageAssist dream={dream} variant="card">
        {({ title, description, controls }) => (
      <div className="p-5">
        <div className="mb-3 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff4d8] text-[#a8544a]">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 text-sm font-extrabold leading-snug text-[#241b24] transition-colors group-hover:text-[#8b3d44]">
                {title}
              </h3>
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#9b8e88] transition-colors group-hover:text-[#a8544a]" />
            </div>
            <p className="mt-0.5 text-xs font-bold text-[#245b53]">{visual.supportType}</p>
          </div>
        </div>

        <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-[#5c4b52]">{description}</p>
        {controls}

        <div className="mb-3 flex flex-wrap gap-1.5">
          {(dream.tags ?? []).filter((tag) => tag !== dream.urgency).slice(0, 3).map(tag => (
            <span key={tag} className="rounded-full bg-[#fff8ef] px-2 py-0.5 text-xs font-semibold text-[#6b5d63]">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-[#66585e]">
            {dream.patientCity && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {dream.patientCity}
            </span>
          )}
          <span className="flex items-center gap-1">
            {dream.format === 'remoto' ? <Video className="w-3 h-3" /> : dream.format === 'presencial' ? <MapPinned className="w-3 h-3" /> : <Users className="w-3 h-3" />}
            {dream.format === 'remoto' ? 'Online' : dream.format === 'presencial' ? 'Presencial' : 'Ambos'}
          </span>
          {(dream.proposalsCount ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {dream.proposalsCount} {dream.proposalsCount === 1 ? 'proposta' : 'propostas'}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
            {dream.proposalStatus && <ProposalStatusBadge status={dream.proposalStatus} />}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-[#e5f4ee] px-3 py-2 text-xs font-bold leading-relaxed text-[#245b53]">
          Apoio esperado: presença, tempo, companhia ou habilidade. Não envolve dinheiro.
        </div>
      </div>
        )}
      </DreamLanguageAssist>
    </div>
  );
}
