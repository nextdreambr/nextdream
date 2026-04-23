import { Link, useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, CheckCircle, Heart, Lock } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { ApiError, authApi } from '../../lib/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!token) {
      setError('O link de redefinição é inválido ou está incompleto.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas precisam ser iguais.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authApi.confirmPasswordReset({
        token,
        newPassword,
      });
      setSuccess(true);
      window.setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Não foi possível redefinir sua senha agora. Tente novamente.');
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
          <h1 className="text-gray-800" style={{ fontWeight: 700, fontSize: '1.5rem' }}>Criar nova senha</h1>
          <p className="text-gray-500 text-sm mt-1">Defina uma senha nova para voltar ao NextDream</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-gray-800 mb-2">Senha atualizada!</h3>
              <p className="text-gray-500 text-sm">
                Sua senha foi redefinida com sucesso. Redirecionando para o login.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="reset-password-new" className="text-sm text-gray-700 block mb-1.5">
                  Nova senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="reset-password-new"
                    type="password"
                    value={newPassword}
                    minLength={8}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-pink-50 border border-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reset-password-confirm" className="text-sm text-gray-700 block mb-1.5">
                  Confirmar nova senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="reset-password-confirm"
                    type="password"
                    value={confirmPassword}
                    minLength={8}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-pink-50 border border-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-pink-300 text-white py-3.5 rounded-xl font-semibold transition-colors"
              >
                {loading ? 'Atualizando senha...' : 'Salvar nova senha'}
              </button>
            </form>
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
