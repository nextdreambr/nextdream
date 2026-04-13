import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ApiError, authApi } from '../../lib/api';
import { useApp } from '../../context/AppContext';

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Aceitar convite de admin</h1>
          <p className="text-sm text-gray-600 mt-1">Conclua seu cadastro para acessar o painel.</p>
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="token" className="text-sm text-gray-700">Token do convite</label>
          <input
            id="token"
            type="text"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Token do convite"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm text-gray-700">Seu nome</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Seu nome"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm text-gray-700">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Senha"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gray-900 hover:bg-black disabled:bg-gray-500 text-white py-2 text-sm"
        >
          {loading ? 'Confirmando...' : 'Aceitar convite'}
        </button>

        {error && <p className="text-sm text-red-700">{error}</p>}
      </form>
    </div>
  );
}
