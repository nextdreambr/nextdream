import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import { useState } from 'react';
import { isSandboxEnvironment } from '../../config/environment';
import { useApp } from '../../context/AppContext';
import { ApiError, authApi } from '../../lib/api';
import { AuthCareFrame } from '../../components/auth/AuthCareFrame';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useApp();
  const [searchParams] = useSearchParams();
  const tipo = searchParams.get('tipo');
  const [email, setEmail] = useState(() => searchParams.get('email')?.trim() ?? '');
  const [password, setPassword] = useState('');
  const [verificationHelpEmail, setVerificationHelpEmail] = useState('');

  if (isSandboxEnvironment()) {
    const nextSearch = new URLSearchParams();
    if (tipo) {
      nextSearch.set('tipo', tipo);
    }

    return <Navigate to={`/sandbox${nextSearch.toString() ? `?${nextSearch.toString()}` : ''}`} replace />;
  }

  const routeByRole = (role: 'paciente' | 'apoiador' | 'instituicao' | 'admin') => {
    if (role === 'paciente') return '/paciente/dashboard';
    if (role === 'apoiador') return '/apoiador/dashboard';
    if (role === 'instituicao') return '/instituicao/dashboard';
    return '/admin';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVerificationHelpEmail('');
    setLoading(true);

    try {
      const session = await authApi.login({ email: email.trim(), password });
      login(session);
      if (tipo && session.user.role !== tipo) {
        setError(`Sua conta é do tipo ${session.user.role}. Redirecionando para sua área.`);
      }
      navigate(routeByRole(session.user.role));
    } catch (err) {
      if (err instanceof ApiError && err.message === 'Email verification is required before login') {
        setVerificationHelpEmail(email.trim());
        setError('Confirme seu e-mail para ativar a conta antes de entrar.');
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Não foi possível entrar agora. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCareFrame
      title="Entre para cuidar dos próximos passos."
      description="Sua área reúne sonhos, propostas, conversas e notificações com privacidade e consentimento."
      icon={ShieldCheck}
      footer={(
        <p className="text-sm text-gray-500">
          Não tem conta?{' '}
          <Link to={tipo ? `/cadastro?tipo=${tipo}` : '/cadastro'} className="font-bold text-[#a8544a] hover:text-[#8b3d44]">
            Criar conta gratuita
          </Link>
        </p>
      )}
    >
      <div className="mb-7">
        <HeartHandshake className="mb-4 h-9 w-9 text-[#a8544a]" />
        <h2 className="text-2xl font-extrabold leading-tight text-[#241b24]">Acessar sua conta</h2>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-[#5c4b52]">Use o e-mail cadastrado para continuar.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {verificationHelpEmail && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
            Abra o link enviado para <span className="font-medium">{verificationHelpEmail}</span> para ativar sua conta.
            <div className="mt-2">
              <Link
                to={`/verificar-email?email=${encodeURIComponent(verificationHelpEmail)}`}
                className="text-amber-900 underline underline-offset-2"
              >
                Ver instruções de ativação
              </Link>
            </div>
          </div>
        )}
        <div>
          <label className="mb-1.5 block text-sm text-gray-700">E-mail</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b8e88]" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (verificationHelpEmail) {
                  setVerificationHelpEmail('');
                }
              }}
              placeholder="seu@email.com"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-[#ead8c4] bg-[#fffaf4] py-3 pl-10 pr-4 text-sm focus:border-[#a8544a] focus:outline-none focus:ring-2 focus:ring-[#f4cbbd]"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-gray-700">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b8e88]" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-[#ead8c4] bg-[#fffaf4] py-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#f4cbbd]"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-1.5 flex justify-end">
            <Link to="/esqueci-senha" className="text-xs font-bold text-[#a8544a] hover:text-[#8b3d44]">Esqueci a senha</Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#a8544a] py-3.5 font-extrabold text-white transition-colors hover:bg-[#8b3d44]"
        >
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <>Entrar <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </form>

      <div className="mt-6 rounded-2xl border border-[#c9e5dc] bg-[#e5f4ee] p-4 text-sm font-semibold leading-relaxed text-[#245b53]">
        Contato só avança depois de aceite, e dados sensíveis seguem protegidos durante a jornada.
      </div>
    </AuthCareFrame>
  );
}
