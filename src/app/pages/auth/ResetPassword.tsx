import { Link, useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError, authApi } from '../../lib/api';
import { AuthCareFrame } from '../../components/auth/AuthCareFrame';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const redirectTimeoutRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (redirectTimeoutRef.current !== null) {
      window.clearTimeout(redirectTimeoutRef.current);
    }
  }, []);

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
      redirectTimeoutRef.current = window.setTimeout(() => navigate('/login'), 1200);
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
    <AuthCareFrame
      title="Crie uma nova senha com calma."
      description="Use uma senha segura para voltar ao NextDream mantendo sua conta e suas conversas protegidas."
      icon={Lock}
      footer={(
        <Link to="/login" className="inline-flex items-center justify-center gap-2 text-sm font-extrabold text-[#a8544a] hover:text-[#8b3d44]">
          <ArrowLeft className="w-4 h-4" /> Voltar para o login
        </Link>
      )}
    >
      <div className="mb-7">
        <Lock className="mb-4 h-9 w-9 text-[#a8544a]" />
        <h2 className="text-2xl font-extrabold leading-tight text-[#241b24]">Definir nova senha</h2>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-[#5c4b52]">
          O link precisa estar válido. Sua senha deve ter pelo menos 8 caracteres.
        </p>
      </div>

      {success ? (
        <div className="rounded-2xl border border-[#c9e5dc] bg-[#e5f4ee] px-5 py-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white">
            <CheckCircle className="h-6 w-6 text-[#245b53]" />
          </div>
          <h3 className="mb-2 text-xl font-extrabold text-[#241b24]">Senha atualizada</h3>
          <p className="text-sm font-semibold leading-relaxed text-[#50645d]">
            Sua senha foi redefinida com sucesso. Redirecionando para o login.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="reset-password-new" className="mb-1.5 block text-sm font-bold text-[#5c4b52]">
              Nova senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b8e88]" />
              <input
                id="reset-password-new"
                type="password"
                value={newPassword}
                minLength={8}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-[#ead8c4] bg-[#fffaf4] py-3 pl-10 pr-4 text-sm focus:border-[#a8544a] focus:outline-none focus:ring-2 focus:ring-[#f4cbbd]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reset-password-confirm" className="mb-1.5 block text-sm font-bold text-[#5c4b52]">
              Confirmar nova senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b8e88]" />
              <input
                id="reset-password-confirm"
                type="password"
                value={confirmPassword}
                minLength={8}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-[#ead8c4] bg-[#fffaf4] py-3 pl-10 pr-4 text-sm focus:border-[#a8544a] focus:outline-none focus:ring-2 focus:ring-[#f4cbbd]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full rounded-full bg-[#a8544a] py-3.5 font-extrabold text-white transition-colors hover:bg-[#8b3d44] disabled:bg-[#e4aaa0]"
          >
            {loading ? 'Atualizando senha...' : 'Salvar nova senha'}
          </button>
        </form>
      )}
    </AuthCareFrame>
  );
}
