import { Link } from 'react-router';
import { Heart, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <h1 className="text-gray-800" style={{ fontWeight: 700, fontSize: '1.5rem' }}>Recuperar senha</h1>
          <p className="text-gray-500 text-sm mt-1">Enviaremos um link para redefinir sua senha</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-8">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm text-gray-700 block mb-1.5">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" placeholder="seu@email.com"
                    className="w-full pl-10 pr-4 py-3 bg-pink-50 border border-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300" />
                </div>
              </div>
              <button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3.5 rounded-xl font-semibold transition-colors">
                Enviar link de recuperação
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-gray-800 mb-2">E-mail enviado!</h3>
              <p className="text-gray-500 text-sm">Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</p>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/login" className="flex items-center justify-center gap-2 text-pink-600 hover:text-pink-700 text-sm">
            <ArrowLeft className="w-4 h-4" /> Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}