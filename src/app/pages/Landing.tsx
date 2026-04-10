import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Heart, Star, ArrowRight, Shield, MapPin, Clock, Sparkles, Users, HandHeart } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { motion } from 'motion/react';
import { dreamsApi, PublicDream as ApiPublicDream } from '../lib/api';

const heroImage = "https://images.unsplash.com/photo-1646148327698-614edde70c94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGNoaWxkJTIwaG9zcGl0YWwlMjB2b2x1bnRlZXIlMjBwbGF5aW5nfGVufDF8fHx8MTc3MjgxOTc1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

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

export default function Landing() {
  const navigate = useNavigate();
  const [dreams, setDreams] = useState<ApiPublicDream[]>([]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const items = await dreamsApi.listPublic();
        if (!isMounted) return;
        setDreams(items);
      } catch {
        if (!isMounted) return;
        setDreams([]);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="overflow-x-hidden bg-white">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-40 lg:min-h-[90vh] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback 
            src={heroImage} 
            alt="Conexão humana" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gray-900/65" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white border border-white/20 px-5 py-2 rounded-full text-sm font-bold mb-8 shadow-sm">
              <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
              Sem dinheiro. Só humanidade.
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-4xl sm:text-5xl lg:text-7xl text-white mb-8 tracking-tight" style={{ fontWeight: 900, lineHeight: 1.1 }}>
              Realize sonhos com o poder da <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">conexão real</span>.
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-lg md:text-2xl text-gray-200 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
              O NextDream conecta quem tem um desejo especial com quem tem tempo, habilidade e vontade de fazer o bem.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-5 justify-center mb-16">
              <Link
                to="/cadastro?tipo=apoiador"
                className="flex items-center justify-center gap-3 bg-pink-600 hover:bg-pink-500 text-white px-8 py-4 rounded-2xl transition-all shadow-lg shadow-pink-900/50 hover:-translate-y-1 text-lg"
                style={{ fontWeight: 700 }}
              >
                <HandHeart className="w-6 h-6" />
                Quero Ajudar
              </Link>
              <Link
                to="/cadastro?tipo=paciente"
                className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 px-8 py-4 rounded-2xl transition-all text-lg"
                style={{ fontWeight: 700 }}
              >
                <Star className="w-6 h-6" />
                Preciso de Apoio
              </Link>
            </motion.div>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-300 text-sm font-medium">
              <div className="flex items-center gap-3">
                <span><strong className="text-white">Comunidade ativa</strong> em todo o Brasil</span>
              </div>
              <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-gray-500" />
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-pink-400" />
                <span>Ambiente 100% seguro</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ─────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-pink-600 font-bold tracking-wider text-sm uppercase mb-3 block">Simples e Humano</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Como a magia acontece</h2>
            <p className="text-gray-500 text-lg">Três passos para transformar a vida de alguém sem precisar abrir a carteira.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-pink-100 via-pink-300 to-pink-100 z-0" />
            
            {[
              { icon: Star, title: "O Pedido", desc: "Pacientes e idosos compartilham seus sonhos, desejos e necessidades na plataforma." },
              { icon: Users, title: "O Encontro", desc: "Apoiadores veem os sonhos e enviam propostas oferecendo seu tempo ou habilidades." },
              { icon: Sparkles, title: "A Realização", desc: "Vocês conversam pelo chat, combinam os detalhes e vivem um momento inesquecível." }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
                className="relative z-10 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-pink-100 transition-all text-center group"
              >
                <div className="w-20 h-20 mx-auto bg-pink-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-pink-600 transition-all duration-300">
                  <step.icon className="w-8 h-8 text-pink-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SONHOS EM DESTAQUE ───────────────────────────────── */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="max-w-2xl">
              <span className="text-pink-600 font-bold tracking-wider text-sm uppercase mb-3 block">Sonhos Abertos</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Esperando por você</h2>
              <p className="text-gray-500 text-lg">Pessoas reais com desejos simples. Escolha com quem você quer se conectar hoje.</p>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
              <Link to="/cadastro?tipo=apoiador" className="inline-flex items-center gap-2 text-pink-600 font-bold hover:text-pink-800 transition-colors group">
                Explorar todos os sonhos
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {dreams.slice(0, 3).map((dream) => {
              const title = dream.title;
              const initials = (dream.patientName ?? 'ND')
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((chunk) => chunk[0]?.toUpperCase() ?? '')
                .join('');

              return (
              <motion.div key={dream.id} variants={fadeIn}>
                <Link
                  to={`/sonhos/${dream.id}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full"
                >
                  <div className="relative h-56 overflow-hidden">
                    <ImageWithFallback
                      src={heroImage}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-700/60 to-transparent opacity-80" />
                    <div className="absolute top-4 left-4">
                      <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-pink-100 text-pink-700 bg-opacity-90 backdrop-blur-sm shadow-sm">
                        {dream.category}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border-2 border-white flex items-center justify-center shadow-md overflow-hidden">
                        <span className="text-pink-600 text-sm font-bold">{initials || 'ND'}</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-bold leading-none mb-1">{dream.patientName ?? 'Paciente'}</p>
                        <p className="text-white/90 text-xs flex items-center gap-1 font-medium">
                          <MapPin className="w-3 h-3" />{dream.patientCity ?? 'Cidade não informada'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-pink-600 transition-colors">
                      {title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed flex-1 line-clamp-3 mb-6">
                      {dream.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <span className="inline-flex items-center gap-1.5 text-gray-400 text-xs font-medium">
                        <Clock className="w-4 h-4" />
                        {dream.format}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate('/cadastro?tipo=apoiador');
                        }}
                        className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 hover:bg-pink-600 hover:text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        Quero ajudar
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
              );
            })}
          </motion.div>
          {dreams.length === 0 && (
            <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center">
              <p className="text-gray-800 mb-2" style={{ fontWeight: 700 }}>Nenhum sonho público disponível agora.</p>
              <p className="text-gray-500 text-sm mb-6">Novas histórias aparecem aqui assim que forem publicadas.</p>
              <Link
                to="/cadastro?tipo=apoiador"
                className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-5 py-3 rounded-xl transition-colors"
                style={{ fontWeight: 600 }}
              >
                Quero ser apoiador
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── COMMUNITY VALUES ───────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-pink-600 font-bold tracking-wider text-sm uppercase mb-3 block">Compromissos da Comunidade</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Conexões com segurança e respeito</h2>
            <p className="text-gray-500 text-lg">A plataforma prioriza privacidade, conduta responsável e apoio sem transações financeiras.</p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { title: 'Privacidade por padrão', text: 'Dados de contato não são expostos antes de uma conexão válida entre as partes.' },
              { title: 'Sem dinheiro na plataforma', text: 'Pedidos de transferência, PIX ou qualquer valor financeiro são proibidos.' },
              { title: 'Moderação e denúncia', text: 'Conteúdo e interações passam por revisão, com canal de denúncia e resposta operacional.' },
            ].map((item) => (
              <motion.div key={item.title} variants={fadeIn} className="bg-pink-50/50 rounded-3xl p-8 border border-pink-100/50">
                <h3 className="text-gray-900 text-lg mb-3" style={{ fontWeight: 700 }}>{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────── */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-pink-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
              O tempo é o presente mais valioso.
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Junte-se à nossa comunidade hoje. Seja para realizar um sonho ou para ajudar a realizá-lo. Todo mundo sai transformado.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/cadastro?tipo=paciente"
                className="flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-500 text-white px-8 py-4 rounded-2xl transition-all shadow-lg hover:-translate-y-1 font-bold text-lg">
                <Star className="w-5 h-5" />
                Preciso de Apoio
              </Link>
              <Link to="/cadastro?tipo=apoiador"
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-2xl transition-all font-bold text-lg">
                <HandHeart className="w-5 h-5" />
                Quero ser Apoiador
              </Link>
            </div>
            <p className="text-gray-400 text-sm mt-8 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              100% gratuito. Nenhuma cobrança financeira permitida.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
