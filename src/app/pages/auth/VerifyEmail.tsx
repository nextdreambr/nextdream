import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ArrowLeft, CheckCircle, Heart, MailCheck } from 'lucide-react';
import { ApiError, ApiUserRole, authApi } from '../../lib/api';

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
    <div className="min-h-screen bg-pink-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <h1 className="text-gray-800" style={{ fontWeight: 700, fontSize: '1.5rem' }}>
            {status === 'success' ? 'Conta ativada' : 'Verifique seu e-mail'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {status === 'success'
              ? 'A confirmação foi concluída com sucesso.'
              : 'Ative sua conta pelo link enviado para seu e-mail.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-8">
          {status === 'loading' && (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="w-6 h-6 border-2 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
              </div>
              <h3 className="text-gray-800 mb-2">Ativando sua conta...</h3>
              <p className="text-gray-500 text-sm">
                Estamos confirmando seu e-mail para liberar o acesso ao NextDream.
              </p>
            </div>
          )}

          {status === 'idle' && (
            <div className="text-center py-2 space-y-4">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto">
                <MailCheck className="w-6 h-6 text-pink-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-gray-800">Confirme seu e-mail para ativar a conta</h3>
                <p className="text-gray-500 text-sm">
                  {email
                    ? `Enviamos um link de ativação para ${email}.`
                    : 'Abra o e-mail enviado no cadastro e clique no link de ativação.'}
                </p>
                <p className="text-gray-500 text-sm">{idleDescription}</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-2 space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-gray-800">Seu e-mail foi confirmado</h3>
                <p className="text-gray-500 text-sm">{successDescription}</p>
              </div>
              <Link
                to={loginHref}
                className="inline-flex items-center justify-center rounded-xl bg-pink-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-pink-700"
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
              <p className="text-sm text-gray-500">
                Se o link estiver expirado ou já tiver sido usado, abra o último e-mail enviado no cadastro e tente
                novamente.
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to={loginHref} className="flex items-center justify-center gap-2 text-pink-600 hover:text-pink-700 text-sm">
            <ArrowLeft className="w-4 h-4" /> Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
