import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, MapPin, Clock, Heart, CheckCircle, Sparkles, Users, Calendar, Share2 } from 'lucide-react';
import { publicDreams } from '../data/publicDreams';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { motion } from 'motion/react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function PublicDreamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dream = publicDreams.find((d) => d.id === id) ?? publicDreams[0];

  const related = publicDreams.filter((d) => d.id !== dream.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="relative h-72 sm:h-[450px] overflow-hidden bg-gray-900">
        <ImageWithFallback
          src={dream.img}
          alt={dream.title}
          className="w-full h-full object-cover opacity-70"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${dream.accent} via-black/20 to-black/60`} />

        {/* Botão voltar */}
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white text-sm font-bold px-4 py-2.5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para explorar
          </button>
        </div>

        {/* Tag categoria */}
        <div className="absolute top-6 right-6 z-10">
          <span className={`text-xs font-bold px-4 py-2 rounded-full ${dream.tagColor} bg-opacity-95 backdrop-blur-md shadow-lg border border-white/20`}>
            {dream.tag}
          </span>
        </div>

        {/* Info do paciente */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="absolute bottom-8 left-6 md:left-12 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/95 border-4 border-white flex items-center justify-center shadow-xl">
            <span className="text-pink-600 text-xl" style={{ fontWeight: 800 }}>{dream.initials}</span>
          </div>
          <div>
            <p className="text-white text-2xl font-bold leading-none mb-1 drop-shadow-md">
              {dream.name}{dream.age ? `, ${dream.age} anos` : ''}
            </p>
            <p className="text-white/90 font-medium flex items-center gap-1.5 drop-shadow-md">
              <MapPin className="w-4 h-4" />{dream.city}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Conteúdo ──────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Coluna principal */}
          <motion.div initial="hidden" animate="visible" variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }} className="lg:col-span-2 space-y-8">

            {/* Título e status */}
            <motion.div variants={fadeIn} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              {dream.hasProposal && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full mb-3">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {dream.status}
                </span>
              )}
              {!dream.hasProposal && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  {dream.status}
                </span>
              )}

              <h1 className="text-gray-900 leading-tight mb-4" style={{ fontWeight: 800, fontSize: '1.75rem' }}>
                {dream.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 font-medium">
                <span className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4 text-pink-500" />
                  {dream.time} de duração
                </span>
                <span className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <Calendar className="w-4 h-4 text-pink-500" />
                  {dream.format}
                </span>
              </div>
            </motion.div>

            {/* História completa */}
            <motion.div variants={fadeIn} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h2 className="text-gray-900 mb-4 flex items-center gap-2" style={{ fontWeight: 800, fontSize: '1.25rem' }}>
                <Sparkles className="w-5 h-5 text-pink-500" />
                A história por trás do sonho
              </h2>
              <p className="text-gray-600 leading-relaxed text-base">
                {dream.fullDesc}
              </p>
            </motion.div>

            {/* O que o apoiador vai fazer */}
            <motion.div variants={fadeIn} className="bg-pink-50/50 border border-pink-100/50 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200/20 rounded-bl-[100px] -z-10" />
              <h2 className="text-pink-900 mb-3 flex items-center gap-2" style={{ fontWeight: 800, fontSize: '1.25rem' }}>
                <Heart className="w-5 h-5 text-pink-500" />
                O que você vai fazer como apoiador
              </h2>
              <p className="text-pink-800 text-base leading-relaxed font-medium">
                {dream.what}
              </p>
            </motion.div>

            {/* Sonhos relacionados */}
            <motion.div variants={fadeIn} className="pt-6">
              <h2 className="text-gray-900 mb-6 px-2 flex items-center justify-between" style={{ fontWeight: 800, fontSize: '1.25rem' }}>
                <span>Outros sonhos esperando</span>
                <Link to="/cadastro?tipo=apoiador" className="text-sm text-pink-600 hover:text-pink-700 font-bold flex items-center gap-1">Ver todos <ArrowRight className="w-4 h-4" /></Link>
              </h2>
              <div className="grid sm:grid-cols-3 gap-5">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    to={`/sonhos/${r.id}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                  >
                    <div className="relative h-32 overflow-hidden">
                      <ImageWithFallback
                        src={r.img}
                        alt={r.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${r.accent} to-transparent opacity-80`} />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <p className="text-gray-900 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-pink-600 transition-colors" style={{ fontWeight: 700 }}>
                        {r.title}
                      </p>
                      <p className="text-gray-500 text-xs mt-auto flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3" />{r.city}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Coluna lateral — CTA */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="space-y-6">

            {/* Card de ação principal */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-pink-900/5 border border-pink-100/50 sticky top-24">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
                  <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
                </div>
                <h3 className="text-gray-900 mb-2" style={{ fontWeight: 800, fontSize: '1.25rem' }}>
                  Quer ajudar neste sonho?
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Cadastre-se como apoiador e envie sua proposta. É 100% gratuito.
                </p>
              </div>

              <Link
                to="/cadastro?tipo=apoiador"
                className="w-full inline-flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-pink-200 hover:-translate-y-0.5 mb-3 text-lg"
              >
                <Heart className="w-5 h-5" />
                Quero ajudar
              </Link>

              <Link
                to="/login?tipo=apoiador"
                className="w-full inline-flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-3.5 px-5 rounded-2xl transition-colors text-sm"
              >
                Já tenho conta — entrar
              </Link>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                {[
                  { icon: Users, text: 'Sem intermediação financeira' },
                  { icon: CheckCircle, text: 'Apoiadores verificados' },
                  { icon: Sparkles, text: 'Experiência 100% voluntária' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                    <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-pink-500" />
                    </div>
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Compartilhar */}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: dream.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 text-gray-700 text-sm font-bold py-4 px-6 rounded-2xl border border-gray-200 transition-all shadow-sm"
            >
              <Share2 className="w-5 h-5" />
              Compartilhar este sonho
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
