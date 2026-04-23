import { Link } from 'react-router';
import { Heart, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { ApiError, authApi } from '../../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.requestPasswordReset({ email: email.trim() });
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Não foi possível enviar o link de recuperação agora. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center px-4 py-12">
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
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="forgot-password-email" className="text-sm text-gray-700 block mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="forgot-password-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-pink-50 border border-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-pink-300 text-white py-3.5 rounded-xl font-semibold transition-colors"
              >
                {loading ? 'Enviando link...' : 'Enviar link de recuperação'}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-gray-800 mb-2">E-mail enviado!</h3>
              <p className="text-gray-500 text-sm">
                Se o endereço informado estiver cadastrado, enviaremos um link para redefinir sua senha.
              </p>
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
