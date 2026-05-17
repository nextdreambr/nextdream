import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Building2,
  Coffee,
  Heart,
  HeartHandshake,
  HelpCircle,
  LockKeyhole,
  Mail,
  MapPinned,
  MessageCircle,
  PenLine,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import careTexture from '../../../assets/public/rede-de-cuidado-textura.webp';
import { cn } from '../ui/utils';

type EditorialVisualKind =
  | 'partnerships'
  | 'partnershipsCare'
  | 'howItWorks'
  | 'careMemory'
  | 'security'
  | 'faq'
  | 'contact';

type PublicEditorialVisualProps = {
  kind: EditorialVisualKind;
  size?: 'hero' | 'compact';
  className?: string;
};

type SymbolMarkProps = {
  icon: LucideIcon;
  className: string;
  tone?: 'sage' | 'rose' | 'cream' | 'dark';
  size?: 'sm' | 'md' | 'lg';
};

const visualAlt: Record<EditorialVisualKind, string> = {
  partnerships: 'Composição editorial com território, comunidade e presença conectados por linhas suaves de cuidado.',
  partnershipsCare: 'Composição editorial de território e rede de cuidado conectados sem aparência de interface.',
  howItWorks: 'Composição editorial com uma carta, um fio de cuidado e símbolos de compartilhar, cuidar, combinar e encontrar.',
  careMemory: 'Composição editorial de uma memória afetiva com livro, café e pequenos sinais de presença.',
  security: 'Composição editorial de camadas de privacidade, autonomia e consentimento protegendo uma história.',
  faq: 'Composição editorial de páginas, marcações e perguntas acolhidas sem simular busca ou sistema.',
  contact: 'Composição editorial de carta, escuta e resposta humana sem simular painel de mensagens.',
};

function SymbolMark({ icon: Icon, className, tone = 'sage', size = 'md' }: SymbolMarkProps) {
  const tones = {
    sage: 'bg-[#e5f4ee] text-[#245b53] ring-[#c9e5dc]',
    rose: 'bg-[#fff0e8] text-[#a8544a] ring-[#f4cbbd]',
    cream: 'bg-[#fff8ef] text-[#8b6b2c] ring-[#eddcc6]',
    dark: 'bg-[#245b53] text-white ring-white/60',
  };

  const sizes = {
    sm: 'h-10 w-10',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <span
      className={cn(
        'absolute z-20 flex items-center justify-center rounded-full ring-1 shadow-[0_16px_36px_rgba(92,62,51,0.13)]',
        tones[tone],
        sizes[size],
        className,
      )}
      aria-hidden
    >
      <Icon className={size === 'lg' ? 'h-7 w-7' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />
    </span>
  );
}

function BrushOrb({ className }: { className: string }) {
  return <span className={cn('absolute rounded-full blur-2xl', className)} aria-hidden />;
}

function ThreadCurve({ className, path }: { className?: string; path: string }) {
  return (
    <svg className={cn('absolute z-10 overflow-visible', className)} viewBox="0 0 100 100" aria-hidden>
      <path d={path} fill="none" stroke="#245b53" strokeLinecap="round" strokeWidth="1.8" strokeDasharray="3 5" opacity="0.48" />
      <path d={path} fill="none" stroke="#a8544a" strokeLinecap="round" strokeWidth="0.7" opacity="0.28" />
    </svg>
  );
}

function PaperShape({ className, children }: { className: string; children?: ReactNode }) {
  return (
    <div
      className={cn(
        'absolute z-10 rounded-[2rem] border border-[#ecd8c8]/70 bg-[#fffaf4]/82 shadow-[0_22px_60px_rgba(92,62,51,0.1)]',
        className,
      )}
      aria-hidden
    >
      {children}
    </div>
  );
}

function PaperLines() {
  return (
    <div className="absolute inset-x-6 top-8 space-y-3" aria-hidden>
      <span className="block h-1.5 w-2/3 rounded-full bg-[#d7c7b9]/55" />
      <span className="block h-1.5 w-full rounded-full bg-[#d7c7b9]/42" />
      <span className="block h-1.5 w-5/6 rounded-full bg-[#d7c7b9]/38" />
    </div>
  );
}

function HowItWorksScene() {
  return (
    <>
      <BrushOrb className="-left-12 top-8 h-48 w-48 bg-[#fff4d8]/80" />
      <BrushOrb className="right-0 top-12 h-52 w-52 bg-[#c9e5dc]/70" />
      <BrushOrb className="bottom-0 left-1/3 h-40 w-40 bg-[#f4cbbd]/42" />

      <PaperShape className="left-[9%] top-[16%] h-[44%] w-[42%] -rotate-6">
        <PaperLines />
        <PenLine className="absolute bottom-7 right-7 h-8 w-8 text-[#a8544a]/72" />
      </PaperShape>

      <ThreadCurve className="left-[24%] top-[22%] h-[58%] w-[58%]" path="M8 18 C34 4, 38 46, 56 38 S76 46, 90 78" />

      <SymbolMark icon={BookOpen} tone="rose" className="left-[15%] top-[22%]" />
      <SymbolMark icon={ShieldCheck} tone="cream" className="left-[47%] top-[34%]" />
      <SymbolMark icon={MessageCircle} tone="sage" className="right-[19%] top-[43%]" />
      <SymbolMark icon={HeartHandshake} tone="rose" className="right-[12%] bottom-[17%]" size="lg" />

      <Sparkles className="absolute bottom-[16%] left-[18%] z-20 h-6 w-6 text-[#a8544a]/70" aria-hidden />
    </>
  );
}

function PartnershipsScene({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <BrushOrb className="-left-10 top-8 h-44 w-44 bg-[#fff4d8]/75" />
      <BrushOrb className="right-6 top-10 h-52 w-52 bg-[#c9e5dc]/72" />
      <BrushOrb className="bottom-0 left-[24%] h-44 w-44 bg-[#f4cbbd]/38" />

      <div className={cn('absolute left-[11%] top-[15%] z-10 rounded-[45%_55%_48%_52%] border border-[#d7c7b9]/55 bg-[#fffaf4]/58', compact ? 'h-48 w-48' : 'h-64 w-64')} aria-hidden />
      <div className={cn('absolute right-[9%] bottom-[12%] z-10 rounded-[58%_42%_52%_48%] border border-[#b9d9d0]/60 bg-[#e5f4ee]/48', compact ? 'h-36 w-36' : 'h-52 w-52')} aria-hidden />

      <ThreadCurve className="left-[18%] top-[18%] h-[65%] w-[66%]" path="M10 72 C28 20, 50 18, 62 42 S79 76, 92 28" />
      <ThreadCurve className="left-[20%] top-[27%] h-[48%] w-[58%]" path="M5 18 C25 58, 54 12, 93 70" />

      <SymbolMark icon={Building2} tone="cream" className="left-[18%] top-[25%]" size={compact ? 'sm' : 'md'} />
      <SymbolMark icon={Users} tone="sage" className="right-[22%] top-[20%]" size={compact ? 'sm' : 'md'} />
      <SymbolMark icon={MapPinned} tone="rose" className="left-[30%] bottom-[22%]" size={compact ? 'sm' : 'md'} />
      <SymbolMark icon={HeartHandshake} tone="dark" className="right-[17%] bottom-[24%]" size={compact ? 'md' : 'lg'} />
    </>
  );
}

function CareMemoryScene() {
  return (
    <>
      <BrushOrb className="left-4 top-12 h-44 w-44 bg-[#fff4d8]/75" />
      <BrushOrb className="right-8 top-20 h-44 w-44 bg-[#c9e5dc]/68" />
      <ThreadCurve className="left-[18%] top-[26%] h-[54%] w-[62%]" path="M8 78 C26 48, 36 24, 54 44 S76 68, 92 18" />
      <PaperShape className="left-[17%] top-[18%] h-[36%] w-[34%] -rotate-6">
        <BookOpen className="absolute left-6 top-6 h-8 w-8 text-[#a8544a]/70" />
      </PaperShape>
      <SymbolMark icon={Coffee} tone="sage" className="right-[19%] top-[31%]" />
      <SymbolMark icon={Sparkles} tone="rose" className="left-[31%] bottom-[20%]" />
      <SymbolMark icon={Heart} tone="cream" className="right-[30%] bottom-[18%]" />
    </>
  );
}

function SecurityScene() {
  return (
    <>
      <BrushOrb className="-left-10 top-10 h-52 w-52 bg-[#c9e5dc]/72" />
      <BrushOrb className="right-0 bottom-4 h-48 w-48 bg-[#fff4d8]/72" />

      <div className="absolute left-[18%] top-[13%] z-10 h-[70%] w-[56%] rounded-[48%_52%_45%_55%] border border-[#b9d9d0]/65 bg-[#e5f4ee]/42" aria-hidden />
      <div className="absolute left-[26%] top-[22%] z-10 h-[52%] w-[42%] rounded-[45%_55%_50%_50%] border border-white/70 bg-white/34" aria-hidden />
      <ThreadCurve className="left-[25%] top-[21%] h-[48%] w-[45%]" path="M18 78 C16 40, 40 14, 62 24 S86 54, 72 82" />

      <SymbolMark icon={LockKeyhole} tone="dark" className="left-[41%] top-[36%]" size="lg" />
      <SymbolMark icon={ShieldCheck} tone="sage" className="left-[22%] top-[28%]" />
      <SymbolMark icon={Heart} tone="rose" className="right-[24%] bottom-[24%]" />
      <SymbolMark icon={MessageCircle} tone="cream" className="left-[27%] bottom-[19%]" size="sm" />
    </>
  );
}

function FAQScene() {
  return (
    <>
      <BrushOrb className="-left-8 top-8 h-48 w-48 bg-[#fff4d8]/76" />
      <BrushOrb className="right-8 top-14 h-44 w-44 bg-[#c9e5dc]/68" />

      <PaperShape className="left-[16%] top-[18%] h-[54%] w-[34%] rotate-[-7deg]">
        <PaperLines />
      </PaperShape>
      <PaperShape className="right-[15%] top-[23%] h-[50%] w-[32%] rotate-[6deg]">
        <div className="absolute inset-x-6 top-8 space-y-4" aria-hidden>
          <span className="block h-1.5 w-full rounded-full bg-[#b9d9d0]/60" />
          <span className="block h-1.5 w-3/4 rounded-full bg-[#b9d9d0]/45" />
          <span className="block h-1.5 w-5/6 rounded-full bg-[#b9d9d0]/38" />
        </div>
      </PaperShape>

      <ThreadCurve className="left-[25%] top-[30%] h-[40%] w-[50%]" path="M4 70 C32 18, 54 82, 96 24" />
      <SymbolMark icon={HelpCircle} tone="rose" className="left-[28%] top-[26%]" />
      <SymbolMark icon={BookOpen} tone="sage" className="right-[30%] top-[37%]" />
      <SymbolMark icon={PenLine} tone="cream" className="left-[42%] bottom-[22%]" size="sm" />
    </>
  );
}

function ContactScene() {
  return (
    <>
      <BrushOrb className="-left-8 top-8 h-48 w-48 bg-[#fff4d8]/80" />
      <BrushOrb className="right-0 top-12 h-52 w-52 bg-[#c9e5dc]/68" />

      <div className="absolute left-[18%] top-[22%] z-10 h-[46%] w-[44%] rotate-[-6deg] rounded-[1.2rem] border border-[#ecd8c8]/70 bg-[#fffaf4]/80 shadow-[0_22px_60px_rgba(92,62,51,0.1)]" aria-hidden>
        <div className="absolute left-0 right-0 top-0 h-1/2 rounded-t-[1.2rem] border-b border-[#ecd8c8]/70 bg-[#fff4d8]/46" />
        <Mail className="absolute left-7 top-7 h-8 w-8 text-[#a8544a]/76" />
      </div>

      <ThreadCurve className="left-[28%] top-[30%] h-[44%] w-[54%]" path="M6 24 C30 10, 42 70, 62 44 S82 22, 94 74" />
      <SymbolMark icon={MessageCircle} tone="sage" className="right-[22%] top-[30%]" />
      <SymbolMark icon={Coffee} tone="cream" className="right-[33%] bottom-[22%]" />
      <SymbolMark icon={Heart} tone="rose" className="left-[33%] bottom-[20%]" />
    </>
  );
}

export function PublicEditorialVisual({ kind, size = 'hero', className }: PublicEditorialVisualProps) {
  const compact = size === 'compact';

  return (
    <div
      role="img"
      aria-label={visualAlt[kind]}
      className={cn(
        'public-organic-radius relative w-full overflow-hidden bg-[#fff8ef] shadow-[0_28px_80px_rgba(92,62,51,0.11)]',
        compact ? 'h-[280px] sm:h-[340px]' : 'h-[340px] sm:h-[460px]',
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(255, 248, 239, 0.96), rgba(229, 244, 238, 0.78)), url(${careTexture})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,244,216,0.72),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(201,229,220,0.56),transparent_28%),linear-gradient(145deg,transparent,rgba(168,84,74,0.055))]" />
      <div className="absolute inset-5 rounded-[2rem] border border-white/32" aria-hidden />

      {kind === 'partnerships' ? <PartnershipsScene compact={compact} /> : null}
      {kind === 'partnershipsCare' ? <PartnershipsScene compact /> : null}
      {kind === 'howItWorks' ? <HowItWorksScene /> : null}
      {kind === 'careMemory' ? <CareMemoryScene /> : null}
      {kind === 'security' ? <SecurityScene /> : null}
      {kind === 'faq' ? <FAQScene /> : null}
      {kind === 'contact' ? <ContactScene /> : null}
    </div>
  );
}
