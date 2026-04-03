import {
  Shield, Lock, Eye, EyeOff, AlertTriangle, CheckCircle,
  X, MessageCircle, Ban, FileText, ArrowRight, Phone,
  UserCheck, Zap,
} from 'lucide-react';
import { Link } from 'react-router';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { motion } from 'motion/react';

const securityImg = "https://images.unsplash.com/photo-1758691461932-d0aa0ebf6b31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWN1cml0eSUyMHByaXZhY3klMjBkaWdpdGFsJTIwY2FyZSUyMGhlYWx0aGNhcmV8ZW58MXx8fHwxNzcyODAzNTY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const pillars = [
  {
    icon: EyeOff,
    color: 'bg-slate-100 text-slate-700',
    title: 'Dados invisíveis até o aceite',
    desc: 'Telefone, e-mail, endereço e qualquer dado de contato de ambos os lados ficam completamente ocultos até que o paciente aceite explicitamente uma proposta. Antes disso, ninguém vê nada.',
  },
  {
    icon: Lock,
    color: 'bg-pink-100 text-pink-700',
    title: 'Chat bloqueado por padrão',
    desc: 'A conversa direta só é liberada após o aceite da proposta pelo paciente. Antes disso, não há nenhuma forma de comunicação direta entre as partes — intencional e imutável.',
  },
  {
    icon: Ban,
    color: 'bg-red-100 text-red-700',
    title: 'Zero transações financeiras',
    desc: 'Qualquer menção a dinheiro, PIX, transferência ou cobrança dentro da plataforma é bloqueada automaticamente. A troca no NextDream é exclusivamente de tempo e presença.',
  },
  {
    icon: UserCheck,
    color: 'bg-teal-100 text-teal-700',
    title: 'Verificação de apoiadores',
    desc: 'Apoiadores passam por um processo de verificação manual antes de conseguirem enviar propostas. Perfis verificados exibem um badge que indica que a identidade foi confirmada.',
  },
  {
    icon: Zap,
    color: 'bg-amber-100 text-amber-700',
    title: 'Moderação automatizada',
    desc: 'Nosso sistema monitora conversas em tempo real para detectar padrões de risco: pedidos financeiros, compartilhamento de dados sensíveis ou linguagem abusiva. Alertas são enviados imediatamente à moderação.',
  },
  {
    icon: Eye,
    color: 'bg-blue-100 text-blue-700',
    title: 'Equipe humana de moderação',
    desc: 'Além dos filtros automáticos, uma equipe dedicada revisa denúncias e situações de alerta. Toda ação de moderação gera um registro auditável e notificação para os envolvidos.',
  },
];

const neverList = [
  'Solicitar ou receber qualquer valor em dinheiro, PIX ou presentes',
  'Compartilhar número de telefone, e-mail ou endereço completo no chat',
  'Realizar encontros antes de combinar todos os detalhes pelo chat da plataforma',
  'Criar acordos ou combinações fora da plataforma NextDream',
  'Fotografar, gravar ou publicar imagens do outro participante sem consentimento explícito',
  'Pressionar o paciente a aceitar uma proposta ou acelerar a realização do sonho',
];

const journey = [
  {
    phase: 'Cadastro',
    icon: FileText,
    color: 'border-pink-300 bg-pink-50',
    dot: 'bg-pink-500',
    items: [
      'Verificação de e-mail obrigatória',
      'Dados pessoais criptografados',
      'Termos de conduta assinados digitalmente',
    ],
  },
  {
    phase: 'Publicação / Proposta',
    icon: MessageCircle,
    color: 'border-rose-300 bg-rose-50',
    dot: 'bg-rose-500',
    items: [
      'Sonhos revisados antes de publicação',
      'Filtro automático de dados sensíveis',
      'Nenhum contato direto possível ainda',
    ],
  },
  {
    phase: 'Conexão via Chat',
    icon: Lock,
    color: 'border-purple-300 bg-purple-50',
    dot: 'bg-purple-500',
    items: [
      'Chat liberado apenas após aceite do paciente',
      'Monitoramento em tempo real de conteúdo',
      'Bloqueio imediato de conteúdo financeiro',
    ],
  },
  {
    phase: 'Realização do Sonho',
    icon: CheckCircle,
    color: 'border-teal-300 bg-teal-50',
    dot: 'bg-teal-500',
    items: [
      'Confirmação bilateral de conclusão',
      'Avaliação de segurança pós-experiência',
      'Canal direto para reporte se necessário',
    ],
  },
];

export default function Security() {
  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-pink-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-28 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
              <motion.div variants={fadeIn} className="inline-flex items-center gap-2 bg-pink-500/20 border border-pink-400/30 text-pink-300 px-4 py-1.5 rounded-full text-sm font-bold mb-6 backdrop-blur-sm">
                <Shield className="w-4 h-4" />
                Segurança & Privacidade
              </motion.div>
              <motion.h1 variants={fadeIn} className="text-4xl md:text-5xl lg:text-6xl text-white mb-6" style={{ fontWeight: 900, lineHeight: 1.1 }}>
                Protegemos quem<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">mais precisa</span>
              </motion.h1>
              <motion.p variants={fadeIn} className="text-slate-300 text-lg leading-relaxed mb-8">
                O NextDream foi construído com camadas de segurança pensadas especificamente para proteger pacientes em situação de vulnerabilidade, sem abrir mão da humanidade da conexão.
              </motion.p>
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4">
                <Link to="/como-funciona" className="inline-flex items-center justify-center gap-2 bg-pink-600 text-white px-6 py-3.5 rounded-2xl hover:bg-pink-500 transition-all font-bold shadow-lg shadow-pink-900/20 hover:-translate-y-0.5">
                  Como funciona <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/faq" className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3.5 rounded-2xl hover:bg-white/20 transition-all font-bold backdrop-blur-sm">
                  Perguntas frequentes
                </Link>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
              <div className="rounded-3xl overflow-hidden aspect-square max-w-sm mx-auto shadow-2xl border-4 border-slate-800">
                <ImageWithFallback
                  src={securityImg} alt="Segurança digital"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
              </div>
              {/* Floating badges */}
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center shadow-inner">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900 font-bold">100% gratuito</p>
                  <p className="text-xs text-gray-500 font-medium">Nenhum pagamento</p>
                </div>
              </motion.div>
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center shadow-inner">
                  <Lock className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900 font-bold">Dados protegidos</p>
                  <p className="text-xs text-gray-500 font-medium">Até você decidir</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24 space-y-24">

        {/* ── 6 PILLARS ───────────────────────────────────────────── */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-center mb-16">
            <span className="text-pink-600 text-sm uppercase tracking-widest px-4 py-1.5 bg-pink-50 border border-pink-100/50 rounded-full font-bold">Os pilares</span>
            <h2 className="text-gray-900 text-3xl md:text-4xl mt-5 mb-4" style={{ fontWeight: 800 }}>6 camadas de proteção</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
              Cada mecanismo foi desenhado para um propósito específico. Juntos, formam um ambiente seguro sem perder o calor humano.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((p, i) => (
              <motion.div variants={fadeIn} key={i} className="bg-white rounded-3xl border border-gray-100 p-8 hover:border-pink-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl ${p.color} flex items-center justify-center mb-6 shadow-sm`}>
                  <p.icon className="w-7 h-7" />
                </div>
                <h3 className="text-gray-900 text-lg mb-3" style={{ fontWeight: 800 }}>{p.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── NEVER LIST ──────────────────────────────────────────── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-100/50 rounded-[2.5rem] p-8 md:p-14 shadow-lg shadow-red-900/5 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10 relative z-10">
            <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center shrink-0 shadow-inner">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-gray-900 text-3xl mb-2" style={{ fontWeight: 800 }}>O que NUNCA deve acontecer</h2>
              <p className="text-gray-600 text-lg font-medium">Comportamentos que resultam em suspensão imediata da conta</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 relative z-10">
            {neverList.map((item, i) => (
              <div key={i} className="flex items-start gap-4 bg-white/80 backdrop-blur-sm border border-red-100/50 rounded-2xl p-5 hover:bg-white transition-colors">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5 text-red-600 font-bold" />
                </div>
                <p className="text-sm text-gray-800 leading-relaxed font-medium">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-white border-2 border-red-100 rounded-2xl p-6 flex items-start sm:items-center gap-4 relative z-10 shadow-sm">
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              <strong className="text-gray-900 font-bold">Suspeita de violação?</strong> Use o botão "Denunciar" disponível em qualquer chat, sonho ou perfil. Nossa equipe analisa em até 48h e age imediatamente em casos graves. Você nunca estará sozinho.
            </p>
          </div>
        </motion.section>

        {/* ── SAFETY JOURNEY ──────────────────────────────────────── */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-center mb-16">
            <span className="text-teal-600 text-sm uppercase tracking-widest px-4 py-1.5 bg-teal-50 border border-teal-100/50 rounded-full font-bold">Proteção em cada fase</span>
            <h2 className="text-gray-900 text-3xl md:text-4xl mt-5 mb-4" style={{ fontWeight: 800 }}>Segurança do início ao fim</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">Em cada etapa da jornada, camadas específicas de proteção estão ativas para garantir sua paz de espírito.</p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-6 top-8 bottom-8 w-1 bg-gradient-to-b from-pink-300 via-purple-300 to-teal-300 hidden sm:block rounded-full" />
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-6">
              {journey.map((j, i) => (
                <motion.div variants={fadeIn} key={i} className={`sm:pl-20 relative bg-white border ${j.color} rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow`}>
                  {/* Dot on line */}
                  <div className={`hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full ${j.dot} border-4 border-white shadow-md items-center justify-center z-10`} />
                  
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center shrink-0">
                      <j.icon className="w-6 h-6 text-gray-600" />
                    </div>
                    <h3 className="text-gray-900 text-xl" style={{ fontWeight: 800 }}>Fase {i + 1}: {j.phase}</h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {j.items.map((item, ii) => (
                      <div key={ii} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2">
                        <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />
                        <span className="text-sm text-gray-700 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── REPORT CTA ──────────────────────────────────────────── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 md:p-16 grid md:grid-cols-2 gap-12 items-center shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-pink-500/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-sm border border-pink-500/20">
              <Phone className="w-8 h-8 text-pink-400" />
            </div>
            <h2 className="text-white text-3xl md:text-4xl mb-4" style={{ fontWeight: 800, lineHeight: 1.2 }}>Algo aconteceu?<br />Fale com a gente.</h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-8">
              Sentiu-se desconfortável? Algo fugiu das diretrizes? Nossa equipe está disponível e leva toda situação a sério. Você não precisa tolerar nenhum comportamento inadequado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="mailto:segurança@nextdream.com.br" className="inline-flex items-center justify-center gap-2 bg-pink-600 text-white px-8 py-4 rounded-2xl hover:bg-pink-500 transition-all font-bold text-lg shadow-lg shadow-pink-900/50 hover:-translate-y-0.5">
                Contatar moderação
              </a>
            </div>
          </div>
          
          <div className="space-y-4 relative z-10">
            {[
              { time: '&lt; 2h', label: 'Resposta para casos urgentes' },
              { time: '48h', label: 'Análise e resolução de denúncias' },
              { time: '100%', label: 'Das denúncias são revisadas por humanos' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-5 bg-white/5 border border-white/10 rounded-2xl px-6 py-5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="w-20 shrink-0">
                  <p className="text-pink-400 text-2xl" style={{ fontWeight: 900 }} dangerouslySetInnerHTML={{ __html: s.time }} />
                </div>
                <p className="text-white font-medium text-sm md:text-base leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

      </div>
    </div>
  );
}
