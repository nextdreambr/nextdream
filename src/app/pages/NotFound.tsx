import { Link } from 'react-router';
import { Heart, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-pink-400" />
        </div>
        <h1 className="text-gray-800 mb-3" style={{ fontWeight: 700, fontSize: '1.5rem' }}>Página não encontrada</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Ops! A página que você está buscando não existe ou foi movida. Mas não se preocupe — há muitos sonhos esperando por você!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            Ir para o início
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 border border-pink-200 text-pink-600 hover:bg-pink-50 px-6 py-3 rounded-xl text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
