import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  Building2,
  Heart,
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  Shield,
} from 'lucide-react';
import { Link } from 'react-router';
import { PublicEditorialVisual } from '../components/public/PublicEditorialVisual';
import { CareCallout, PublicPageHero, StoryCard, WarmSection } from '../components/public/PublicPagePrimitives';

type ContactPath = {
  icon: LucideIcon;
  title: string;
  text: string;
  action: string;
  href?: string;
  to?: string;
  tone: string;
};

const contactPaths: ContactPath[] = [
  {
    icon: Shield,
    title: 'Situação sensível',
    text: 'Para desconforto, exposição, conduta inadequada ou pedido de orientação sobre segurança.',
    action: 'Escrever para segurança',
    href: 'mailto:seguranca@nextdream.ong.br?subject=NextDream%20-%20Canal%20de%20escuta',
    tone: 'border-[#fde68a] bg-[#fffbeb] text-[#854d0e]',
  },
  {
    icon: HelpCircle,
    title: 'Dúvida sobre a plataforma',
    text: 'Para perguntas sobre cadastro, acesso, sonhos, propostas ou uso geral do NextDream.',
    action: 'Escrever para contato',
    href: 'mailto:contato@nextdream.ong.br?subject=NextDream%20-%20D%C3%BAvida%20sobre%20a%20plataforma',
    tone: 'border-[#eadfd2] bg-[#fff8ef] text-[#6f443c]',
  },
  {
    icon: Building2,
    title: 'Instituição ou comunidade',
    text: 'Para redes, instituições e grupos que querem conversar sobre uma parceria com cuidado.',
    action: 'Ir para parcerias',
    to: '/parcerias',
    tone: 'border-[#c9e5dc] bg-[#e5f4ee] text-[#245b53]',
  },
];

const writingGuide = [
  'Conte o que você precisa em poucas linhas.',
  'Evite nomes de terceiros, diagnósticos, documentos, telefones e endereços.',
  'Se quiser retorno, escreva pelo seu próprio aplicativo de e-mail.',
];

const listeningCards = [
  {
    icon: Mail,
    title: 'Contato geral',
    text: 'contato@nextdream.ong.br',
    href: 'mailto:contato@nextdream.ong.br',
  },
  {
    icon: Shield,
    title: 'Canal de escuta',
    text: 'seguranca@nextdream.ong.br',
    href: 'mailto:seguranca@nextdream.ong.br',
  },
  {
    icon: MapPin,
    title: 'Base',
    text: 'São Paulo, SP - Brasil',
  },
];

function ContactPathCard({ path }: { path: ContactPath }) {
  const content = (
    <>
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/84 shadow-sm">
        <path.icon className="h-5 w-5" />
      </span>
      <h2 className="mt-5 text-2xl font-extrabold leading-tight text-[#241b24]">{path.title}</h2>
      <p className="mt-3 text-sm font-bold leading-relaxed text-[#5c4b52]">{path.text}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold">
        {path.action}
        <ArrowRight className="h-4 w-4" />
      </span>
    </>
  );

  const className = `block rounded-[1.45rem] border p-5 shadow-sm transition-transform hover:-translate-y-0.5 ${path.tone}`;

  if (path.to) {
    return (
      <Link to={path.to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <a href={path.href} className={className}>
      {content}
    </a>
  );
}

export default function Contact() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#ffffff] text-[#172033]">
      <PublicPageHero
        eyebrow="Fale conosco"
        title="Um canal de escuta para a comunidade."
        intro="Escolha o caminho mais próximo do que você precisa. Em assuntos sensíveis, compartilhe apenas o necessário para iniciar a conversa."
        visual={<PublicEditorialVisual kind="contact" />}
        imageCaption="Este canal orienta o primeiro contato sem substituir atendimento clínico ou resposta de emergência."
        actions={[
          { to: '/contato#canais-contato', label: 'Escolher canal', icon: ArrowRight },
          { to: '/faq', label: 'Ver perguntas', icon: HelpCircle, variant: 'secondary' },
        ]}
      />

      <WarmSection id="canais-contato" tone="cream">
        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[#a8544a]">
            Escolha o caminho
          </p>
          <h2 className="text-4xl font-extrabold leading-tight text-[#241b24] md:text-5xl">
            Nem toda mensagem precisa virar formulário.
          </h2>
          <p className="mt-4 text-base font-semibold leading-relaxed text-[#5c4b52]">
            O objetivo é orientar o primeiro contato com clareza, sem pedir mais informação do que o necessário.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {contactPaths.map((path) => (
            <ContactPathCard key={path.title} path={path} />
          ))}
        </div>
      </WarmSection>

      <WarmSection tone="white">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="public-organic-radius border border-[#eadfd2] bg-[#fff8ef] p-6 public-soft-shadow md:p-8">
            <Mail className="h-7 w-7 text-[#a8544a]" />
            <h2 className="mt-5 text-3xl font-extrabold leading-tight text-[#241b24]">
              Escreva do seu jeito.
            </h2>
            <p className="mt-4 text-base font-semibold leading-relaxed text-[#5c4b52]">
              Se ainda não souber explicar tudo, tudo bem. Uma mensagem curta com contexto seguro já ajuda a equipe a entender o próximo caminho.
            </p>

            <div className="mt-6 rounded-[1.25rem] border border-[#fde68a] bg-[#fffbeb] p-5">
              <p className="text-sm font-extrabold leading-relaxed text-[#854d0e]">
                Este não é um canal de emergência nem atendimento clínico. Em risco imediato, procure os serviços locais de emergência ou uma pessoa de confiança por perto.
              </p>
            </div>

            <ul className="mt-6 grid gap-3">
              {writingGuide.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-[1rem] bg-white/76 p-4 text-sm font-bold leading-relaxed text-[#5c4b52]">
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#245b53]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <aside className="space-y-5">
            <div className="grid gap-4">
              {listeningCards.map(item => (
                <StoryCard key={item.title} icon={item.icon} title={item.title}>
                  {item.href ? (
                    <a href={item.href} className="font-extrabold text-[#166534] hover:text-[#14532d]">
                      {item.text}
                    </a>
                  ) : (
                    <p>{item.text}</p>
                  )}
                </StoryCard>
              ))}
            </div>
          </aside>
        </div>
      </WarmSection>

      <WarmSection tone="sage">
        <CareCallout icon={Heart} title="A escuta também faz parte da rede.">
          <p>
            Se algo parecer confuso ou sensível, escolha o caminho mais próximo. Uma mensagem curta já ajuda a equipe a entender como orientar o primeiro contato.
          </p>
        </CareCallout>
      </WarmSection>
    </div>
  );
}
