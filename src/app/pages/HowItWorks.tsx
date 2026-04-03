import { Star, Heart, MessageCircle, CheckCircle, ArrowRight, Sparkles, Clock, Users, Shield } from 'lucide-react';
import { Link } from 'react-router';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { motion } from 'motion/react';

const connectingImg = "https://images.unsplash.com/photo-1770822788455-f14be32b0d00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwY2FyZSUyMGNvbXBhc3Npb24lMjB2b2x1bnRlZXJ8ZW58MXx8fHwxNzcyODAzNDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const dreamImg      = "https://images.unsplash.com/photo-1646369506164-f8f24d4d6d81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZCUyMGNhbmNlciUyMHBhdGllbnQlMjBzbWlsaW5nJTIwaG9wZXxlbnwxfHx8fDE3NzI4MDM0NDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

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

const patientSteps = [
  {
    n: '01', icon: Star, color: 'bg-pink-100 text-pink-600', border: 'border-pink-200',
    title: 'Compartilhe seu sonho',
    desc: 'Em minutos descreva o que você deseja — uma tarde de companhia, aprender algo novo, ouvir uma história, visitar um lugar especial. Sem burocracia, sem julgamento.',
    tip: 'Sonhos com descrições carinhosas recebem mais propostas.',
  },
  {
    n: '02', icon: Heart, color: 'bg-rose-100 text-rose-600', border: 'border-rose-200',
    title: 'Receba propostas',
    desc: 'Apoiadores que se identificam com seu sonho enviam propostas com mensagem, disponibilidade e o que oferecem. Você escolhe com quem deseja se conectar.',
    tip: 'Você não precisa aceitar nenhuma proposta que não lhe pareça certa.',
  },
  {
    n: '03', icon: MessageCircle, color: 'bg-purple-100 text-purple-600', border: 'border-purple-200',
    title: 'Converse com segurança',
    desc: 'Ao aceitar uma proposta, um chat privado se abre. Combinem todos os detalhes — data, local, necessidades específicas — com total segurança e moderação.',
    tip: 'Nenhum dado pessoal é exposto antes da sua aceitação.',
  },
  {
    n: '04', icon: Sparkles, color: 'bg-amber-100 text-amber-600', border: 'border-amber-200',
    title: 'Realize e celebre!',
    desc: 'Viva a experiência. Depois, marque seu sonho como concluído e celebre essa conexão especial que só existiu por causa de você.',
    tip: 'Cada sonho realizado inspira outros a publicarem os seus.',
  },
];

const supporterSteps = [
  {
    n: '01', icon: Users, color: 'bg-teal-100 text-teal-600', border: 'border-teal-200',
    title: 'Crie seu perfil',
    desc: 'Conte o que você pode oferecer: tempo livre, habilidades, transporte, companhia, escuta ativa. Configure sua disponibilidade e localização de forma simples.',
    tip: 'Perfis verificados geram mais confiança e mais conexões.',
  },
  {
    n: '02', icon: Star, color: 'bg-sky-100 text-sky-600', border: 'border-sky-200',
    title: 'Explore os sonhos',
    desc: 'Navegue pelos sonhos publicados com filtros por categoria, formato (presencial/remoto) e urgência. Encontre aquele que ressoa com você.',
    tip: 'Filtre por "urgente" para priorizar quem mais precisa.',
  },
  {
    n: '03', icon: Heart, color: 'bg-pink-100 text-pink-600', border: 'border-pink-200',
    title: 'Envie uma proposta',
    desc: 'Apresente-se com carinho, conte o que pode oferecer e aceite o termo de conduta (sem dinheiro, apenas presença). Sua proposta chega diretamente ao paciente.',
    tip: 'Propostas personalizadas têm muito mais chance de aceite.',
  },
  {
    n: '04', icon: CheckCircle, color: 'bg-green-100 text-green-600', border: 'border-green-200',
    title: 'Conecte e realize',
    desc: 'Após aceite, o chat é liberado. Combine todos os detalhes e faça a diferença concreta na vida de alguém — sem nenhum custo financeiro para nenhum dos dois lados.',
    tip: 'Você está prestes a fazer algo que nenhum dinheiro compra.',
  },
];

export default function HowItWorks() {
  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-pink-600 via-pink-500 to-rose-400 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-rose-300/20 blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-28 relative">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="text-center max-w-3xl mx-auto">
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white/90 px-4 py-1.5 rounded-full text-sm mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Como funciona o NextDream
            </motion.div>
            <motion.h1 variants={fadeIn} className="text-4xl md:text-5xl text-white mb-5" style={{ fontWeight: 800, lineHeight: 1.1 }}>
              Do sonho à realidade,<br />passo a passo
            </motion.h1>
            <motion.p variants={fadeIn} className="text-pink-100 text-lg max-w-xl mx-auto leading-relaxed">
              Uma jornada pensada para ter o mínimo de fricção e o máximo de humanidade — para quem sonha e para quem apoia.
            </motion.p>
          </motion.div>

          {/* Stats */}
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="grid grid-cols-3 gap-4 mt-12 max-w-lg mx-auto">
            {[
              { n: '100%', label: 'Gratuito' },
              { n: '4 passos', label: 'Simples' },
              { n: '0 dados', label: 'Expostos' },
            ].map((s) => (
              <motion.div variants={fadeIn} key={s.n} className="text-center bg-white/10 border border-white/20 rounded-2xl py-4 px-2 hover:bg-white/20 transition-colors">
                <p className="text-white text-xl" style={{ fontWeight: 800 }}>{s.n}</p>
                <p className="text-pink-100 text-xs mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── IMAGE BREAK ──────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }} className="relative h-56 md:h-72 overflow-hidden">
        <ImageWithFallback
          src={connectingImg} alt="Conexão humana"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-rose-400/30 to-transparent" />
        <div className="absolute inset-0 flex items-end justify-center pb-6">
          <div className="bg-white/90 backdrop-blur-sm border border-white/60 rounded-2xl px-6 py-3 shadow-lg">
            <p className="text-gray-700 text-sm text-center" style={{ fontWeight: 500 }}>
              💛 Nenhuma transação financeira — apenas tempo, presença e carinho
            </p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-20">

        {/* ── PARA PACIENTES ───────────────────────────────────────── */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center shadow-inner">
              <Star className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-xs text-pink-500 uppercase tracking-widest mb-0.5" style={{ fontWeight: 600 }}>Para pacientes e familiares</p>
              <h2 className="text-gray-800 text-2xl md:text-3xl" style={{ fontWeight: 800 }}>Compartilhe um sonho, receba carinho</h2>
            </div>
          </motion.div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-[calc(12.5%-1px)] right-[calc(12.5%-1px)] h-0.5 bg-gradient-to-r from-pink-200 via-rose-200 to-purple-200" style={{ zIndex: 0 }} />

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 relative" style={{ zIndex: 1 }}>
              {patientSteps.map(s => (
                <motion.div variants={fadeIn} key={s.n} className={`bg-white rounded-3xl border ${s.border} p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center shadow-sm`}>
                      <s.icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl text-gray-100" style={{ fontWeight: 900 }}>{s.n}</span>
                  </div>
                  <div>
                    <h3 className="text-gray-900 text-lg mb-2" style={{ fontWeight: 700 }}>{s.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                  </div>
                  <div className="mt-auto pt-4 border-t border-gray-50">
                    <p className="text-xs text-gray-400 leading-snug font-medium">💡 {s.tip}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="mt-12 flex justify-center">
            <Link
              to="/selecionar-perfil?tipo=paciente"
              className="inline-flex items-center gap-2 bg-pink-600 text-white px-8 py-4 rounded-2xl hover:bg-pink-700 transition-all shadow-lg shadow-pink-200 hover:-translate-y-0.5 text-lg"
              style={{ fontWeight: 700 }}
            >
              <Star className="w-5 h-5" /> Compartilhar meu sonho
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </section>

        {/* ── DIVIDER ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-100" />
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
            <Heart className="w-3.5 h-3.5 text-teal-500" />
            <span className="text-xs text-gray-500">E do outro lado…</span>
          </div>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* ── PARA APOIADORES ─────────────────────────────────────── */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 flex items-center justify-center shadow-inner">
              <Heart className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-teal-500 uppercase tracking-widest mb-0.5" style={{ fontWeight: 600 }}>Para apoiadores</p>
              <h2 className="text-gray-800 text-2xl md:text-3xl" style={{ fontWeight: 800 }}>Doe tempo. Receba gratidão.</h2>
            </div>
          </motion.div>

          <div className="relative">
            <div className="hidden md:block absolute top-16 left-[calc(12.5%-1px)] right-[calc(12.5%-1px)] h-0.5 bg-gradient-to-r from-teal-200 via-sky-200 to-green-200" style={{ zIndex: 0 }} />
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 relative" style={{ zIndex: 1 }}>
              {supporterSteps.map(s => (
                <motion.div variants={fadeIn} key={s.n} className={`bg-white rounded-3xl border ${s.border} p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center shadow-sm`}>
                      <s.icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl text-gray-100" style={{ fontWeight: 900 }}>{s.n}</span>
                  </div>
                  <div>
                    <h3 className="text-gray-900 text-lg mb-2" style={{ fontWeight: 700 }}>{s.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                  </div>
                  <div className="mt-auto pt-4 border-t border-gray-50">
                    <p className="text-xs text-gray-400 leading-snug font-medium">💡 {s.tip}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="mt-12 flex justify-center">
            <Link
              to="/selecionar-perfil?tipo=apoiador"
              className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-2xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-200 hover:-translate-y-0.5 text-lg"
              style={{ fontWeight: 700 }}
            >
              <Heart className="w-5 h-5" /> Quero ser apoiador
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </section>

        {/* ── DREAM IMAGE ─────────────────────────────────────────── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="rounded-3xl overflow-hidden relative h-64 md:h-96 shadow-2xl">
          <ImageWithFallback
            src={dreamImg} alt="Sonho realizado"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16">
            <div className="bg-pink-600/20 text-pink-100 border border-pink-500/30 inline-flex items-center w-max px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-sm">O que acontece no final</div>
            <h3 className="text-white text-3xl md:text-5xl max-w-lg leading-tight" style={{ fontWeight: 800 }}>
              Um sonho realizado. Uma vida transformada.
            </h3>
          </div>
        </motion.section>

        {/* ── SAFETY TEASER ───────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-pink-400" />
              <span className="text-pink-400 text-sm" style={{ fontWeight: 600 }}>Segurança em cada passo</span>
            </div>
            <h3 className="text-white text-2xl mb-3" style={{ fontWeight: 700 }}>Projetado para proteger quem mais precisa</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Nenhum dado de contato é exposto antes da aceitação. Chat só abre após escolha do paciente. Bloqueio automático de qualquer conteúdo financeiro.
            </p>
            <Link to="/seguranca" className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 text-sm transition-colors" style={{ fontWeight: 600 }}>
              Ver todos os mecanismos de segurança <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
            {[
              { icon: Shield, text: 'Dados protegidos até o aceite' },
              { icon: Clock, text: 'Moderação em tempo real' },
              { icon: CheckCircle, text: 'Zero transações financeiras' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <item.icon className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-slate-300 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
