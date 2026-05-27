import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  HandHeart,
  HelpCircle,
  MessageCircle,
  Shield,
  Star,
  User,
} from 'lucide-react';
import { Link } from 'react-router';
import { PublicEditorialVisual } from '../components/public/PublicEditorialVisual';
import { CareCallout, PublicPageHero, WarmSection } from '../components/public/PublicPagePrimitives';
import { useI18n } from '../i18n/I18nProvider';

type Answer = {
  q: string;
  a: string;
};

type AnswerGroup = {
  icon: LucideIcon;
  title: string;
  intro: string;
  answers: Answer[];
  tone: string;
};

const firstQuestions: Answer[] = [
  {
    q: 'Que tipo de apoio existe?',
    a: 'O apoio esperado é presença, tempo, companhia ou habilidade.',
  },
  {
    q: 'Meu sonho será público?',
    a: 'Não automaticamente. A história deve respeitar consentimento, privacidade e o que você se sentir confortável em compartilhar.',
  },
  {
    q: 'Quem pode falar comigo?',
    a: 'A conversa direta acontece depois que você aceita uma proposta. Antes disso, seus contatos ficam protegidos.',
  },
];

const answerGroups: AnswerGroup[] = [
  {
    icon: Star,
    title: 'Para quem compartilha um sonho',
    intro: 'O ritmo da história continua com a pessoa ou família.',
    tone: 'border-[#f4cbbd] bg-[#fff8ef]',
    answers: [
      {
        q: 'Que tipo de sonho posso publicar?',
        a: 'Um desejo seguro, consentido e viável para este momento: conversa, passeio leve, aprendizado, música, receita ou outra experiência significativa.',
      },
      {
        q: 'Preciso contar detalhes de saúde?',
        a: 'Não. Conte apenas o necessário para que o apoio respeite limites, preferências e cuidados práticos.',
      },
      {
        q: 'Sou obrigado a aceitar alguém?',
        a: 'Não. Você pode aceitar, recusar, pausar ou aguardar sem justificar.',
      },
    ],
  },
  {
    icon: HandHeart,
    title: 'Para quem quer apoiar',
    intro: 'Apoiar é chegar com disponibilidade real, sem pressa e sem pressão.',
    tone: 'border-[#c9e5dc] bg-[#e5f4ee]',
    answers: [
      {
        q: 'Preciso ter uma habilidade especial?',
        a: 'Não. Muitos sonhos pedem conversa, companhia e presença. Outros combinam melhor com uma habilidade específica.',
      },
      {
        q: 'Como criar uma boa proposta?',
        a: 'Leia a história com atenção, apresente-se com respeito e diga exatamente como pode estar presente.',
      },
      {
        q: 'E se minha proposta não for aceita?',
        a: 'Tudo bem. Cada pessoa escolhe o que parece mais confortável e seguro para sua história.',
      },
    ],
  },
  {
    icon: Shield,
    title: 'Privacidade e conversa',
    intro: 'Os limites aparecem antes da conexão avançar.',
    tone: 'border-[#eadfd2] bg-[#fff4d8]',
    answers: [
      {
        q: 'Como meus dados são cuidados?',
        a: 'Dados de contato não aparecem publicamente. A conversa direta acontece dentro da plataforma depois do aceite.',
      },
      {
        q: 'O chat é acompanhado?',
        a: 'A plataforma oferece canais para reportar exposição de dados, linguagem abusiva ou situações inseguras. Esses relatos são analisados pela equipe.',
      },
      {
        q: 'Preciso encontrar alguém pessoalmente?',
        a: 'Não. Muitos sonhos podem acontecer remotamente. Encontros presenciais dependem de segurança, consentimento e viabilidade local.',
      },
    ],
  },
];

const quickPaths = [
  { icon: User, label: 'Conta ou acesso', to: '/contato' },
  { icon: MessageCircle, label: 'Canal de escuta', to: '/contato' },
  { icon: Building2, label: 'Instituições e redes', to: '/parcerias' },
];

function FirstQuestionCard({ item }: { item: Answer }) {
  return (
    <article className="rounded-[1.35rem] border border-white bg-white/84 p-5 shadow-sm">
      <h2 className="text-xl font-extrabold leading-tight text-[#241b24]">{item.q}</h2>
      <p className="mt-3 text-sm font-semibold leading-relaxed text-[#5c4b52]">{item.a}</p>
    </article>
  );
}

function AnswerCard({ answer }: { answer: Answer }) {
  return (
    <article className="rounded-[1.1rem] border border-white/80 bg-white/76 p-4">
      <div className="mb-3 flex items-center gap-2 text-[#245b53]">
        <CheckCircle2 className="h-4 w-4" />
        <h3 className="text-base font-extrabold leading-tight text-[#241b24]">{answer.q}</h3>
      </div>
      <p className="text-sm font-semibold leading-relaxed text-[#5c4b52]">{answer.a}</p>
    </article>
  );
}

function AnswerGroupCard({ group }: { group: AnswerGroup }) {
  return (
    <section className={`public-organic-radius border p-5 public-soft-shadow md:p-6 ${group.tone}`}>
      <div className="mb-6 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/84 text-[#a8544a] shadow-sm">
          <group.icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-2xl font-extrabold leading-tight text-[#241b24]">{group.title}</h2>
          <p className="mt-2 text-sm font-bold leading-relaxed text-[#5c4b52]">{group.intro}</p>
        </div>
      </div>

      <div className="grid gap-3">
        {group.answers.map((answer) => (
          <AnswerCard key={answer.q} answer={answer} />
        ))}
      </div>
    </section>
  );
}

export default function FAQ() {
  const { localizedPath } = useI18n();

  return (
    <div className="overflow-x-hidden bg-[#ffffff] text-[#172033]">
      <PublicPageHero
        eyebrow="Perguntas frequentes"
        title="Respostas para caminhar com mais calma."
        intro="As dúvidas mais comuns aparecem por momento da jornada, para você encontrar o próximo passo com calma."
        visual={<PublicEditorialVisual kind="faq" />}
        imageCaption="Perguntas sensíveis precisam de respostas curtas, honestas e cuidadosas."
        actions={[
          { to: '/contato', label: 'Fale conosco', icon: ArrowRight },
          { to: '/seguranca', label: 'Ver segurança', icon: Shield, variant: 'secondary' },
        ]}
      />

      <WarmSection tone="cream">
        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[#a8544a]">
            Perguntas que aparecem primeiro
          </p>
          <h2 className="text-4xl font-extrabold leading-tight text-[#241b24] md:text-5xl">
            O essencial antes de continuar.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {firstQuestions.map((item) => (
            <FirstQuestionCard key={item.q} item={item} />
          ))}
        </div>
      </WarmSection>

      <WarmSection tone="white">
        <div className="grid gap-5 lg:grid-cols-3">
          {answerGroups.map((group) => (
            <AnswerGroupCard key={group.title} group={group} />
          ))}
        </div>
      </WarmSection>

      <WarmSection tone="sage">
        <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <CareCallout icon={HelpCircle} title="Ainda ficou alguma dúvida?">
            <p>
              Algumas situações precisam de contexto. Escolha o caminho mais próximo e escreva apenas o necessário para começarmos.
            </p>
          </CareCallout>

          <div className="grid gap-3 md:grid-cols-3">
            {quickPaths.map((path) => (
              <Link
                key={path.label}
                to={localizedPath(path.to)}
                className="rounded-[1.25rem] border border-white/80 bg-white/78 p-5 text-[#245b53] shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <path.icon className="h-5 w-5" />
                <span className="mt-4 flex items-center gap-2 text-sm font-extrabold">
                  {path.label}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </WarmSection>
    </div>
  );
}
