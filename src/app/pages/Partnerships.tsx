import {
  Building2,
  CheckCircle,
  Heart,
  HeartHandshake,
  Mail,
  Megaphone,
  Route,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router';
import { PublicEditorialVisual } from '../components/public/PublicEditorialVisual';
import { CareCallout, PublicPageHero, SectionHeader, StoryCard, WarmSection } from '../components/public/PublicPagePrimitives';
import { useI18n } from '../i18n/I18nProvider';

const networkReasons = [
  'Conhecem o território e os limites de quem está sendo cuidado.',
  'Ajudam histórias a chegarem com consentimento e contexto.',
  'Organizam presença possível, sem transformar sonho em campanha.',
];

const partnershipPaths = [
  {
    icon: Building2,
    title: 'Instituições de cuidado',
    text: 'Equipes e casas de apoio podem aproximar sonhos de pessoas acompanhadas com autorização e contexto.',
  },
  {
    icon: Users,
    title: 'Comunidades locais',
    text: 'Redes de bairro, escolas e coletivos ajudam a encontrar apoios possíveis, sem abordagem religiosa ou proselitismo.',
  },
  {
    icon: HeartHandshake,
    title: 'Grupos de voluntariado',
    text: 'Pessoas organizadas podem oferecer tempo, habilidades e companhia com preparo e responsabilidade.',
  },
  {
    icon: Megaphone,
    title: 'Comunicação responsável',
    text: 'Criadores e veículos podem apresentar a iniciativa sem sensacionalismo e com linguagem de cuidado.',
  },
];

const partnershipSteps = [
  {
    icon: Mail,
    title: 'Conversamos sobre contexto',
    text: 'Entendemos território, pessoas acompanhadas e cuidados necessários em contexto agregado.',
  },
  {
    icon: ShieldCheck,
    title: 'Combinamos limites',
    text: 'Definimos consentimento, privacidade e como histórias podem circular.',
  },
  {
    icon: Route,
    title: 'Abrimos caminhos seguros',
    text: 'A rede aproxima sonhos de apoiadores sem pressa e sem apelo.',
  },
];

const partnershipBrief = [
  'Quem é a rede, instituição ou comunidade.',
  'Qual território ou contexto agregado acompanha.',
  'Que tipo de presença ou habilidade pode oferecer.',
  'Quem deve receber a primeira resposta.',
];

const partnershipMailto =
  'mailto:contato@nextdream.ong.br?subject=NextDream%20-%20Conversa%20sobre%20parceria&body=Ol%C3%A1%2C%20equipe%20NextDream.%0A%0AQuero%20conversar%20sobre%20uma%20parceria.%0A%0ARede%2Finstitui%C3%A7%C3%A3o%3A%0ATerrit%C3%B3rio%20ou%20contexto%20agregado%3A%0ATipo%20de%20presen%C3%A7a%20ou%20habilidade%20poss%C3%ADvel%3A%0AMelhor%20contato%20para%20retorno%3A%0A%0AObserva%C3%A7%C3%A3o%3A%20vou%20evitar%20nomes%2C%20diagn%C3%B3sticos%2C%20documentos%2C%20telefones%2C%20endere%C3%A7os%20ou%20relatos%20identific%C3%A1veis.';

export default function Partnerships() {
  const { localizedPath } = useI18n();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#ffffff] text-[#172033]">
      <PublicPageHero
        eyebrow="Parcerias"
        title="Instituições podem ajudar sonhos a chegarem com cuidado."
        intro="Construímos caminhos com equipes, comunidades e grupos que conhecem pessoas, territórios e limites."
        visual={<PublicEditorialVisual kind="partnerships" />}
        imageCaption="Parceria, para o NextDream, é criar contexto seguro para que mais encontros humanos aconteçam."
        actions={[
          { to: '#formulario-parceria', label: 'Conversar sobre parceria', icon: Mail, variant: 'secondary' },
        ]}
      />

      <WarmSection tone="sage">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <SectionHeader
            eyebrow="Por que a rede importa"
            title="O sonho chega melhor quando alguém de confiança ajuda a abrir caminho."
            intro="Parceiros não são apenas canais de divulgação. Eles ajudam a proteger contexto, consentimento e viabilidade."
          />

          <div className="grid gap-4 md:grid-cols-3">
            {networkReasons.map((reason, index) => (
              <div key={reason} className="rounded-[1.35rem] border border-white/80 bg-white/78 p-5 shadow-sm">
                <span className="mb-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff4d8] text-sm font-extrabold text-[#a8544a]">
                  0{index + 1}
                </span>
                <p className="text-sm font-extrabold leading-relaxed text-[#245b53]">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </WarmSection>

      <WarmSection tone="white">
        <SectionHeader
          eyebrow="Tipos de parceiro"
          title="Cada rede cuida de um trecho diferente."
          intro="O ponto comum é responsabilidade: aproximar pessoas sem transformar vulnerabilidade em vitrine."
          align="center"
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {partnershipPaths.map((path, index) => (
            <StoryCard key={path.title} icon={path.icon} title={path.title} className={index % 2 ? 'lg:translate-y-6' : ''}>
              <p>{path.text}</p>
            </StoryCard>
          ))}
        </div>
      </WarmSection>

      <WarmSection id="formulario-parceria" tone="cream">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-6">
            <SectionHeader
              eyebrow="Como funciona a parceria"
              title="Uma conversa simples antes de qualquer mobilização."
              intro="Não precisa chegar com uma proposta pronta. O primeiro passo é entender se existe um caminho seguro."
            />

            <div className="space-y-4">
              {partnershipSteps.map((step, index) => (
                <div key={step.title} className="grid grid-cols-[3rem_1fr] gap-4 rounded-[1.35rem] border border-white/80 bg-white/76 p-4 shadow-sm">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5f4ee] text-[#245b53]">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#a8544a]">
                      Etapa {index + 1}
                    </p>
                    <h3 className="mt-1 text-lg font-extrabold text-[#241b24]">{step.title}</h3>
                    <p className="mt-2 text-sm font-semibold leading-relaxed text-[#5c4b52]">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <figure>
              <PublicEditorialVisual kind="partnershipsCare" size="compact" />
              <figcaption className="mt-4 border-l-4 border-[#facc15] pl-4 text-sm font-bold leading-relaxed text-[#4b5563]">
                A parceria ideal respeita o tempo de cada pessoa e cria apoio realista para quem cuida.
              </figcaption>
            </figure>
          </div>

          <div>
            <div className="rounded-[1.65rem] border border-[#eadfd2] bg-white p-6 shadow-[0_16px_40px_rgba(92,62,51,0.07)] sm:p-8">
              <div className="mb-6">
                <h3 className="text-3xl font-extrabold leading-tight text-[#241b24]">
                  Comece por uma mensagem curta.
                </h3>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-[#5c4b52]">
                  O primeiro contato acontece por e-mail. Assim evitamos um formulário que parece captar dados
                  sensíveis antes de haver contexto.
                </p>
              </div>

              <div className="rounded-[1.25rem] border border-[#fde68a] bg-[#fffbeb] p-4">
                <p className="text-sm font-extrabold leading-relaxed text-[#854d0e]">
                  Não envie nomes, diagnósticos, documentos, telefones, endereços ou relatos identificáveis.
                  Use contexto agregado e informações mínimas para iniciar a conversa.
                </p>
              </div>

              <div className="mt-6 grid gap-3">
                {partnershipBrief.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-[1rem] bg-[#fff8ef] p-4 text-sm font-bold leading-relaxed text-[#5c4b52]">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#245b53]" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href={partnershipMailto}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#a8544a] px-6 py-3 text-sm font-extrabold text-white shadow-[0_14px_32px_rgba(168,84,74,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#8b3d44] focus:outline-none focus:ring-4 focus:ring-[#f4cbbd]"
                >
                  <Mail className="h-4 w-4" />
                  Escrever sobre parceria
                </a>
                <Link
                  to={localizedPath('/contato')}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#c9e5dc] bg-white px-6 py-3 text-sm font-extrabold text-[#245b53] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#e5f4ee] focus:outline-none focus:ring-4 focus:ring-[#c9e5dc]"
                >
                  <Heart className="h-4 w-4" />
                  Ver outros canais
                </Link>
              </div>

              <p className="mt-4 text-xs font-bold leading-relaxed text-[#6b5b60]">
                O retorno depende do contexto apresentado e dos canais disponíveis da equipe.
              </p>
            </div>
          </div>
        </div>
      </WarmSection>

      <WarmSection tone="sage">
        <CareCallout icon={HeartHandshake} title="Parceria é confiança aplicada.">
          <p>
            Buscamos redes responsáveis, capazes de aproximar histórias reais de pessoas que podem cuidar com respeito, privacidade e presença.
          </p>
        </CareCallout>
      </WarmSection>
    </div>
  );
}
