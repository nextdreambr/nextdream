import { Link } from 'react-router';
import { Heart, Shield, Star, MessageCircle, Flag, Ban, CheckCircle, AlertTriangle, HelpCircle, FileText } from 'lucide-react';

const LAST_UPDATE = '27 de fevereiro de 2026';

const principles = [
  {
    icon: Heart,
    color: 'bg-pink-100 text-pink-600',
    title: 'Empatia acima de tudo',
    desc: 'Cada pessoa na plataforma carrega uma história. Trate a todos com a gentileza que você gostaria de receber nos seus dias mais difíceis.',
  },
  {
    icon: Shield,
    color: 'bg-blue-100 text-blue-600',
    title: 'Segurança é inegociável',
    desc: 'A segurança de pacientes — muitos em situação de vulnerabilidade — é nossa prioridade máxima. Qualquer dúvida sobre segurança, denuncie imediatamente.',
  },
  {
    icon: Star,
    color: 'bg-amber-100 text-amber-600',
    title: 'Autenticidade e honestidade',
    desc: 'Seja quem você é de verdade. Perfis autênticos criam conexões genuínas. Representações falsas prejudicam pessoas reais.',
  },
  {
    icon: MessageCircle,
    color: 'bg-teal-100 text-teal-600',
    title: 'Comunicação respeitosa',
    desc: 'Toda comunicação na plataforma deve ser respeitosa, clara e sem qualquer forma de pressão, coerção ou manipulação.',
  },
];

const doList = [
  'Descrever sonhos e propostas com honestidade e clareza',
  'Respeitar o "não" de pacientes e apoiadores sem questionamentos',
  'Comunicar imprevistos com antecedência e educação',
  'Avaliar as experiências de forma justa e construtiva',
  'Denunciar comportamentos suspeitos ou inadequados',
  'Seguir as orientações médicas e de cuidados do paciente',
  'Combinar todos os detalhes do encontro pelo chat antes de realizá-lo',
  'Em caso de dúvida, entrar em contato com o suporte',
];

const dontList = [
  'Solicitar ou oferecer qualquer valor financeiro, PIX ou doação',
  'Compartilhar dados de contato antes de um nível adequado de confiança',
  'Realizar encontros em locais isolados em um primeiro contato',
  'Pressionar pacientes a aceitar propostas',
  'Fotografar ou gravar pacientes sem consentimento explícito',
  'Compartilhar histórias de pacientes nas redes sociais sem autorização',
  'Utilizar a plataforma para fins religiosos, políticos ou comerciais',
  'Ignorar sinais de desconforto ou indisposição do paciente',
];

const moderationLevels = [
  {
    level: 'Advertência',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-700',
    desc: 'Para primeiras infrações leves. O usuário recebe uma notificação explicando a infração e o que deve mudar.',
    examples: ['Linguagem inadequada no chat', 'Compartilhar dados de contato prematuramente', 'Perfil com informações incompletas'],
  },
  {
    level: 'Suspensão temporária',
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    badge: 'bg-orange-100 text-orange-700',
    desc: 'Para infrações moderadas ou reincidências. A conta fica bloqueada por 7 a 30 dias, conforme a gravidade.',
    examples: ['Comportamento desrespeitoso com outro usuário', 'Reincidência após advertência', 'Conteúdo inapropriado em sonhos ou propostas'],
  },
  {
    level: 'Suspensão permanente',
    color: 'bg-red-50 border-red-200 text-red-700',
    badge: 'bg-red-100 text-red-700',
    desc: 'Para infrações graves ou que coloquem usuários em risco. O acesso é revogado permanentemente.',
    examples: ['Qualquer transação financeira', 'Assédio sexual ou moral', 'Identidade falsa comprovada', 'Ameaças ou violência'],
  },
];

const reportSteps = [
  { n: '1', title: 'Identifique a situação', desc: 'Em qualquer mensagem de chat ou publicação, toque no ícone 🚩 para abrir o formulário de denúncia.' },
  { n: '2', title: 'Descreva o ocorrido', desc: 'Informe o motivo da denúncia e adicione contexto. Quanto mais detalhes, mais rápida a análise.' },
  { n: '3', title: 'Aguarde o retorno', desc: 'Nossa equipe analisa todas as denúncias em até 24 horas. Casos urgentes têm prioridade máxima.' },
  { n: '4', title: 'Acompanhe a resolução', desc: 'Você receberá notificação sobre o encaminhamento da denúncia, respeitando a privacidade de todos.' },
];

export default function Guidelines() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-600 to-emerald-600 py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <h1 className="text-white mb-3" style={{ fontWeight: 800, fontSize: '2rem' }}>Diretrizes da Comunidade</h1>
          <p className="text-teal-100 text-sm mb-4">Última atualização: {LAST_UPDATE}</p>
          <p className="text-teal-50 max-w-xl mx-auto text-sm leading-relaxed">
            O NextDream existe graças à confiança entre pessoas. Estas diretrizes protegem essa confiança
            e garantem que cada conexão seja segura, genuína e transformadora.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

        {/* Princípios */}
        <div className="mb-12">
          <h2 className="text-gray-800 mb-6" style={{ fontWeight: 700, fontSize: '1.25rem' }}>Nossos princípios fundamentais</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {principles.map((p, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${p.color}`}>
                  <p.icon className="w-5 h-5" />
                </div>
                <p className="text-gray-800 text-sm mb-1.5" style={{ fontWeight: 700 }}>{p.title}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pode / Não pode */}
        <div className="mb-12">
          <h2 className="text-gray-800 mb-6" style={{ fontWeight: 700, fontSize: '1.25rem' }}>O que você deve e não deve fazer</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Pode */}
            <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800 text-sm" style={{ fontWeight: 700 }}>Incentivamos</p>
              </div>
              <ul className="space-y-2.5">
                {doList.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-green-800">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Não pode */}
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Ban className="w-5 h-5 text-red-500" />
                <p className="text-red-800 text-sm" style={{ fontWeight: 700 }}>É proibido</p>
              </div>
              <ul className="space-y-2.5">
                {dontList.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Dinheiro: destaque especial */}
        <div className="mb-12 bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-pink-200 shrink-0 mt-0.5" />
            <div>
              <p className="mb-2" style={{ fontWeight: 700, fontSize: '1rem' }}>Regra absoluta: zero dinheiro</p>
              <p className="text-pink-100 text-sm leading-relaxed">
                Qualquer pedido ou oferta de dinheiro, PIX, Pix Copia-e-Cola, transferência, vale-presente, criptomoeda
                ou qualquer outro bem de valor monetário é <strong className="text-white">motivo imediato de suspensão permanente</strong>,
                sem direito a recurso. Isso inclui ofertas disfarçadas de "gorjeta", "agradecimento" ou "despesas de transporte".
              </p>
              <p className="text-pink-200 text-xs mt-3">
                Se alguém pedir dinheiro, denuncie imediatamente. Você estará protegendo toda a comunidade.
              </p>
            </div>
          </div>
        </div>

        {/* Moderação */}
        <div className="mb-12">
          <h2 className="text-gray-800 mb-2" style={{ fontWeight: 700, fontSize: '1.25rem' }}>Como funciona a moderação</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Nossa moderação combina ferramentas automáticas com análise humana. Levamos todas as denúncias a sério.
          </p>
          <div className="space-y-4">
            {moderationLevels.map((m, i) => (
              <div key={i} className={`border rounded-2xl p-5 ${m.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${m.badge}`} style={{ fontWeight: 700 }}>{m.level}</span>
                </div>
                <p className="text-sm leading-relaxed mb-3">{m.desc}</p>
                <div>
                  <p className="text-xs mb-1.5 opacity-70" style={{ fontWeight: 600 }}>Exemplos:</p>
                  <ul className="space-y-1">
                    {m.examples.map((ex, j) => (
                      <li key={j} className="text-xs flex items-start gap-1.5 opacity-80">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Como denunciar */}
        <div className="mb-12">
          <h2 className="text-gray-800 mb-6" style={{ fontWeight: 700, fontSize: '1.25rem' }}>Como fazer uma denúncia</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {reportSteps.map((s, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex gap-3">
                <div className="w-8 h-8 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center shrink-0 text-sm" style={{ fontWeight: 700 }}>
                  {s.n}
                </div>
                <div>
                  <p className="text-gray-800 text-sm mb-1" style={{ fontWeight: 700 }}>{s.title}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 bg-gray-100 rounded-xl px-4 py-3">
            <Flag className="w-4 h-4 text-pink-500 shrink-0" />
            Todas as denúncias são sigilosas. O usuário denunciado não saberá quem realizou a denúncia.
          </div>
        </div>

        {/* Dúvidas */}
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5 text-teal-600" />
          </div>
          <div className="flex-1">
            <p className="text-gray-800 text-sm" style={{ fontWeight: 700 }}>Dúvidas sobre as diretrizes?</p>
            <p className="text-gray-500 text-sm mt-0.5">Nossa equipe de comunidade está disponível para esclarecer qualquer ponto.</p>
          </div>
          <a href="mailto:comunidade@nextdream.ong.br"
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm px-5 py-2.5 rounded-xl transition-colors shrink-0"
            style={{ fontWeight: 600 }}>
            Falar com a equipe
          </a>
        </div>

        {/* Links relacionados */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/termos" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-pink-600 transition-colors">
            <FileText className="w-4 h-4" /> Termos de Uso
          </Link>
          <span className="text-gray-300">·</span>
          <Link to="/privacidade" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-pink-600 transition-colors">
            <Shield className="w-4 h-4" /> Política de Privacidade
          </Link>
        </div>
      </div>
    </div>
  );
}
