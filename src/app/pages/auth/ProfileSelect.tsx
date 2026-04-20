import { Link, useNavigate, useSearchParams } from 'react-router';
import { Building2, Star, Heart, ArrowRight, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function ProfileSelect() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('tipo');
  const [selected, setSelected] = useState<'paciente' | 'apoiador' | 'instituicao' | null>(
    initialType === 'paciente'
      ? 'paciente'
      : initialType === 'apoiador'
        ? 'apoiador'
        : initialType === 'instituicao'
          ? 'instituicao'
          : null,
  );
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!selected) return;
    if (selected === 'paciente') {
      navigate('/onboarding/paciente');
      return;
    }
    if (selected === 'apoiador') {
      navigate('/onboarding/apoiador');
      return;
    }

    navigate('/cadastro?tipo=instituicao');
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-gray-800 mb-3" style={{ fontWeight: 700, fontSize: '1.75rem' }}>Como você quer usar o NextDream?</h1>
          <p className="text-gray-500">Escolha seu perfil para começar. Você pode mudar depois.</p>
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs px-4 py-2 rounded-xl mt-3">
            🚫 Sem dinheiro, PIX ou doações. Só conexões humanas.
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mb-8">
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
          </button>

          <button
            onClick={() => setSelected('instituicao')}
            className={`relative text-left p-6 rounded-2xl border-2 transition-all ${
              selected === 'instituicao'
                ? 'border-indigo-600 bg-white shadow-lg shadow-indigo-100'
                : 'border-gray-200 bg-white hover:border-indigo-300'
            }`}
          >
            {selected === 'instituicao' && (
              <div className="absolute top-4 right-4">
                <CheckCircle className="w-5 h-5 text-indigo-600 fill-indigo-100" />
              </div>
            )}
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-gray-800 mb-2">Sou Hospital / ONG</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Quero acompanhar pacientes ou assistidos, publicar sonhos com responsabilidade e intermediar conexões seguras com apoiadores.
            </p>
            <div className="space-y-1.5">
              {['Cadastrar pacientes acompanhados', 'Publicar sonhos em nome deles', 'Filtrar propostas e conduzir o contato'].map(item => (
                <div key={item} className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  {item}
                </div>
              ))}
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
                : selected === 'apoiador'
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
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
