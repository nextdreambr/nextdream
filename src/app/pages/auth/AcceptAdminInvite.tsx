import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ShieldCheck } from 'lucide-react';
import { ApiError, authApi } from '../../lib/api';
import { useApp } from '../../context/AppContext';
import { AuthCareFrame } from '../../components/auth/AuthCareFrame';

export default function AcceptAdminInvite() {
  const navigate = useNavigate();
  const { login } = useApp();

  const search = useMemo(() => new URLSearchParams(window.location.search), []);
  const initialEmail = search.get('email') ?? '';
  const initialToken = search.get('token') ?? '';

  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const session = await authApi.acceptAdminInvite({
        email: email.trim(),
        token: token.trim(),
        name: name.trim(),
        password,
      });
      login(session);
      navigate('/admin');
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Não foi possível aceitar o convite.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCareFrame
      eyebrow="Convite administrativo"
      title="Acesso administrativo exige cuidado extra."
      description="Conclua o cadastro somente se você reconhece este convite e entende que o painel lida com dados sensíveis."
      icon={ShieldCheck}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="mb-2">
          <ShieldCheck className="mb-4 h-9 w-9 text-[#245b53]" />
          <h2 className="text-2xl font-extrabold leading-tight text-[#241b24]">Aceitar convite de admin</h2>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-[#5c4b52]">
            Conclua seu cadastro para acessar o painel com responsabilidade.
          </p>
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-[#5c4b52]">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-[#ead8c4] bg-[#fffaf4] px-3 py-3 text-sm focus:border-[#a8544a] focus:outline-none focus:ring-2 focus:ring-[#f4cbbd]"
            required
          />
        </div>
        <div>
          <label htmlFor="token" className="mb-1.5 block text-sm font-bold text-[#5c4b52]">Token do convite</label>
          <input
            id="token"
            type="text"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Token do convite"
            className="w-full rounded-xl border border-[#ead8c4] bg-[#fffaf4] px-3 py-3 text-sm focus:border-[#a8544a] focus:outline-none focus:ring-2 focus:ring-[#f4cbbd]"
            required
          />
        </div>
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-bold text-[#5c4b52]">Seu nome</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Seu nome"
            className="w-full rounded-xl border border-[#ead8c4] bg-[#fffaf4] px-3 py-3 text-sm focus:border-[#a8544a] focus:outline-none focus:ring-2 focus:ring-[#f4cbbd]"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-bold text-[#5c4b52]">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Senha"
            className="w-full rounded-xl border border-[#ead8c4] bg-[#fffaf4] px-3 py-3 text-sm focus:border-[#a8544a] focus:outline-none focus:ring-2 focus:ring-[#f4cbbd]"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#245b53] py-3.5 text-sm font-extrabold text-white transition-colors hover:bg-[#17453f] disabled:bg-[#9ed0c1]"
        >
          {loading ? 'Confirmando...' : 'Aceitar convite'}
        </button>

        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </form>
    </AuthCareFrame>
  );
}
