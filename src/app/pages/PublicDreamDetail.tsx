import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, Calendar, Clock, HeartHandshake, MapPin, Share2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { dreamsApi, PublicDream } from '../lib/api';
import { getSafeDreamVisual, SafeDreamArtwork } from '../components/shared/SafeDreamVisual';

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
      <div className="min-h-screen bg-[#fff8ef]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24 text-center text-[#5c4b52]">
          Carregando sonho...
        </div>
      </div>
    );
  }

  if (!dream) {
    return (
      <div className="min-h-screen bg-[#fff8ef]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
          <div className="bg-white border border-[#eadfd2] rounded-3xl p-10 text-center">
            <h1 className="text-[#241b24] mb-3" style={{ fontWeight: 800, fontSize: '1.5rem' }}>
              Sonho não encontrado
            </h1>
            <p className="text-[#5c4b52] mb-6">Este sonho não está disponível no momento.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 bg-[#a8544a] hover:bg-[#8b3d44] text-white px-5 py-3 rounded-full transition-colors"
                style={{ fontWeight: 600 }}
              >
                Voltar para início
              </button>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 bg-[#fff4d8] hover:bg-[#f7d9c6] text-[#5c4b52] px-5 py-3 rounded-full transition-colors"
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

  const dreamVisual = getSafeDreamVisual(dream.category);

  return (
    <div className="min-h-screen bg-[#fff8ef] text-[#241b24]">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="relative h-72 overflow-hidden bg-[#245b53] sm:h-[400px]">
        <SafeDreamArtwork scene={dreamVisual.scene} alt={dreamVisual.alt} className="h-full opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#241b24]/72 via-[#245b53]/28 to-[#241b24]/48" />

        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 bg-white/12 backdrop-blur-md border border-white/25 hover:bg-white/20 text-white text-sm font-bold px-4 py-2.5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para explorar
          </button>
        </div>

        <div className="absolute top-6 right-6 z-10">
          <span className="text-xs font-bold px-4 py-2 rounded-full bg-[#fff4d8] text-[#8b3d44] bg-opacity-95 backdrop-blur-md shadow-lg border border-white/20">
            {dream.category}
          </span>
        </div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="absolute bottom-8 left-6 md:left-12">
          <p className="mb-1 text-2xl font-bold leading-none text-white drop-shadow-md">História compartilhada com consentimento</p>
          <p className="text-white/90 font-medium flex items-center gap-1.5 drop-shadow-md">
            <MapPin className="w-4 h-4" />
            {dream.patientCity ?? 'Cidade não informada'}
          </p>
        </motion.div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="lg:col-span-2 space-y-8">
            <motion.div variants={fadeIn} className="bg-white rounded-3xl p-8 shadow-sm border border-[#eadfd2]">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#fff4d8] text-[#8b3d44] border border-[#ead8c4] px-3 py-1 rounded-full mb-3">
                {dream.status}
              </span>
              <h1 className="text-[#241b24] leading-tight mb-4" style={{ fontWeight: 800, fontSize: '1.75rem' }}>
                {dream.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-[#5c4b52] font-medium">
                <span className="inline-flex items-center gap-2 bg-[#fff8ef] px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4 text-[#a8544a]" />
                  {dream.format}
                </span>
                <span className="inline-flex items-center gap-2 bg-[#fff8ef] px-3 py-1.5 rounded-lg">
                  <Calendar className="w-4 h-4 text-[#a8544a]" />
                  Publicado em {new Date(dream.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </motion.div>

            <motion.div variants={fadeIn} className="bg-white rounded-3xl p-8 shadow-sm border border-[#eadfd2]">
              <h2 className="text-[#241b24] mb-4" style={{ fontWeight: 800, fontSize: '1.25rem' }}>
                Sobre este sonho
              </h2>
              <p className="text-[#5c4b52] leading-relaxed text-base">{dream.description}</p>
              <div className="mt-6 rounded-2xl border border-[#c9e5dc] bg-[#e5f4ee] p-4">
                <p className="flex items-center gap-2 text-sm font-extrabold text-[#245b53]">
                  <ShieldCheck className="h-4 w-4" />
                  Privacidade e consentimento
                </p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-[#50645d]">
                  Contato e detalhes pessoais só avançam depois de aceite. O apoio esperado é presença, tempo, companhia ou habilidade.
                </p>
              </div>
            </motion.div>

            {related.length > 0 && (
              <motion.div variants={fadeIn} className="pt-6">
                <h2 className="text-[#241b24] mb-6 px-2 flex items-center justify-between" style={{ fontWeight: 800, fontSize: '1.25rem' }}>
                  <span>Outras histórias abertas</span>
                  <Link to="/cadastro?tipo=apoiador" className="text-sm text-[#a8544a] hover:text-[#8b3d44] font-bold flex items-center gap-1">
                    Ver todos <ArrowRight className="w-4 h-4" />
                  </Link>
                </h2>
                <div className="grid sm:grid-cols-3 gap-5">
                  {related.map((item) => (
                    (() => {
                      const relatedVisual = getSafeDreamVisual(item.category);
                      return (
                    <Link
                      key={item.id}
                      to={`/sonhos/${item.id}`}
                      className="group bg-white rounded-2xl overflow-hidden border border-[#eadfd2] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                    >
                      <div className="relative h-32 overflow-hidden">
                        <SafeDreamArtwork scene={relatedVisual.scene} alt={relatedVisual.alt} className="transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#245b53]/65 to-transparent opacity-80" />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <p className="text-[#241b24] text-sm leading-snug line-clamp-2 mb-2 group-hover:text-[#8b3d44] transition-colors" style={{ fontWeight: 700 }}>
                          {item.title}
                        </p>
                        <p className="text-[#5c4b52] text-xs mt-auto flex items-center gap-1 font-medium">
                          <MapPin className="w-3 h-3" />
                          {item.patientCity ?? 'Cidade não informada'}
                        </p>
                      </div>
                    </Link>
                      );
                    })()
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-[#8b3d44]/5 border border-[#eadfd2] sticky top-24">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#e5f4ee] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <HeartHandshake className="w-8 h-8 text-[#245b53]" />
                </div>
                <h3 className="text-[#241b24] mb-2" style={{ fontWeight: 800, fontSize: '1.25rem' }}>
                  Pode oferecer presença?
                </h3>
                <p className="text-[#5c4b52] text-sm leading-relaxed">
                  Cadastre-se como apoiador para enviar uma proposta responsável. Não envolve PIX, vaquinha ou doação em dinheiro.
                </p>
              </div>

              <Link
                to="/cadastro?tipo=apoiador"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#245b53] hover:bg-[#17453f] text-white font-bold py-4 px-6 rounded-full transition-all shadow-lg shadow-[#c9e5dc] hover:-translate-y-0.5 mb-3 text-lg"
              >
                <HeartHandshake className="w-5 h-5" />
                Oferecer presença
              </Link>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: dream.title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-[#fff8ef] hover:text-[#8b3d44] hover:border-[#ecd8c8] text-[#5c4b52] text-sm font-bold py-4 px-6 rounded-2xl border border-[#eadfd2] transition-all shadow-sm"
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
