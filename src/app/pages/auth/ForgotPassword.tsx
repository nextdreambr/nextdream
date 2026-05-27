import { Link } from 'react-router';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { ApiError, authApi } from '../../lib/api';
import { AuthCareFrame } from '../../components/auth/AuthCareFrame';

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
    <AuthCareFrame
      title="Recupere o acesso com segurança."
      description="Enviaremos um link para redefinir sua senha sem expor dados da conta ou detalhes da sua jornada."
      footer={(
        <Link to="/login" className="inline-flex items-center justify-center gap-2 text-sm font-extrabold text-[#a8544a] hover:text-[#8b3d44]">
          <ArrowLeft className="w-4 h-4" /> Voltar para o login
        </Link>
      )}
    >
      <div className="mb-7">
        <Mail className="mb-4 h-9 w-9 text-[#a8544a]" />
        <h2 className="text-2xl font-extrabold leading-tight text-[#241b24]">Enviar link de recuperação</h2>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-[#5c4b52]">
          Use o e-mail cadastrado. Se ele existir na plataforma, enviaremos as instruções.
        </p>
      </div>

      {!sent ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="forgot-password-email" className="mb-1.5 block text-sm font-bold text-[#5c4b52]">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b8e88]" />
              <input
                id="forgot-password-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-[#ead8c4] bg-[#fffaf4] py-3 pl-10 pr-4 text-sm focus:border-[#a8544a] focus:outline-none focus:ring-2 focus:ring-[#f4cbbd]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#a8544a] py-3.5 font-extrabold text-white transition-colors hover:bg-[#8b3d44] disabled:bg-[#e4aaa0]"
          >
            {loading ? 'Enviando link...' : 'Enviar link de recuperação'}
          </button>
        </form>
      ) : (
        <div className="rounded-2xl border border-[#c9e5dc] bg-[#e5f4ee] px-5 py-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white">
            <CheckCircle className="h-6 w-6 text-[#245b53]" />
          </div>
          <h3 className="mb-2 text-xl font-extrabold text-[#241b24]">E-mail enviado!</h3>
          <p className="text-sm font-semibold leading-relaxed text-[#50645d]">
            Se o endereço informado estiver cadastrado, enviaremos um link para redefinir sua senha.
          </p>
        </div>
      )}
    </AuthCareFrame>
  );
}
