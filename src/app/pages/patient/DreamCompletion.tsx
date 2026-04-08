import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Heart, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { ApiError, PublicDream, dreamsApi } from '../../lib/api';

const RATINGS = [1, 2, 3, 4, 5];

const emoticons = ['😢', '😕', '😐', '😊', '🤩'];

export default function DreamCompletion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dream, setDream] = useState<PublicDream | null>(null);
  const [loadError, setLoadError] = useState('');

  const [step, setStep] = useState<'celebrate' | 'feedback' | 'done'>('celebrate');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!id) return;
      try {
        const dreams = await dreamsApi.listMine();
        if (!mounted) return;
        setDream(dreams.find((item) => item.id === id) ?? null);
      } catch (err) {
        if (err instanceof ApiError) setLoadError(err.message);
        else setLoadError('Não foi possível carregar o sonho concluído.');
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSubmitFeedback = () => {
    setSubmitting(true);
    setTimeout(() => {
      setStep('done');
      setSubmitting(false);
    }, 1000);
  };

  if (step === 'celebrate') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-600 via-fuchsia-600 to-rose-500 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md">
          {/* Confetti-like decorations */}
          <div className="relative mb-8">
            <div className="absolute -top-8 -left-8 text-4xl animate-bounce">🎉</div>
            <div className="absolute -top-4 -right-6 text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</div>
            <div className="absolute -bottom-2 -left-4 text-3xl animate-bounce" style={{ animationDelay: '0.4s' }}>🌟</div>

            <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto border-4 border-white/30">
              <Heart className="w-14 h-14 text-white fill-white" />
            </div>
          </div>

          <h1 className="text-white mb-3" style={{ fontWeight: 800, fontSize: '2rem', lineHeight: 1.2 }}>
            Sonho realizado! 🎊
          </h1>
          <p className="text-white/80 text-lg mb-2" style={{ fontWeight: 600 }}>
            "{dream?.title ?? 'Seu sonho'}"
          </p>
          <p className="text-pink-200 text-sm leading-relaxed mb-8">
            Que momento lindo! Você merecia cada segundo disso. O NextDream é feito de histórias como a sua.
          </p>

          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 mb-6 text-left border border-white/20">
            <p className="text-white text-sm font-semibold mb-3">O que acontece agora?</p>
            <div className="space-y-2.5">
              {[
                { icon: '⭐', text: 'Seu sonho foi marcado como concluído' },
                { icon: '💬', text: 'O chat com seu apoiador permanece disponível' },
                { icon: '🌟', text: 'Sua história pode inspirar outros pacientes' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-white/90 text-sm">
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setStep('feedback')}
              className="flex items-center justify-center gap-2 bg-white text-pink-700 px-8 py-4 rounded-xl font-semibold hover:bg-pink-50 transition-colors w-full"
            >
              <Star className="w-5 h-5" />
              Deixar meu depoimento
            </button>
            <button
              onClick={() => navigate('/paciente/sonhos')}
              className="text-white/70 hover:text-white text-sm transition-colors"
            >
              Pular por agora
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'feedback') {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6">
            {/* Dream info */}
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-pink-50">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-2xl">
                🌟
              </div>
              <div>
                <p className="text-xs text-pink-600 font-medium mb-0.5">Sonho concluído</p>
                <p className="text-sm font-semibold text-gray-800 leading-snug">{dream?.title ?? 'Sonho'}</p>
              </div>
            </div>

            <h2 className="text-gray-800 mb-1" style={{ fontWeight: 700 }}>Como foi a experiência?</h2>
            <p className="text-gray-500 text-sm mb-6">Seu feedback ajuda outros pacientes e apoiadores.</p>

            {/* Star rating */}
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-700 mb-3">Avalie a experiência geral</p>
              <div className="flex items-center gap-3 justify-center">
                {RATINGS.map(r => (
                  <button
                    key={r}
                    onClick={() => setRating(r)}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <span
                      className={`text-3xl transition-transform group-hover:scale-110 ${rating >= r ? 'grayscale-0' : 'grayscale opacity-40'}`}
                    >
                      {emoticons[r - 1]}
                    </span>
                    <span className={`text-[10px] ${rating === r ? 'text-pink-600 font-semibold' : 'text-gray-400'}`}>
                      {['Ruim', 'Regular', 'Ok', 'Bom', 'Incrível'][r - 1]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conte um pouco sobre sua experiência
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={4}
                placeholder="Como foi o encontro? O apoiador cumpriu o que prometeu? Esse momento foi especial de alguma forma?"
                className="w-full px-4 py-3 bg-pink-50 border border-pink-100 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{comment.length}/500 caracteres</p>
            </div>

            {/* Anonymous option */}
            <label className="flex items-center gap-3 cursor-pointer mb-6 p-3 bg-gray-50 rounded-xl">
              <div
                onClick={() => setAnonymous(!anonymous)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${anonymous ? 'bg-pink-600 border-pink-600' : 'border-gray-300'}`}
              >
                {anonymous && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Manter anônimo</p>
                <p className="text-xs text-gray-500">Seu nome não aparecerá no depoimento público</p>
              </div>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('celebrate')}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={rating === 0 || submitting}
                className="flex-1 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Enviar <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Done screen
  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-gray-800 mb-3" style={{ fontWeight: 700, fontSize: '1.5rem' }}>
          Obrigada pelo depoimento! 💜
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Sua história vai inspirar outros pacientes a também compartilharem seus sonhos. O NextDream existe por causa de momentos como o seu.
        </p>
        <div className="bg-white rounded-2xl border border-pink-100 p-5 mb-6 text-left">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <span key={s} className={`text-sm ${s <= rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
              ))}
            </div>
            <span className="text-xs text-gray-500">{anonymous ? 'Anônimo' : 'Você'}</span>
          </div>
          {comment && (
            <p className="text-sm text-gray-600 italic leading-relaxed">"{comment}"</p>
          )}
        </div>
        {loadError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 mb-4">
            {loadError}
          </div>
        )}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/paciente/sonhos/criar')}
            className="flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors"
          >
            <Star className="w-5 h-5" />
            Compartilhar um novo sonho
          </button>
          <button
            onClick={() => navigate('/paciente/dashboard')}
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            Ir para o painel
          </button>
        </div>
      </div>
    </div>
  );
}
