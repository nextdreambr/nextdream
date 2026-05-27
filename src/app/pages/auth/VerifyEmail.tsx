import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ArrowLeft, CheckCircle, MailCheck } from 'lucide-react';
import { ApiError, ApiUserRole, authApi } from '../../lib/api';
import { AuthCareFrame } from '../../components/auth/AuthCareFrame';

type PublicRole = Exclude<ApiUserRole, 'admin'>;
type VerificationStatus = 'idle' | 'loading' | 'success' | 'error';

function getRoleFromSearchParam(value: string | null): PublicRole | null {
  if (value === 'paciente' || value === 'apoiador' || value === 'instituicao') {
    return value;
  }

  return null;
}

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const email = searchParams.get('email')?.trim() ?? '';
  const role = getRoleFromSearchParam(searchParams.get('role'));
  const [status, setStatus] = useState<VerificationStatus>(token ? 'loading' : 'idle');
  const [error, setError] = useState('');
  const requestedTokenRef = useRef<string | null>(null);

  const loginHref = useMemo(() => {
    const nextSearch = new URLSearchParams();
    if (email) {
      nextSearch.set('email', email);
    }
    if (role) {
      nextSearch.set('tipo', role);
    }

    const query = nextSearch.toString();
    return `/login${query ? `?${query}` : ''}`;
  }, [email, role]);

  useEffect(() => {
    if (!token || requestedTokenRef.current === token) {
      return;
    }

    requestedTokenRef.current = token;
    setStatus('loading');
    setError('');

    void authApi.verifyEmail({ token })
      .then(() => {
        setStatus('success');
      })
      .catch((err) => {
        setStatus('error');
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Não foi possível confirmar seu e-mail agora. Tente novamente.');
        }
      });
  }, [token]);

  const idleDescription = role === 'instituicao'
    ? 'Depois da confirmação do e-mail, sua conta institucional seguirá em análise da equipe.'
    : 'Depois da confirmação do e-mail, sua conta será ativada e você poderá entrar normalmente.';
  const successDescription = role === 'instituicao'
    ? 'Seu e-mail foi confirmado. Agora sua conta institucional aguarda a aprovação da equipe.'
    : 'Seu e-mail foi confirmado. Sua conta já pode ser usada no próximo login.';

  return (
    <AuthCareFrame
      title={status === 'success' ? 'Conta ativada com segurança.' : 'Confirme seu e-mail antes de entrar.'}
      description={status === 'success'
        ? 'A confirmação foi concluída. Agora o próximo passo acontece dentro da sua área.'
        : 'A ativação por e-mail protege o acesso antes de qualquer conversa ou história sensível.'}
      icon={MailCheck}
      footer={(
        <Link to={loginHref} className="inline-flex items-center justify-center gap-2 text-sm font-extrabold text-[#a8544a] hover:text-[#8b3d44]">
          <ArrowLeft className="w-4 h-4" /> Voltar para o login
        </Link>
      )}
    >
      <div className="mb-7">
        <MailCheck className="mb-4 h-9 w-9 text-[#a8544a]" />
        <h2 className="text-2xl font-extrabold leading-tight text-[#241b24]">
          {status === 'success' ? 'Conta ativada' : 'Verifique seu e-mail'}
        </h2>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-[#5c4b52]">
          {status === 'success'
            ? 'A confirmação foi concluída com sucesso.'
            : 'Ative sua conta pelo link enviado para seu e-mail.'}
        </p>
      </div>

          {status === 'loading' && (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fff4d8]">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#f4cbbd] border-t-[#a8544a]" />
              </div>
              <h3 className="mb-2 text-xl font-extrabold text-[#241b24]">Ativando sua conta...</h3>
              <p className="text-sm font-semibold text-[#5c4b52]">
                Estamos confirmando seu e-mail para liberar o acesso ao NextDream.
              </p>
            </div>
          )}

          {status === 'idle' && (
            <div className="text-center py-2 space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff4d8]">
                <MailCheck className="h-6 w-6 text-[#a8544a]" />
              </div>
              <div className="space-y-2">
                <h3 className="font-extrabold text-[#241b24]">Confirme seu e-mail para ativar a conta</h3>
                <p className="text-sm font-semibold text-[#5c4b52]">
                  {email
                    ? `Enviamos um link de ativação para ${email}.`
                    : 'Abra o e-mail enviado no cadastro e clique no link de ativação.'}
                </p>
                <p className="text-sm font-semibold text-[#5c4b52]">{idleDescription}</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-2 space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e5f4ee]">
                <CheckCircle className="h-6 w-6 text-[#245b53]" />
              </div>
              <div className="space-y-2">
                <h3 className="font-extrabold text-[#241b24]">Seu e-mail foi confirmado</h3>
                <p className="text-sm font-semibold text-[#5c4b52]">{successDescription}</p>
              </div>
              <Link
                to={loginHref}
                className="inline-flex items-center justify-center rounded-full bg-[#a8544a] px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-[#8b3d44]"
              >
                Ir para o login
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error || 'Não foi possível confirmar seu e-mail com este link.'}
              </div>
              <p className="text-sm font-semibold text-[#5c4b52]">
                Se o link estiver expirado ou já tiver sido usado, abra o último e-mail enviado no cadastro e tente
                novamente.
              </p>
            </div>
          )}
    </AuthCareFrame>
  );
}
