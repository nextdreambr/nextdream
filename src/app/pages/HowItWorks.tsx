import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  HandHeart,
  Heart,
  Lock,
  MessageCircle,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';
import { PublicEditorialVisual } from '../components/public/PublicEditorialVisual';
import { CareCallout, PublicPageHero, SectionHeader, WarmSection } from '../components/public/PublicPagePrimitives';

const journeyPhases = [
  {
    icon: BookOpen,
    title: 'Conta com calma',
    text: 'A pessoa ou família compartilha o sonho no próprio ritmo.',
  },
  {
    icon: ShieldCheck,
    title: 'Protege o sensível',
    text: 'A história evita dados íntimos e só mostra o que tem consentimento.',
  },
  {
    icon: HandHeart,
    title: 'Recebe propostas',
    text: 'Apoiadores dizem como podem oferecer presença, tempo ou habilidade.',
  },
  {
    icon: MessageCircle,
    title: 'Combina o encontro',
    text: 'A conversa abre após aceite para ajustar limites, formato e cuidado.',
  },
];

const audienceGuides = [
  {
    icon: Star,
    title: 'Quem compartilha',
    intro: 'Continua no controle da história.',
    bullets: [
      'Conta apenas o que se sentir confortável.',
      'Pode aceitar, recusar ou aguardar uma proposta.',
      'Combina detalhes só quando houver segurança.',
    ],
    tone: 'border-[#f4cbbd] bg-[#fff8ef] text-[#8b3d44]',
  },
  {
    icon: Users,
    title: 'Quem apoia',
    intro: 'Chega com respeito e disponibilidade real.',
    bullets: [
      'Lê a história antes de oferecer apoio.',
      'Propõe algo possível para o próprio tempo.',
      'Respeita limites antes, durante e depois.',
    ],
    tone: 'border-[#c9e5dc] bg-[#e5f4ee] text-[#245b53]',
  },
];

const protections = [
  { icon: ShieldCheck, title: 'Contato protegido', text: 'Dados diretos não aparecem antes do aceite.' },
  { icon: Heart, title: 'Sem pressão', text: 'A pessoa não precisa aceitar proposta nenhuma.' },
  { icon: MessageCircle, title: 'Canal de escuta', text: 'Desconfortos podem ser sinalizados à equipe.' },
];

function JourneyPhase({ phase, index }: { phase: (typeof journeyPhases)[number]; index: number }) {
  return (
    <li className="relative rounded-[1.4rem] border border-[#eadfd2] bg-white/86 p-5 shadow-[0_18px_52px_rgba(92,62,51,0.08)]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5f4ee] text-[#245b53]">
          <phase.icon className="h-5 w-5" />
        </span>
        <span className="rounded-full bg-[#fff4d8] px-3 py-1 text-xs font-extrabold text-[#a8544a]">
          0{index + 1}
        </span>
      </div>
      <h3 className="text-xl font-extrabold leading-tight text-[#241b24]">{phase.title}</h3>
      <p className="mt-3 text-sm font-semibold leading-relaxed text-[#5c4b52]">{phase.text}</p>
    </li>
  );
}

function AudiencePanel({
  panel,
}: {
  panel: {
    icon: LucideIcon;
    title: string;
    intro: string;
    bullets: string[];
    tone: string;
  };
}) {
  return (
    <article className={`public-organic-radius border p-6 public-soft-shadow ${panel.tone}`}>
      <div className="mb-6 flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
          <panel.icon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-2xl font-extrabold leading-tight text-[#241b24]">{panel.title}</h3>
          <p className="mt-1 text-sm font-extrabold">{panel.intro}</p>
        </div>
      </div>
      <ul className="space-y-3">
        {panel.bullets.map((item) => (
          <li key={item} className="flex items-start gap-3 rounded-2xl bg-white/66 p-3 text-sm font-bold leading-relaxed text-[#5c4b52]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-current" />
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function HowItWorks() {
  return (
    <div className="overflow-x-hidden bg-[#ffffff] text-[#172033]">
      <PublicPageHero
        eyebrow="Como funciona"
        title="Do sonho ao encontro, sem pressa."
        intro="A jornada aproxima pessoas com clareza, privacidade e consentimento antes de qualquer conversa direta."
        visual={<PublicEditorialVisual kind="howItWorks" />}
        actions={[
          { to: '/cadastro?tipo=paciente', label: 'Compartilhar um sonho', icon: Star },
          { to: '/cadastro?tipo=apoiador', label: 'Ser apoiador', icon: HandHeart, variant: 'secondary' },
        ]}
      />

      <WarmSection tone="cream">
        <SectionHeader
          eyebrow="Jornada"
          title="Quatro fases, uma linha de cuidado."
          intro="O fluxo é simples de entender e cuidadoso o suficiente para não apressar decisões sensíveis."
          align="center"
        />

        <div className="relative">
          <div className="absolute left-8 right-8 top-11 hidden h-px bg-[#c9e5dc] md:block" aria-hidden />
          <ol className="relative grid gap-4 md:grid-cols-4">
            {journeyPhases.map((phase, index) => (
              <JourneyPhase key={phase.title} phase={phase} index={index} />
            ))}
          </ol>
        </div>
      </WarmSection>

      <WarmSection tone="white">
        <div className="grid gap-6 lg:grid-cols-[0.65fr_1.35fr] lg:items-center">
          <div>
            <SectionHeader
              eyebrow="Dois ritmos"
              title="Cada lado sabe o que pode esperar."
              intro="A ideia é mostrar o caminho com transparência, sem sobrecarregar quem está decidindo o próximo passo."
            />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {audienceGuides.map((panel) => (
              <AudiencePanel key={panel.title} panel={panel} />
            ))}
          </div>
        </div>
      </WarmSection>

      <WarmSection tone="sage">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <SectionHeader
            eyebrow="Proteções ao longo do caminho"
            title="Sem pressa, com limites visíveis."
            intro="Privacidade, aceite e escuta aparecem antes da conexão avançar."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {protections.map((item) => (
              <div key={item.title} className="rounded-[1.25rem] border border-white/80 bg-white/78 p-5 shadow-sm">
                <item.icon className="h-5 w-5 text-[#245b53]" />
                <h3 className="mt-4 text-base font-extrabold text-[#241b24]">{item.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-[#5c4b52]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </WarmSection>

      <WarmSection tone="peach">
        <CareCallout
          icon={Lock}
          title="Cuidado antes de qualquer conexão."
          action={{ to: '/seguranca', label: 'Ver como cuidamos', icon: ArrowRight }}
        >
          <p>
            Dados de contato ficam protegidos, a conversa acontece no momento certo e a equipe mantém canais de escuta quando algo parece fora do combinado.
          </p>
        </CareCallout>
      </WarmSection>
    </div>
  );
}
