import { Link } from 'react-router';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  CalendarHeart,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Eye,
  HandHeart,
  HeartHandshake,
  Leaf,
  LockKeyhole,
  MessageCircleHeart,
  Music2,
  Paintbrush,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck,
} from 'lucide-react';

type Assurance = {
  icon: LucideIcon;
  title: string;
  text: string;
};

const assurances: Assurance[] = [
  {
    icon: LockKeyhole,
    title: 'Você controla a história',
    text: 'Nada precisa ser publicado antes de uma revisão cuidadosa.',
  },
  {
    icon: ShieldCheck,
    title: 'Consentimento no centro',
    text: 'Contato e exposição só avançam quando fizer sentido para você.',
  },
  {
    icon: HeartHandshake,
    title: 'Não é sobre dinheiro',
    text: 'O pedido deve falar de presença, tempo, companhia ou habilidade.',
  },
];

const gentleSteps = [
  'Conte o sonho com suas palavras.',
  'Defina limites e privacidade.',
  'Revise antes de enviar.',
  'Aguarde uma escuta responsável.',
];

const momentOptions = [
  { icon: Music2, label: 'Música' },
  { icon: MessageCircleHeart, label: 'Conversa' },
  { icon: Paintbrush, label: 'Desenho' },
  { icon: CalendarHeart, label: 'Visita' },
  { icon: HandHeart, label: 'Companhia' },
];

function ConceptBackLink() {
  return (
    <Link
      to="/paciente/sonhos/criar"
      className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/72 px-4 py-2 text-sm font-extrabold text-[#5d4c52] shadow-sm backdrop-blur transition-colors hover:bg-white"
    >
      <ChevronLeft className="h-4 w-4" />
      Ver página original
    </Link>
  );
}

function AssuranceCard({ item }: { item: Assurance }) {
  return (
    <article className="rounded-[1.35rem] border border-white/70 bg-white/72 p-4 shadow-sm backdrop-blur">
      <item.icon className="mb-4 h-6 w-6 text-[#9b5146]" />
      <h3 className="text-base font-extrabold leading-tight text-[#2e2529]">{item.title}</h3>
      <p className="mt-2 text-sm font-semibold leading-relaxed text-[#6a5a60]">{item.text}</p>
    </article>
  );
}

function SoftInput({
  id,
  label,
  placeholder,
  area,
}: {
  id: string;
  label: string;
  placeholder: string;
  area?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-extrabold text-[#453b40]">
        {label}
      </label>
      {area ? (
        <textarea
          id={id}
          rows={5}
          placeholder={placeholder}
          className="w-full resize-none rounded-[1.2rem] border border-[#ead7c7] bg-[#fffaf4] px-4 py-3 text-sm font-semibold leading-relaxed text-[#2e2529] placeholder:text-[#9b8e88] focus:border-[#b66a58] focus:outline-none focus:ring-4 focus:ring-[#f4cbbd]/55"
        />
      ) : (
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          className="w-full rounded-[1.2rem] border border-[#ead7c7] bg-[#fffaf4] px-4 py-3 text-sm font-semibold text-[#2e2529] placeholder:text-[#9b8e88] focus:border-[#b66a58] focus:outline-none focus:ring-4 focus:ring-[#f4cbbd]/55"
        />
      )}
    </div>
  );
}

export function CreateDreamConceptA() {
  return (
    <main className="min-h-screen bg-[#fff4e5] text-[#2d2428]">
      <section className="relative overflow-hidden px-4 py-10 sm:px-6 lg:py-16">
        <div className="absolute left-[-12rem] top-20 h-96 w-96 rounded-full bg-[#e6f3dc]/80 blur-3xl" />
        <div className="absolute right-[-10rem] top-12 h-[30rem] w-[30rem] rounded-full bg-[#f6c7b5]/70 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <ConceptBackLink />
            <span className="rounded-full bg-[#2f5f4e] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-white">
              Conceito A · carta guiada
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
            <aside className="rounded-[2.4rem] bg-[#314f43] p-6 text-white shadow-[0_30px_80px_rgba(50,79,67,0.22)] md:p-9">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-extrabold">
                <Leaf className="h-4 w-4" />
                Comece no seu ritmo
              </p>
              <h1 className="max-w-xl text-5xl font-extrabold leading-[0.95] md:text-7xl">
                Antes de contar, respire.
              </h1>
              <p className="mt-6 max-w-xl text-lg font-semibold leading-relaxed text-[#f7ead8]">
                Esta proposta trata o formulário como uma carta: primeiro acolhe, depois organiza,
                e só então encaminha para revisão.
              </p>

              <div className="mt-10 grid gap-3">
                {gentleSteps.map((step, index) => (
                  <div key={step} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f7d6bf] text-sm font-extrabold text-[#314f43]">
                      {index + 1}
                    </span>
                    <p className="text-sm font-bold leading-relaxed text-white/92">{step}</p>
                  </div>
                ))}
              </div>
            </aside>

            <section className="rounded-[2.4rem] border border-[#efd8c8] bg-white p-5 shadow-[0_28px_90px_rgba(101,71,53,0.14)] md:p-8">
              <div className="grid gap-6 xl:grid-cols-[1fr_0.42fr]">
                <form className="space-y-5" aria-label="Conceito A para compartilhar sonho">
                  <div>
                    <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#b05b4f]">
                      Carta do sonho
                    </p>
                    <h2 className="mt-3 text-4xl font-extrabold leading-none text-[#2d2428]">
                      Conte apenas o que for confortável agora.
                    </h2>
                  </div>
                  <SoftInput
                    id="concept-a-title"
                    label="Como você quer chamar este sonho?"
                    placeholder="Ex.: Uma tarde ouvindo música com minha família"
                  />
                  <SoftInput
                    id="concept-a-description"
                    label="O que tornaria este momento possível?"
                    placeholder="Conte com calma o que você gostaria, quem precisa estar junto e quais limites devem ser respeitados."
                    area
                  />
                  <div>
                    <p className="mb-3 text-sm font-extrabold text-[#453b40]">Que tipo de presença ajuda?</p>
                    <div className="flex flex-wrap gap-2">
                      {momentOptions.map((option) => (
                        <button
                          key={option.label}
                          type="button"
                          className="inline-flex items-center gap-2 rounded-full border border-[#ecd3c3] bg-[#fff6ed] px-4 py-2 text-sm font-extrabold text-[#734a42] transition-colors hover:bg-[#ffe9da]"
                        >
                          <option.icon className="h-4 w-4" />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SoftInput id="concept-a-location" label="Cidade ou região" placeholder="Opcional" />
                    <SoftInput id="concept-a-time" label="Melhor período" placeholder="Manhã, tarde ou a combinar" />
                  </div>
                  <div className="rounded-[1.4rem] bg-[#f6f0ff] p-4">
                    <p className="text-sm font-extrabold text-[#4d3e64]">
                      Nenhuma exposição acontece antes de consentimento.
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-relaxed text-[#655a72]">
                      O próximo passo seria revisar privacidade, nome exibido e limites de contato.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#a8544a] px-6 py-4 text-base font-extrabold text-white shadow-[0_18px_42px_rgba(168,84,74,0.25)]"
                  >
                    Continuar com cuidado
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                <div className="grid gap-3">
                  {assurances.map((item) => (
                    <AssuranceCard key={item.title} item={item} />
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

export function CreateDreamConceptB() {
  return (
    <main className="min-h-screen bg-[#f3f7ec] text-[#1f2924]">
      <section className="px-4 py-10 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <ConceptBackLink />
            <span className="rounded-full bg-[#846747] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-white">
              Conceito B · jardim de passos
            </span>
          </div>

          <div className="rounded-[3rem] bg-[#fff9ee] p-5 shadow-[0_30px_90px_rgba(84,103,76,0.12)] md:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
              <div>
                <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#dcefd5] px-4 py-2 text-sm font-extrabold text-[#315d46]">
                  <Sparkles className="h-4 w-4" />
                  Fluxo leve, sem pressa
                </p>
                <h1 className="max-w-4xl text-5xl font-extrabold leading-[0.92] md:text-7xl">
                  Um sonho possível começa por uma escuta cuidadosa.
                </h1>
                <p className="mt-6 max-w-2xl text-lg font-semibold leading-relaxed text-[#5b625b]">
                  Esta proposta transforma o wizard em uma trilha visual: cada etapa deixa claro o
                  que será perguntado, por que importa e como a pessoa mantém controle.
                </p>
              </div>

              <div className="rounded-[2.2rem] bg-[#315d46] p-6 text-white">
                <h2 className="text-2xl font-extrabold leading-tight">Mapa de cuidado</h2>
                <div className="mt-6 space-y-4">
                  {assurances.map((item) => (
                    <div key={item.title} className="flex gap-3 rounded-2xl bg-white/10 p-4">
                      <item.icon className="mt-1 h-5 w-5 shrink-0 text-[#f5d1b8]" />
                      <div>
                        <p className="text-sm font-extrabold">{item.title}</p>
                        <p className="mt-1 text-sm font-semibold leading-relaxed text-white/78">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-[0.34fr_0.66fr]">
              <nav className="rounded-[2rem] bg-[#e2eddc] p-4" aria-label="Etapas do conceito B">
                {[
                  ['01', 'História'],
                  ['02', 'Limites'],
                  ['03', 'Privacidade'],
                  ['04', 'Revisão'],
                ].map(([number, label], index) => (
                  <div
                    key={label}
                    className={`flex items-center gap-3 rounded-2xl p-4 ${
                      index === 0 ? 'bg-white text-[#315d46] shadow-sm' : 'text-[#647064]'
                    }`}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f1c9b6] text-sm font-extrabold text-[#315d46]">
                      {number}
                    </span>
                    <span className="text-lg font-extrabold">{label}</span>
                  </div>
                ))}
              </nav>

              <form className="rounded-[2rem] bg-white p-5 md:p-7" aria-label="Conceito B para compartilhar sonho">
                <div className="grid gap-7 xl:grid-cols-[0.92fr_1.08fr]">
                  <div className="rounded-[1.7rem] bg-[#fff1df] p-5">
                    <Star className="mb-8 h-10 w-10 text-[#a8544a]" />
                    <h2 className="text-4xl font-extrabold leading-none">
                      Conte só o essencial agora.
                    </h2>
                    <p className="mt-4 text-sm font-semibold leading-relaxed text-[#705f55]">
                      A proposta evita pressa mostrando que detalhes sensíveis podem ser definidos
                      depois, com revisão e consentimento.
                    </p>
                  </div>
                  <div className="space-y-5">
                    <SoftInput
                      id="concept-b-title"
                      label="Título acolhedor"
                      placeholder="Ex.: Cozinhar uma receita de família com ajuda"
                    />
                    <SoftInput
                      id="concept-b-description"
                      label="O que você gostaria que acontecesse?"
                      placeholder="Descreva a cena possível, quem participaria e que tipo de apoio seria bem-vindo."
                      area
                    />
                    <div className="grid gap-3 sm:grid-cols-3">
                      {['Online', 'Presencial', 'A combinar'].map((item) => (
                        <button
                          key={item}
                          type="button"
                          className="rounded-[1.2rem] border border-[#d6e5cf] bg-[#f7fbf3] px-4 py-4 text-sm font-extrabold text-[#315d46] hover:bg-[#edf7e7]"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#315d46] px-6 py-4 text-base font-extrabold text-white shadow-[0_18px_42px_rgba(49,93,70,0.25)]"
                    >
                      Seguir para limites e privacidade
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export function CreateDreamConceptC() {
  return (
    <main className="min-h-screen bg-[#f8f3ef] text-[#241b24]">
      <section className="px-4 py-10 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <ConceptBackLink />
            <span className="rounded-full bg-[#584478] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-white">
              Conceito C · mesa de cuidado
            </span>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.35fr_0.43fr_0.22fr]">
            <aside className="rounded-[2.4rem] bg-[#241b24] p-6 text-white shadow-[0_30px_90px_rgba(36,27,36,0.2)]">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold">
                <UserCheck className="h-4 w-4" />
                Espaço protegido
              </p>
              <h1 className="text-5xl font-extrabold leading-[0.92] md:text-6xl">
                Sua história não precisa caber em pressa.
              </h1>
              <p className="mt-6 text-base font-semibold leading-relaxed text-[#eadfd7]">
                Esta proposta organiza o formulário como uma mesa de cuidado: orientação, escrita e
                prévia convivem na mesma tela.
              </p>
              <div className="mt-8 space-y-3">
                {['Não é sobre dinheiro', 'Limites visíveis', 'Revisão antes do envio'].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 text-sm font-extrabold">
                    <CheckCircle2 className="h-5 w-5 text-[#f3c8ba]" />
                    {item}
                  </div>
                ))}
              </div>
            </aside>

            <form
              className="rounded-[2.4rem] border border-[#eadfd7] bg-white p-5 shadow-[0_24px_80px_rgba(86,62,51,0.1)] md:p-8"
              aria-label="Conceito C para compartilhar sonho"
            >
              <div className="mb-7 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#a8544a]">
                    Escrita guiada
                  </p>
                  <h2 className="mt-3 text-4xl font-extrabold leading-none">
                    Compartilhe um sonho com cuidado.
                  </h2>
                </div>
                <span className="hidden rounded-full bg-[#f6f0ff] px-4 py-2 text-xs font-extrabold text-[#584478] sm:inline-flex">
                  1 de 4
                </span>
              </div>

              <div className="space-y-5">
                <SoftInput
                  id="concept-c-title"
                  label="Nome do sonho"
                  placeholder="Ex.: Receber uma visita para conversar no jardim"
                />
                <SoftInput
                  id="concept-c-description"
                  label="Conte a cena que você imagina"
                  placeholder="Fale sobre o momento desejado, o tipo de presença esperada e qualquer limite importante."
                  area
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <SoftInput id="concept-c-kind" label="Tipo de apoio" placeholder="Presença, conversa, música..." />
                  <SoftInput id="concept-c-window" label="Janela de tempo" placeholder="Quando for confortável" />
                </div>
              </div>

              <div className="mt-7 rounded-[1.5rem] bg-[#f7d9c6] p-4">
                <p className="flex items-center gap-2 text-sm font-extrabold text-[#743f38]">
                  <Eye className="h-4 w-4" />
                  Prévia antes de publicar
                </p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-[#6b4f49]">
                  A próxima etapa mostra exatamente como sua história será vista e permite ajustar
                  privacidade antes de avançar.
                </p>
              </div>

              <button
                type="button"
                className="mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#584478] px-6 py-4 text-base font-extrabold text-white shadow-[0_18px_42px_rgba(88,68,120,0.25)]"
              >
                Revisar privacidade
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <aside className="space-y-4">
              <div className="rounded-[2rem] bg-[#e5f4ee] p-5">
                <Clock3 className="mb-8 h-8 w-8 text-[#245b53]" />
                <h3 className="text-2xl font-extrabold leading-tight text-[#245b53]">
                  Antes do encontro existe escuta.
                </h3>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-[#50645d]">
                  Este bloco reforça que a conexão não acontece automaticamente.
                </p>
              </div>
              {assurances.map((item) => (
                <AssuranceCard key={item.title} item={item} />
              ))}
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
