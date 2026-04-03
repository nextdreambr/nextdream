import { Link, useNavigate, useSearchParams } from 'react-router';
import { Star, Heart, ArrowRight, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function ProfileSelect() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('tipo');
  const [selected, setSelected] = useState<'paciente' | 'apoiador' | null>(
    initialType === 'paciente' ? 'paciente' : initialType === 'apoiador' ? 'apoiador' : null
  );
  const navigate = useNavigate();
  const { login } = useApp();

  const handleContinue = () => {
    if (!selected) return;
    login(selected);
    navigate(selected === 'paciente' ? '/onboarding/paciente' : '/onboarding/apoiador');
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-gray-800 mb-3" style={{ fontWeight: 700, fontSize: '1.75rem' }}>Como você quer usar o NextDream?</h1>
          <p className="text-gray-500">Escolha seu perfil para começar. Você pode mudar depois.</p>
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs px-4 py-2 rounded-xl mt-3">
            🚫 Sem dinheiro, PIX ou doações. Só conexões humanas.
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setSelected('paciente')}
            className={`relative text-left p-6 rounded-2xl border-2 transition-all ${
              selected === 'paciente'
                ? 'border-pink-600 bg-white shadow-lg shadow-pink-100'
                : 'border-gray-200 bg-white hover:border-pink-300'
            }`}
          >
            {selected === 'paciente' && (
              <div className="absolute top-4 right-4">
                <CheckCircle className="w-5 h-5 text-pink-600 fill-pink-100" />
              </div>
            )}
            <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-gray-800 mb-2">Sou Paciente ou Familiar</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Quero compartilhar um sonho ou desejo de alguém especial e encontrar pessoas dispostas a ajudar com presença e carinho.
            </p>
            <div className="space-y-1.5">
              {['Publicar sonhos e desejos', 'Receber propostas de apoiadores', 'Conversar e combinar detalhes'].map(item => (
                <div key={item} className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-4 p-2 bg-pink-50 rounded-lg">
              <p className="text-xs text-pink-600">💡 Pode ser para você ou para alguém que você cuida</p>
            </div>
          </button>

          <button
            onClick={() => setSelected('apoiador')}
            className={`relative text-left p-6 rounded-2xl border-2 transition-all ${
              selected === 'apoiador'
                ? 'border-teal-600 bg-white shadow-lg shadow-teal-100'
                : 'border-gray-200 bg-white hover:border-teal-300'
            }`}
          >
            {selected === 'apoiador' && (
              <div className="absolute top-4 right-4">
                <CheckCircle className="w-5 h-5 text-teal-600 fill-teal-100" />
              </div>
            )}
            <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-gray-800 mb-2">Sou Apoiador</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Quero oferecer meu tempo, habilidades e presença para ajudar alguém a realizar um sonho. Sem exigência financeira.
            </p>
            <div className="space-y-1.5">
              {['Explorar sonhos publicados', 'Enviar propostas de ajuda', 'Conectar e realizar juntos'].map(item => (
                <div key={item} className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-4 p-2 bg-teal-50 rounded-lg">
              <p className="text-xs text-teal-600">💚 Você oferece tempo, companhia e habilidades</p>
            </div>
          </button>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all
            ${selected
              ? selected === 'paciente'
                ? 'bg-pink-600 hover:bg-pink-700 text-white'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
        >
          Continuar <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Já tem conta?{' '}
          <Link to="/login" className="text-pink-600 hover:text-pink-700 font-medium">Entrar</Link>
        </p>
      </div>
    </div>
  );
}