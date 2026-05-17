import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  EyeOff,
  Lock,
  MessageCircle,
  Phone,
  Shield,
  UserCheck,
} from 'lucide-react';
import { PublicEditorialVisual } from '../components/public/PublicEditorialVisual';
import { CareCallout, PublicPageHero, SectionHeader, WarmSection } from '../components/public/PublicPagePrimitives';

const directProtections = [
  {
    icon: EyeOff,
    title: 'Contato direto fica discreto',
    desc: 'Telefone, e-mail e endereço não aparecem publicamente antes da pessoa escolher uma proposta.',
  },
  {
    icon: Lock,
    title: 'A conversa abre no momento certo',
    desc: 'O chat direto acontece depois do aceite, para combinar limites, formato e próximos passos.',
  },
  {
    icon: Shield,
    title: 'A pessoa pode pausar ou reportar',
    desc: 'Recusar, pausar e sinalizar desconfortos são caminhos disponíveis para preservar autonomia.',
  },
];

const neverList = [
  'Pressionar a pessoa ou família a aceitar uma proposta',
  'Compartilhar contato direto antes de haver aceite',
  'Fotografar, gravar ou publicar alguém sem consentimento claro',
  'Usar linguagem abusiva, insistente ou invasiva',
];

const journey = [
  {
    phase: 'Cadastro',
    icon: UserCheck,
    items: ['E-mail confirmado', 'Perfil pode ser revisado', 'Termos de cuidado aceitos'],
  },
  {
    phase: 'História e proposta',
    icon: MessageCircle,
    items: ['Contexto pode ser revisado', 'Contato direto oculto', 'Proposta com intenção clara'],
  },
  {
    phase: 'Conversa',
    icon: Lock,
    items: ['Chat após aceite', 'Combinações centralizadas', 'Canal de reporte disponível'],
  },
  {
    phase: 'Encontro',
    icon: CheckCircle2,
    items: ['Limites combinados', 'Conclusão registrada', 'Equipe disponível para escuta'],
  },
];

export default function Security() {
  return (
    <div className="overflow-x-hidden bg-[#ffffff] text-[#172033]">
      <PublicPageHero
        eyebrow="Segurança"
        title="Cuidado antes da conexão."
        intro="O NextDream reduz exposição, respeita o ritmo de cada pessoa e mantém limites visíveis antes de qualquer conversa direta."
        visual={<PublicEditorialVisual kind="security" />}
        imageCaption="Segurança aqui significa colocar privacidade, consentimento e autonomia antes do encontro."
        actions={[
          { to: '/contato', label: 'Abrir canal de escuta', icon: Phone },
          { to: '/faq', label: 'Perguntas frequentes', variant: 'secondary' },
        ]}
      />

      <WarmSection tone="white">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
          <SectionHeader
            eyebrow="Em linguagem direta"
            title="O que protegemos primeiro."
            intro="A segurança da plataforma não depende de uma promessa grandiosa. Ela aparece em decisões simples, repetidas ao longo da jornada."
          />

          <div className="grid gap-4">
            {directProtections.map((item) => (
              <article key={item.title} className="grid gap-4 rounded-[1.35rem] border border-[#eadfd2] bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)] sm:grid-cols-[3.5rem_1fr]">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5f4ee] text-[#245b53]">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-extrabold text-[#241b24]">{item.title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-[#5c4b52]">{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </WarmSection>

      <WarmSection tone="peach">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <SectionHeader
            eyebrow="Limites claros"
            title="Alguns comportamentos não cabem aqui."
            intro="As diretrizes existem para que o encontro não vire pressão, exposição ou risco para quem está vulnerável."
          />

          <div className="grid gap-3 md:grid-cols-2">
            {neverList.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-[1.15rem] border border-[#fecaca] bg-white/82 p-4 shadow-sm">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#dc2626]" />
                <p className="text-sm font-bold leading-relaxed text-[#374151]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </WarmSection>

      <WarmSection tone="white">
        <SectionHeader
          eyebrow="Ao longo da jornada"
          title="A proteção acompanha cada fase."
          intro="Algumas revisões dependem do contexto e dos sinais disponíveis. Quando algo parece fora do combinado, a comunidade pode acionar a equipe."
          align="center"
        />

        <div className="mx-auto max-w-4xl space-y-4">
          {journey.map((step, index) => (
            <div key={step.phase} className="grid gap-4 rounded-[1.15rem] border border-[#d8e2f1] bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.07)] sm:grid-cols-[10rem_1fr] sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0fdf4] text-[#166534]">
                  <step.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#a8544a]">Fase {index + 1}</p>
                  <h3 className="text-lg font-extrabold text-[#111827]">{step.phase}</h3>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {step.items.map((item) => (
                  <span key={item} className="rounded-full bg-[#eff6ff] px-3 py-2 text-xs font-extrabold text-[#374151]">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </WarmSection>

      <WarmSection tone="sage">
        <CareCallout
          icon={Phone}
          title="Algo saiu do combinado? Fale com a gente."
          action={{ to: '/contato', label: 'Abrir canal de escuta' }}
        >
          <p>
            Sentiu desconforto, insistência ou exposição? A equipe pode orientar os próximos passos e analisar situações reportadas com discrição.
          </p>
          <p className="mt-3 text-sm font-extrabold text-[#245b53]">
            Este não é um canal de emergência. Em risco imediato, procure os serviços locais de emergência ou uma pessoa de confiança por perto.
          </p>
        </CareCallout>

        <div className="mt-6 text-center">
          <a href="mailto:seguranca@nextdream.ong.br" className="inline-flex items-center gap-2 text-sm font-extrabold text-[#166534] hover:text-[#14532d]">
            seguranca@nextdream.ong.br
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </WarmSection>
    </div>
  );
}
