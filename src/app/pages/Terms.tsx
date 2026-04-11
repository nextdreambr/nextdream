import { Link } from 'react-router';
import { FileText, Shield, AlertTriangle, CheckCircle, XCircle, Mail } from 'lucide-react';

const LAST_UPDATE = '27 de fevereiro de 2026';

const sections = [
  {
    id: 'objeto',
    title: '1. Objeto e Natureza da Plataforma',
    content: [
      'O NextDream é uma plataforma digital gratuita que conecta pacientes (ou seus familiares e cuidadores) com apoiadores voluntários dispostos a oferecer tempo, presença e companhia para a realização de sonhos e desejos pessoais.',
      'A plataforma tem caráter estritamente humanitário e voluntário. Não intermediamos, facilitamos ou permitimos qualquer forma de transação financeira, doação em dinheiro, PIX, transferência bancária ou pagamento entre usuários.',
      'O NextDream não é uma plataforma de saúde, não oferece serviços médicos e não substitui qualquer orientação clínica ou cuidado profissional de saúde.',
    ],
  },
  {
    id: 'usuarios',
    title: '2. Cadastro e Perfis de Usuário',
    content: [
      'Para utilizar as funcionalidades da plataforma, o usuário deve criar uma conta fornecendo informações verdadeiras, precisas e atualizadas. São aceitos três perfis: Paciente (ou familiar/cuidador autorizado), Apoiador e Administrador.',
      'O cadastro como Apoiador exige validação de identidade básica (CPF e e-mail verificado). A plataforma se reserva o direito de solicitar documentação adicional a qualquer momento.',
      'É vedado o cadastro de menores de 18 anos sem autorização expressa de responsável legal. Usuários menores de 18 anos na condição de Paciente devem ter seus perfis gerenciados por um adulto responsável.',
      'Cada usuário pode manter apenas uma conta ativa. Contas duplicadas serão suspensas.',
    ],
  },
  {
    id: 'sonhos',
    title: '3. Publicação de Sonhos',
    content: [
      'Pacientes ou seus representantes podem publicar sonhos e desejos que sejam lícitos, realizáveis com tempo e presença humana, e compatíveis com as Diretrizes da Comunidade.',
      'Os sonhos publicados passam por moderação automática e humana antes de ficarem visíveis ao público. A plataforma pode recusar ou remover publicações que violem estas políticas, sem aviso prévio.',
      'Ao publicar um sonho, o usuário concorda que informações não sensíveis (como cidade, idade aproximada e descrição do sonho) possam ser exibidas publicamente para atrair apoiadores compatíveis.',
      'É proibida a publicação de sonhos que envolvam pedidos financeiros diretos ou indiretos, atividades ilegais, conteúdo que identifique menores sem autorização, ou qualquer forma de discriminação.',
    ],
  },
  {
    id: 'propostas',
    title: '4. Propostas e Conexões',
    content: [
      'Apoiadores podem enviar propostas para sonhos publicados, descrevendo o que oferecem, sua disponibilidade e uma mensagem ao paciente. Propostas são submetidas à moderação antes de chegarem ao paciente.',
      'O paciente tem total autonomia para aceitar ou recusar qualquer proposta, sem necessidade de justificativa. O NextDream não interfere nessa decisão.',
      'Ao aceitar uma proposta, um canal de chat privado é aberto entre paciente e apoiador. Toda comunicação deve respeitar as Diretrizes da Comunidade. Os chats são monitorados para fins de segurança.',
      'Nenhuma informação de contato pessoal (telefone, endereço, redes sociais) deve ser compartilhada pelo chat antes de um nível mínimo de confiança estabelecido entre as partes.',
    ],
  },
  {
    id: 'proibicoes',
    title: '5. Condutas Proibidas',
    content: [
      'É expressamente proibido: solicitar ou oferecer dinheiro, PIX, doações, presentes de valor monetário significativo ou qualquer compensação financeira em qualquer forma.',
      'É proibido assediar, intimidar, discriminar ou agir de forma abusiva com qualquer usuário da plataforma, dentro ou fora do ambiente do NextDream.',
      'É proibido utilizar a plataforma para fins comerciais, captação de clientes, promoção de produtos ou serviços, ou qualquer atividade com fins lucrativos.',
      'É proibido criar perfis falsos, usar identidade de terceiros ou fornecer informações fraudulentas no cadastro.',
      'É proibido tentar contornar os sistemas de moderação, segurança ou privacidade da plataforma.',
    ],
  },
  {
    id: 'responsabilidades',
    title: '6. Responsabilidades e Limitações',
    content: [
      'O NextDream atua como intermediador de conexões humanas e não se responsabiliza por ações, omissões, danos ou incidentes ocorridos durante ou após os encontros entre usuários.',
      'Recomendamos fortemente que os primeiros encontros entre paciente e apoiador ocorram em locais públicos, com presença de familiar ou cuidador responsável quando possível.',
      'A plataforma não realiza verificação criminal de apoiadores, embora possa solicitar autodeclaração e adote mecanismos de denúncia e avaliação comunitária.',
      'Em caso de emergência ou situação de risco, o usuário deve acionar os serviços de emergência locais (SAMU 192, Bombeiros 193, Polícia 190) e notificar a plataforma imediatamente.',
    ],
  },
  {
    id: 'propriedade',
    title: '7. Propriedade Intelectual',
    content: [
      'Todo o conteúdo da plataforma (marca, logotipo, textos, interfaces, código-fonte) é de propriedade do NextDream e protegido por lei. É vedada a reprodução sem autorização expressa.',
      'Ao publicar conteúdo na plataforma (textos, fotos), o usuário concede ao NextDream uma licença gratuita, não exclusiva e mundial para exibir, reproduzir e distribuir esse conteúdo exclusivamente para fins de operação da plataforma.',
      'O usuário declara ser o legítimo titular ou possuir as autorizações necessárias para publicar qualquer conteúdo na plataforma.',
    ],
  },
  {
    id: 'encerramento',
    title: '8. Encerramento de Conta',
    content: [
      'O usuário pode solicitar o encerramento de sua conta a qualquer momento, enviando solicitação para contato@nextdream.ong.br. Os dados serão anonimizados em até 30 dias, conforme a Lei Geral de Proteção de Dados (LGPD).',
      'O NextDream pode suspender ou encerrar contas que violem estes Termos, as Diretrizes da Comunidade ou a Política de Privacidade, sem aviso prévio em casos de violações graves.',
      'O encerramento da conta não afeta obrigações já contraídas pelo usuário durante o período de vigência.',
    ],
  },
  {
    id: 'legislacao',
    title: '9. Legislação e Foro',
    content: [
      'Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da Comarca de Santos, Estado de São Paulo, para dirimir eventuais conflitos, com renúncia expressa a qualquer outro.',
      'O NextDream se compromete a manter estes Termos atualizados e a notificar os usuários sobre alterações relevantes com antecedência mínima de 15 dias.',
    ],
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-pink-600 to-rose-500 py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-white mb-3" style={{ fontWeight: 800, fontSize: '2rem' }}>Termos de Uso</h1>
          <p className="text-pink-100 text-sm">Última atualização: {LAST_UPDATE}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

        {/* Aviso importante */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-10 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 text-sm" style={{ fontWeight: 600 }}>Leia com atenção antes de usar a plataforma</p>
            <p className="text-amber-700 text-sm mt-1 leading-relaxed">
              Ao criar uma conta ou utilizar o NextDream, você concorda integralmente com estes Termos de Uso.
              Se não concordar com alguma cláusula, não utilize a plataforma.
            </p>
          </div>
        </div>

        {/* Princípios rápidos */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {[
            { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 border-green-100', title: 'O que permitimos', items: ['Compartilhar sonhos e desejos', 'Oferecer tempo e presença voluntária', 'Conectar pessoas com empatia', 'Comunicação via chat moderado'] },
            { icon: XCircle,     color: 'text-red-500',   bg: 'bg-red-50 border-red-100',     title: 'O que proibimos',   items: ['Qualquer transação financeira', 'Assédio ou condutas abusivas', 'Perfis falsos ou fraude', 'Uso comercial da plataforma'] },
          ].map((block, i) => (
            <div key={i} className={`rounded-2xl border p-5 ${block.bg}`}>
              <div className="flex items-center gap-2 mb-3">
                <block.icon className={`w-4 h-4 ${block.color}`} />
                <p className="text-gray-800 text-sm" style={{ fontWeight: 700 }}>{block.title}</p>
              </div>
              <ul className="space-y-1.5">
                {block.items.map((it, j) => (
                  <li key={j} className="text-gray-600 text-sm flex items-start gap-1.5">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Índice */}
        <nav className="bg-white border border-gray-200 rounded-2xl p-5 mb-10">
          <p className="text-gray-700 text-sm mb-3" style={{ fontWeight: 700 }}>Índice</p>
          <ol className="space-y-1.5">
            {sections.map(s => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-pink-600 hover:text-pink-700 text-sm transition-colors">{s.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Seções */}
        <div className="space-y-10">
          {sections.map(s => (
            <section key={s.id} id={s.id} className="scroll-mt-20">
              <h2 className="text-gray-800 mb-4 pb-2 border-b border-gray-200" style={{ fontWeight: 700, fontSize: '1.0625rem' }}>
                {s.title}
              </h2>
              <div className="space-y-3">
                {s.content.map((p, i) => (
                  <p key={i} className="text-gray-600 text-sm leading-relaxed">{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Contato */}
        <div className="mt-12 bg-pink-50 border border-pink-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-pink-600" />
          </div>
          <div className="flex-1">
            <p className="text-gray-800 text-sm" style={{ fontWeight: 700 }}>Dúvidas sobre estes termos?</p>
            <p className="text-gray-500 text-sm mt-0.5">Entre em contato com nossa equipe jurídica.</p>
          </div>
          <a href="mailto:juridico@nextdream.ong.br"
            className="bg-pink-600 hover:bg-pink-700 text-white text-sm px-5 py-2.5 rounded-xl transition-colors shrink-0"
            style={{ fontWeight: 600 }}>
            juridico@nextdream.ong.br
          </a>
        </div>

        {/* Links relacionados */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/privacidade" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-pink-600 transition-colors">
            <Shield className="w-4 h-4" /> Política de Privacidade
          </Link>
          <span className="text-gray-300">·</span>
          <Link to="/diretrizes" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-pink-600 transition-colors">
            <CheckCircle className="w-4 h-4" /> Diretrizes da Comunidade
          </Link>
        </div>
      </div>
    </div>
  );
}
