import { useState } from 'react';
import { ChevronDown, Search, Star, Heart, Shield, MessageCircle, User, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

interface FAQItem {
  q: string;
  a: string;
}
interface FAQCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  items: FAQItem[];
}

const categories: FAQCategory[] = [
  {
    id: 'geral',
    label: 'Geral',
    icon: HelpCircle,
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    items: [
      {
        q: 'O que é o NextDream?',
        a: 'O NextDream é uma plataforma que conecta pacientes (ou familiares/cuidadores) que compartilham sonhos e desejos com apoiadores voluntários que oferecem tempo, presença e companhia. Não há nenhuma transação financeira — toda a troca é baseada em humanidade.',
      },
      {
        q: 'O NextDream é gratuito?',
        a: 'Sim, 100% gratuito para todos os lados. Pacientes publicam sonhos gratuitamente, apoiadores se cadastram e enviam propostas sem nenhum custo. A plataforma não cobra nada e não permite nenhum tipo de pagamento entre os usuários.',
      },
      {
        q: 'Quem pode usar o NextDream?',
        a: 'Qualquer pessoa maior de 18 anos pode se cadastrar como apoiador. Para cadastro como paciente, aceitamos também familiares ou cuidadores que atuam em nome do paciente. Todos passam por verificação de e-mail obrigatória antes de usar a plataforma.',
      },
      {
        q: 'O NextDream funciona em todo o Brasil?',
        a: 'Sim! A plataforma está disponível em todo o território nacional. Sonhos podem ser presenciais (em qualquer cidade) ou remotos (online), permitindo conexões entre estados e regiões diferentes.',
      },
    ],
  },
  {
    id: 'pacientes',
    label: 'Para Pacientes',
    icon: Star,
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    items: [
      {
        q: 'Que tipo de sonho posso publicar?',
        a: 'Qualquer desejo que possa ser realizado com tempo e presença de outra pessoa: uma tarde de companhia, aprender algo novo, visitar um lugar especial, ouvir histórias, assistir a um evento, receber ajuda com um hobby — a lista é tão grande quanto a imaginação.',
      },
      {
        q: 'Preciso informar meu diagnóstico ou condição de saúde?',
        a: 'Não é obrigatório. Você pode compartilhar o quanto quiser sobre sua situação. Informações médicas sensíveis nunca devem ser colocadas no campo público do sonho — nossa plataforma bloqueia automaticamente esse tipo de conteúdo por sua própria proteção.',
      },
      {
        q: 'Como funciona o recebimento de propostas?',
        a: 'Após publicar seu sonho, ele fica visível para os apoiadores cadastrados. Quando alguém se identificar com seu sonho, enviarão uma proposta com uma mensagem, disponibilidade e o que oferecem. Você recebe uma notificação e pode revisar todas as propostas no seu painel.',
      },
      {
        q: 'Sou obrigado a aceitar alguma proposta?',
        a: 'Absolutamente não. Você tem total controle para aceitar, ignorar ou recusar qualquer proposta sem qualquer obrigação de explicação. Sua segurança e conforto são a prioridade máxima.',
      },
      {
        q: 'O que acontece depois que aceito uma proposta?',
        a: 'Um chat privado é automaticamente liberado entre você e o apoiador escolhido. Ali vocês combinam todos os detalhes: data, horário, local, necessidades específicas. Após a realização, você marca o sonho como concluído.',
      },
      {
        q: 'Posso pausar ou cancelar um sonho publicado?',
        a: 'Sim, a qualquer momento. Você pode pausar temporariamente (ocultar da busca), editar o conteúdo ou cancelar definitivamente o sonho diretamente pelo seu painel, sem precisar contatar suporte.',
      },
    ],
  },
  {
    id: 'apoiadores',
    label: 'Para Apoiadores',
    icon: Heart,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    items: [
      {
        q: 'Preciso ter alguma habilidade especial para ser apoiador?',
        a: 'Não. A maior parte dos sonhos precisa apenas de presença, companhia e boa vontade. Outros podem requerer habilidades específicas (tocar um instrumento, dirigir, falar outro idioma) — você filtra e se propõe apenas ao que está dentro das suas possibilidades.',
      },
      {
        q: 'Como o processo de verificação de apoiador funciona?',
        a: 'Após o cadastro, você passa por uma verificação manual da equipe NextDream, que pode incluir confirmação de identidade por documento e avaliação do perfil. Somente após aprovação você pode enviar propostas. Isso garante mais segurança para os pacientes.',
      },
      {
        q: 'Posso enviar proposta para quantos sonhos quiser?',
        a: 'Sim, mas recomendamos foco e personalização. Propostas genéricas têm muito menos chance de aceite. Leia cada sonho com cuidado e envie uma mensagem genuína e específica.',
      },
      {
        q: 'O que acontece se minha proposta for recusada?',
        a: 'Você recebe uma notificação e pode continuar explorando outros sonhos. Recusas não impactam seu perfil nem sua reputação na plataforma. Cada sonho é único e o paciente escolhe quem se sente mais seguro.',
      },
      {
        q: 'Posso desistir depois que minha proposta for aceita?',
        a: 'Sim, mas pedimos que você comunique o paciente o mais rápido possível pelo chat, com respeito e empatia. Cancelamentos frequentes após aceite podem impactar seu histórico na plataforma.',
      },
    ],
  },
  {
    id: 'seguranca',
    label: 'Segurança',
    icon: Shield,
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    items: [
      {
        q: 'Como meus dados pessoais são protegidos?',
        a: 'Seus dados de contato (telefone, e-mail, endereço) nunca são exibidos publicamente. Eles só são acessíveis internamente, nunca compartilhados com outros usuários antes ou depois da conexão — a comunicação acontece exclusivamente pelo chat interno da plataforma.',
      },
      {
        q: 'O chat é monitorado?',
        a: 'O chat possui monitoramento automatizado que detecta padrões de risco: pedidos financeiros, compartilhamento de dados sensíveis ou linguagem abusiva. Alertas são enviados imediatamente à equipe de moderação, que pode intervir em tempo real.',
      },
      {
        q: 'Como faço para denunciar um usuário ou comportamento inadequado?',
        a: 'Em qualquer tela da plataforma você encontra o botão "Denunciar" — nos perfis, nos sonhos e dentro do chat. Após a denúncia, nossa equipe analisa em até 48 horas e você recebe uma notificação sobre o resultado. Casos graves são tratados com prioridade.',
      },
      {
        q: 'O que acontece se alguém pedir dinheiro?',
        a: 'Qualquer pedido financeiro é uma violação grave das diretrizes do NextDream. Bloqueamos automaticamente mensagens com esse tipo de conteúdo e suspendemos imediatamente contas que tentam contornar o sistema. Relate qualquer tentativa pelo botão de denúncia.',
      },
      {
        q: 'Preciso me encontrar pessoalmente com a pessoa?',
        a: 'Não necessariamente. Muitos sonhos são realizados de forma remota (videochamada, mensagens, ligações). Para sonhos presenciais, recomendamos sempre que o primeiro contato seja em local público, com familiar ou acompanhante presente, e que todas as combinações sejam feitas primeiro pelo chat da plataforma.',
      },
    ],
  },
  {
    id: 'chat',
    label: 'Chat & Comunicação',
    icon: MessageCircle,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    items: [
      {
        q: 'Quando o chat é liberado?',
        a: 'O chat só é liberado após o paciente aceitar explicitamente uma proposta de apoiador. Antes disso, nenhuma forma de comunicação direta é possível entre as partes. Isso é uma proteção intencional e permanente.',
      },
      {
        q: 'Posso usar o chat para combinar tudo antes do encontro?',
        a: 'Sim! O chat é exatamente para isso: combinar data, horário, local, necessidades específicas, qualquer detalhe que seja importante para a realização do sonho. Incentivamos que toda a preparação aconteça pelo chat antes do encontro.',
      },
      {
        q: 'Posso compartilhar meu telefone pelo chat?',
        a: 'Não recomendamos e, na maioria dos casos, o sistema bloqueia automaticamente o compartilhamento de dados de contato direto dentro do chat. A plataforma oferece tudo que é necessário para coordenar a realização do sonho com segurança.',
      },
      {
        q: 'O que acontece com o chat após o sonho ser concluído?',
        a: 'O histórico da conversa fica arquivado e acessível a ambos por um período após a conclusão. A plataforma pode manter os registros para fins de moderação e auditoria de segurança.',
      },
    ],
  },
  {
    id: 'conta',
    label: 'Conta & Perfil',
    icon: User,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    items: [
      {
        q: 'Como faço para alterar minha senha?',
        a: 'Acesse "Perfil" no menu, clique em "Segurança" e depois em "Alterar senha". Você receberá um e-mail de confirmação. Se esqueceu sua senha atual, use o link "Esqueci minha senha" na tela de login.',
      },
      {
        q: 'Posso ter conta como paciente e apoiador ao mesmo tempo?',
        a: 'Não. Cada conta é associada a um único perfil (paciente ou apoiador). Isso é intencional para manter a clareza dos papéis e a integridade da plataforma. Caso queira mudar de perfil, entre em contato com o suporte.',
      },
      {
        q: 'Como faço para excluir minha conta?',
        a: 'Acesse "Perfil" > "Configurações" > "Excluir conta". Seus dados serão removidos de acordo com nossa política de privacidade. Atenção: sonhos publicados e histórico de conversas serão deletados e não podem ser recuperados.',
      },
      {
        q: 'Minha conta foi suspensa. O que fazer?',
        a: 'Você receberá um e-mail explicando o motivo da suspensão e a duração. Se acredita que houve um engano, responda o e-mail ou entre em contato com nosso suporte via seguranca@nextdream.ong.br com o assunto "Recurso de suspensão".',
      },
    ],
  },
];

function AccordionItem({ item, isOpen, onToggle }: {
  item: FAQItem; isOpen: boolean; onToggle: () => void;
}) {
  return (
    <motion.div variants={fadeIn} className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-pink-200 bg-pink-50/50 shadow-sm' : 'border-gray-100 bg-white hover:border-pink-100 hover:shadow-sm'}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left focus:outline-none focus-visible:bg-pink-50/50"
      >
        <span className={`text-base leading-snug ${isOpen ? 'text-pink-900 font-bold' : 'text-gray-800 font-semibold'}`}>
          {item.q}
        </span>
        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center transition-colors ${isOpen ? 'bg-pink-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-pink-50'}`}>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-6">
              <p className="text-gray-600 leading-relaxed border-t border-pink-100/50 pt-5 font-medium">{item.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('geral');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const searchResults = search.trim()
    ? categories.flatMap(cat =>
        cat.items
          .filter(item =>
            item.q.toLowerCase().includes(search.toLowerCase()) ||
            item.a.toLowerCase().includes(search.toLowerCase())
          )
          .map(item => ({ ...item, catLabel: cat.label, catId: cat.id }))
      )
    : [];

  const totalQuestions = categories.reduce((acc, c) => acc + c.items.length, 0);
  const activecat = categories.find(c => c.id === activeCategory)!;

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-pink-50 via-white to-white border-b border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal-50/50 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-pink-100/50 border border-pink-200/50 text-pink-700 px-5 py-2 rounded-full text-sm font-bold mb-6 backdrop-blur-sm shadow-sm">
              <HelpCircle className="w-4 h-4" />
              Perguntas Frequentes
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-6 tracking-tight" style={{ fontWeight: 900, lineHeight: 1.1 }}>
              Como podemos ajudar?
            </h1>
            <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              {totalQuestions} respostas em {categories.length} categorias. Não encontrou o que procura? Fale com a gente.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar em todas as perguntas..."
                className="w-full pl-14 pr-12 py-5 bg-white border border-gray-200 hover:border-gray-300 rounded-2xl text-base focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-300 shadow-sm transition-all font-medium"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 rounded-full transition-colors">
                  ✕
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">

        {/* ── SEARCH RESULTS ──────────────────────────────────────── */}
        {search.trim() ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-6">
              {searchResults.length > 0
                ? <><strong className="text-gray-800">{searchResults.length}</strong> resultado(s) para "<strong className="text-pink-600">{search}</strong>"</>
                : <>Nenhum resultado para "<strong className="text-pink-600">{search}</strong>" — tente outras palavras.</>
              }
            </p>
            {searchResults.map((item, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="px-5 py-2.5 border-b border-gray-50 flex items-center gap-2">
                  {(() => {
                    const cat = categories.find(c => c.id === item.catId)!;
                    const Icon = cat.icon;
                    return <>
                      <div className={`w-5 h-5 rounded-md ${cat.bg} flex items-center justify-center`}>
                        <Icon className={`w-3 h-3 ${cat.color}`} />
                      </div>
                      <span className={`text-[11px] ${cat.color}`} style={{ fontWeight: 600 }}>{cat.label}</span>
                    </>;
                  })()}
                </div>
                <AccordionItem
                  item={item}
                  isOpen={!!openItems[`search-${i}`]}
                  onToggle={() => toggleItem(`search-${i}`)}
                />
              </div>
            ))}
          </div>
        ) : (

          /* ── CATEGORY TABS + ITEMS ────────────────────────────── */
          <div className="flex flex-col md:flex-row gap-8">

            {/* Sidebar */}
            <div className="md:w-56 shrink-0">
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden sticky top-20">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-gray-50 last:border-0 transition-colors
                        ${isActive ? `${cat.bg} border-l-2 border-l-current` : 'hover:bg-gray-50'}`}
                    >
                      <div className={`w-7 h-7 rounded-lg ${cat.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm truncate ${isActive ? cat.color : 'text-gray-700'}`} style={{ fontWeight: isActive ? 600 : 400 }}>{cat.label}</p>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? `${cat.color} ${cat.bg}` : 'text-gray-400 bg-gray-100'}`}>
                        {cat.items.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Questions */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-2xl ${activecat.bg} flex items-center justify-center`}>
                  <activecat.icon className={`w-5 h-5 ${activecat.color}`} />
                </div>
                <div>
                  <h2 className="text-gray-800 text-lg" style={{ fontWeight: 700 }}>{activecat.label}</h2>
                  <p className="text-gray-400 text-xs">{activecat.items.length} perguntas</p>
                </div>
              </div>

              <div className="space-y-2">
                {activecat.items.map((item, i) => (
                  <AccordionItem
                    key={i}
                    item={item}
                    isOpen={!!openItems[`${activeCategory}-${i}`]}
                    onToggle={() => toggleItem(`${activeCategory}-${i}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STILL HAVE QUESTIONS ────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mt-20 bg-gradient-to-br from-pink-600 to-rose-500 rounded-[2.5rem] p-10 md:p-16 text-center shadow-2xl shadow-pink-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-white text-3xl md:text-4xl mb-4" style={{ fontWeight: 800 }}>Ainda com dúvidas?</h2>
            <p className="text-pink-100 text-lg max-w-xl mx-auto mb-10 leading-relaxed font-medium">
              Nossa equipe está aqui para ajudar. Responderemos em até 24 horas com carinho e atenção.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:ajuda@nextdream.ong.br"
                className="inline-flex items-center justify-center gap-2 bg-white text-pink-700 px-8 py-4 rounded-2xl hover:bg-pink-50 transition-all font-bold text-lg shadow-lg hover:-translate-y-0.5">
                Falar com o suporte <ArrowRight className="w-5 h-5" />
              </a>
              <Link to="/seguranca"
                className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white px-8 py-4 rounded-2xl hover:bg-white/20 transition-all font-bold text-lg backdrop-blur-sm">
                <Shield className="w-5 h-5" /> Ver página de segurança
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
