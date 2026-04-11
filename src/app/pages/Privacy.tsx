import { Link } from 'react-router';
import { Shield, Eye, Lock, Database, Trash2, Mail, Globe, UserCheck, FileText, AlertTriangle } from 'lucide-react';

const LAST_UPDATE = '27 de fevereiro de 2026';

const rights = [
  { icon: Eye,       title: 'Acesso',       desc: 'Solicitar cópia de todos os seus dados pessoais armazenados.' },
  { icon: FileText,  title: 'Correção',     desc: 'Corrigir dados incompletos, inexatos ou desatualizados.' },
  { icon: Trash2,    title: 'Exclusão',     desc: 'Solicitar a exclusão ou anonimização dos seus dados.' },
  { icon: Lock,      title: 'Portabilidade',desc: 'Receber seus dados em formato estruturado e legível.' },
  { icon: UserCheck, title: 'Revogação',    desc: 'Revogar o consentimento dado a qualquer momento.' },
  { icon: Globe,     title: 'Oposição',     desc: 'Opor-se ao tratamento em determinadas circunstâncias.' },
];

const dataTypes = [
  {
    title: 'Dados de cadastro',
    desc: 'Nome completo, e-mail, CPF (apoiadores), cidade e data de nascimento, fornecidos no momento do registro.',
    retention: 'Mantidos enquanto a conta estiver ativa + 5 anos após encerramento.',
    basis: 'Execução de contrato',
  },
  {
    title: 'Dados do perfil',
    desc: 'Foto de perfil (opcional), biografia, habilidades e disponibilidade informadas voluntariamente.',
    retention: 'Mantidos enquanto a conta estiver ativa.',
    basis: 'Consentimento',
  },
  {
    title: 'Conteúdo gerado',
    desc: 'Sonhos publicados, propostas enviadas, mensagens de chat e avaliações.',
    retention: 'Mensagens: 2 anos após conclusão da conexão. Sonhos e propostas: 5 anos.',
    basis: 'Execução de contrato',
  },
  {
    title: 'Dados de uso',
    desc: 'Endereço IP, tipo de dispositivo, navegador, páginas visitadas e tempo de sessão.',
    retention: '12 meses.',
    basis: 'Interesse legítimo (segurança e melhoria do serviço)',
  },
  {
    title: 'Dados de segurança',
    desc: 'Logs de acesso, tentativas de login, ações administrativas e registros de denúncias.',
    retention: '5 anos (obrigação legal).',
    basis: 'Obrigação legal',
  },
];

const sections = [
  {
    id: 'controlador',
    title: '1. Controlador de Dados',
    content: [
      'O NextDream é o controlador dos dados pessoais tratados nesta plataforma, nos termos da Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD).',
      'Nosso Encarregado de Proteção de Dados (DPO) pode ser contactado pelo e-mail privacidade@nextdream.ong.br.',
    ],
  },
  {
    id: 'compartilhamento',
    title: '2. Compartilhamento de Dados',
    content: [
      'Não vendemos, alugamos nem comercializamos dados pessoais de nossos usuários sob nenhuma circunstância.',
      'Podemos compartilhar dados com: (a) prestadores de serviços técnicos (hospedagem, e-mail transacional) sob obrigação contratual de confidencialidade; (b) autoridades competentes quando exigido por lei ou ordem judicial; (c) parceiros de segurança para prevenção de fraudes.',
      'Qualquer transferência internacional de dados obedece às salvaguardas previstas na LGPD e ao padrão de proteção adequada estabelecido pela ANPD.',
    ],
  },
  {
    id: 'seguranca',
    title: '3. Segurança dos Dados',
    content: [
      'Adotamos medidas técnicas e organizacionais adequadas para proteger os dados contra acesso não autorizado, alteração, divulgação ou destruição acidental.',
      'As medidas incluem: criptografia em trânsito (TLS 1.3), hash seguro de senhas (bcrypt), controle de acesso baseado em papéis (RBAC), monitoramento contínuo de anomalias e revisões periódicas de segurança.',
      'Em caso de incidente de segurança que possa afetar seus dados, notificaremos os usuários afetados e a ANPD nos prazos previstos pela LGPD.',
    ],
  },
  {
    id: 'cookies',
    title: '4. Cookies e Tecnologias Similares',
    content: [
      'Utilizamos cookies estritamente necessários para o funcionamento da plataforma (sessão, autenticação, preferências de acessibilidade). Não utilizamos cookies de rastreamento de terceiros para fins publicitários.',
      'Cookies analíticos de uso agregado e anonimizado podem ser utilizados para melhorar a experiência da plataforma. O usuário pode desativá-los nas configurações do navegador sem impacto funcional significativo.',
    ],
  },
  {
    id: 'menores',
    title: '5. Proteção de Menores',
    content: [
      'Levamos a proteção de dados de crianças e adolescentes muito a sério. Contas que envolvam menores de 18 anos devem ser gerenciadas por um responsável legal adulto.',
      'Não coletamos conscientemente dados de crianças menores de 13 anos sem consentimento parental explícito. Se identificarmos tal situação, os dados serão excluídos imediatamente.',
    ],
  },
  {
    id: 'alteracoes',
    title: '6. Alterações nesta Política',
    content: [
      'Esta Política pode ser atualizada periodicamente. Alterações significativas serão comunicadas por e-mail e por aviso na plataforma com antecedência mínima de 15 dias.',
      'O uso continuado da plataforma após a vigência das alterações implica na aceitação da nova Política.',
    ],
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-white mb-3" style={{ fontWeight: 800, fontSize: '2rem' }}>Política de Privacidade</h1>
          <p className="text-blue-100 text-sm">Última atualização: {LAST_UPDATE}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

        {/* Compromisso */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-10 flex gap-3">
          <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-800 text-sm" style={{ fontWeight: 600 }}>Nosso compromisso com você</p>
            <p className="text-blue-700 text-sm mt-1 leading-relaxed">
              Sua privacidade é fundamental para nós. O NextDream coleta apenas os dados estritamente necessários
              para conectar pessoas, nunca os vende e está em conformidade com a LGPD (Lei nº 13.709/2018).
            </p>
          </div>
        </div>

        {/* Seus direitos */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-10 shadow-sm">
          <p className="text-gray-800 mb-5" style={{ fontWeight: 700 }}>Seus direitos como titular de dados (LGPD)</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {rights.map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <r.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-700 text-sm" style={{ fontWeight: 600 }}>{r.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-xs mt-5 pt-4 border-t border-gray-100">
            Para exercer qualquer desses direitos, envie solicitação para <a href="mailto:privacidade@nextdream.ong.br" className="text-blue-600 hover:underline">privacidade@nextdream.ong.br</a>. Respondemos em até 15 dias úteis.
          </p>
        </div>

        {/* Dados coletados */}
        <div className="mb-10">
          <h2 className="text-gray-800 mb-4" style={{ fontWeight: 700, fontSize: '1.0625rem' }}>Dados que coletamos</h2>
          <div className="space-y-3">
            {dataTypes.map((d, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="text-gray-800 text-sm" style={{ fontWeight: 700 }}>{d.title}</p>
                  <span className="shrink-0 text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
                    {d.basis}
                  </span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed mb-2">{d.desc}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Database className="w-3.5 h-3.5" />
                  Retenção: {d.retention}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seções adicionais */}
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

        {/* Aviso ANPD */}
        <div className="mt-10 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-amber-700 text-sm leading-relaxed">
            Se você acredita que seus dados foram tratados em violação à LGPD e não obteve resposta satisfatória do NextDream,
            você tem o direito de peticionar à <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong> em <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="underline">gov.br/anpd</a>.
          </p>
        </div>

        {/* Contato DPO */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-gray-800 text-sm" style={{ fontWeight: 700 }}>Encarregado de Proteção de Dados (DPO)</p>
            <p className="text-gray-500 text-sm mt-0.5">Dúvidas, solicitações e exercício de direitos LGPD.</p>
          </div>
          <a href="mailto:privacidade@nextdream.ong.br"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2.5 rounded-xl transition-colors shrink-0"
            style={{ fontWeight: 600 }}>
            privacidade@nextdream.ong.br
          </a>
        </div>

        {/* Links relacionados */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/termos" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-pink-600 transition-colors">
            <FileText className="w-4 h-4" /> Termos de Uso
          </Link>
          <span className="text-gray-300">·</span>
          <Link to="/diretrizes" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-pink-600 transition-colors">
            <Shield className="w-4 h-4" /> Diretrizes da Comunidade
          </Link>
        </div>
      </div>
    </div>
  );
}
