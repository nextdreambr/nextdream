import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, Calendar, Clock, Heart, MapPin, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { dreamsApi, PublicDream } from '../lib/api';

const heroImage = 'https://images.unsplash.com/photo-1646148327698-614edde70c94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function PublicDreamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dreams, setDreams] = useState<PublicDream[]>([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const dream = useMemo(() => dreams.find((item) => item.id === id), [dreams, id]);
  const related = useMemo(() => dreams.filter((item) => item.id !== id).slice(0, 3), [dreams, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24 text-center text-gray-500">
          Carregando sonho...
        </div>
      </div>
    );
  }

  if (!dream) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
          <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center">
            <h1 className="text-gray-900 mb-3" style={{ fontWeight: 800, fontSize: '1.5rem' }}>
              Sonho não encontrado
            </h1>
            <p className="text-gray-500 mb-6">Este sonho não está disponível no momento.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-5 py-3 rounded-xl transition-colors"
                style={{ fontWeight: 600 }}
              >
                Voltar para início
              </button>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 rounded-xl transition-colors"
                style={{ fontWeight: 600 }}
              >
                Retornar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="relative h-72 sm:h-[420px] overflow-hidden bg-gray-900">
        <ImageWithFallback src={heroImage} alt={dream.title} className="w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-pink-700/60 via-black/20 to-black/60" />

        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white text-sm font-bold px-4 py-2.5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para explorar
          </button>
        </div>

        <div className="absolute top-6 right-6 z-10">
          <span className="text-xs font-bold px-4 py-2 rounded-full bg-pink-100 text-pink-700 bg-opacity-95 backdrop-blur-md shadow-lg border border-white/20">
            {dream.category}
          </span>
        </div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="absolute bottom-8 left-6 md:left-12">
          <p className="text-white text-2xl font-bold leading-none mb-1 drop-shadow-md">{dream.patientName ?? 'Paciente'}</p>
          <p className="text-white/90 font-medium flex items-center gap-1.5 drop-shadow-md">
            <MapPin className="w-4 h-4" />
            {dream.patientCity ?? 'Cidade não informada'}
          </p>
        </motion.div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="lg:col-span-2 space-y-8">
            <motion.div variants={fadeIn} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full mb-3">
                {dream.status}
              </span>
              <h1 className="text-gray-900 leading-tight mb-4" style={{ fontWeight: 800, fontSize: '1.75rem' }}>
                {dream.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 font-medium">
                <span className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4 text-pink-500" />
                  {dream.format}
                </span>
                <span className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <Calendar className="w-4 h-4 text-pink-500" />
                  Publicado em {new Date(dream.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </motion.div>

            <motion.div variants={fadeIn} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-gray-900 mb-4" style={{ fontWeight: 800, fontSize: '1.25rem' }}>
                Sobre este sonho
              </h2>
              <p className="text-gray-600 leading-relaxed text-base">{dream.description}</p>
            </motion.div>

            {related.length > 0 && (
              <motion.div variants={fadeIn} className="pt-6">
                <h2 className="text-gray-900 mb-6 px-2 flex items-center justify-between" style={{ fontWeight: 800, fontSize: '1.25rem' }}>
                  <span>Outros sonhos esperando</span>
                  <Link to="/cadastro?tipo=apoiador" className="text-sm text-pink-600 hover:text-pink-700 font-bold flex items-center gap-1">
                    Ver todos <ArrowRight className="w-4 h-4" />
                  </Link>
                </h2>
                <div className="grid sm:grid-cols-3 gap-5">
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      to={`/sonhos/${item.id}`}
                      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                    >
                      <div className="relative h-32 overflow-hidden">
                        <ImageWithFallback src={heroImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-pink-700/60 to-transparent opacity-80" />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <p className="text-gray-900 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-pink-600 transition-colors" style={{ fontWeight: 700 }}>
                          {item.title}
                        </p>
                        <p className="text-gray-500 text-xs mt-auto flex items-center gap-1 font-medium">
                          <MapPin className="w-3 h-3" />
                          {item.patientCity ?? 'Cidade não informada'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="space-y-6">
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
                <Share2 className="w-4 h-4" />
                Compartilhar sonho
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
