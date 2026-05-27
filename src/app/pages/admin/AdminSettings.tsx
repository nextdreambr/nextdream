import { FormEvent, useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { AdminSettingsPayload, ApiError, adminApi } from '../../lib/api';
import { formatAdminDateTime } from './components/adminPageUtils';

type SettingsTab = 'regras' | 'categorias' | 'textos';

const emptySettings: AdminSettingsPayload = {
  blockedWords: [],
  rules: [],
  categories: [],
  institutionalTexts: [],
};

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('regras');
  const [settings, setSettings] = useState<AdminSettingsPayload>(emptySettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newWord, setNewWord] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      setLoading(true);
      setError('');

      try {
        const data = await adminApi.getSettings();
        if (mounted) {
          setSettings(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof ApiError ? err.message : 'Não foi possível carregar as configurações.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  function addBlockedWord() {
    const normalized = newWord.trim().toLowerCase();
    if (!normalized) return;

    setSettings((current) => ({
      ...current,
      blockedWords: current.blockedWords.includes(normalized)
        ? current.blockedWords
        : [...current.blockedWords, normalized],
    }));
    setNewWord('');
  }

  function addCategory() {
    const name = newCategoryName.trim();
    if (!name) return;

    setSettings((current) => ({
      ...current,
      categories: [
        ...current.categories,
        {
          id: `cat-${crypto.randomUUID()}`,
          name,
        },
      ],
    }));
    setNewCategoryName('');
    setShowNewCategory(false);
  }

  async function handleSave(event?: FormEvent) {
    event?.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        blockedWords: settings.blockedWords,
        rules: settings.rules,
        categories: settings.categories,
        institutionalTexts: settings.institutionalTexts,
      };
      const saved = await adminApi.updateSettings(payload);
      setSettings(saved);
      setSuccess('Configurações salvas com sucesso.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar as configurações.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Configurações</h1>
          <p className="text-sm text-gray-500">Regras, categorias e textos institucionais com persistência real.</p>
          {settings.updatedAt && (
            <p className="mt-1 text-xs text-gray-400">Última atualização: {formatAdminDateTime(settings.updatedAt)}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm text-white transition hover:bg-orange-600 disabled:bg-orange-300"
        >
          <Save className="size-4" />
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'regras', label: 'Regras' },
          { key: 'categorias', label: 'Categorias' },
          { key: 'textos', label: 'Textos' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as SettingsTab)}
            className={`rounded-xl px-4 py-2 text-sm transition ${
              activeTab === tab.key
                ? 'bg-orange-500 text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:border-orange-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        {loading ? (
          <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-6 text-sm text-orange-700">
            Carregando configurações...
          </div>
        ) : (
          <>
            {activeTab === 'regras' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Palavras bloqueadas</h2>
                  <p className="text-sm text-gray-500">Ajuste os termos sensíveis que precisam de bloqueio operacional.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {settings.blockedWords.map((word) => (
                    <span key={word} className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700">
                      <span>{word}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSettings((current) => ({
                            ...current,
                            blockedWords: current.blockedWords.filter((item) => item !== word),
                          }))
                        }
                        className="text-red-500 hover:text-red-700"
                        aria-label={`Remover ${word}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={newWord}
                    onChange={(event) => setNewWord(event.target.value)}
                    placeholder="Nova palavra bloqueada..."
                    className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={addBlockedWord}
                    className="rounded-xl bg-gray-900 px-4 py-2 text-sm text-white transition hover:bg-black"
                  >
                    Adicionar
                  </button>
                </div>

                <div className="space-y-3">
                  {settings.rules.map((rule) => (
                    <label key={rule.id} className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{rule.label}</div>
                        <div className="text-xs text-gray-500">{rule.description}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(event) =>
                          setSettings((current) => ({
                            ...current,
                            rules: current.rules.map((item) =>
                              item.id === rule.id ? { ...item, enabled: event.target.checked } : item,
                            ),
                          }))
                        }
                        aria-label={rule.label}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'categorias' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Categorias operacionais</h2>
                    <p className="text-sm text-gray-500">Gerencie as categorias exibidas na jornada de sonhos.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory((current) => !current)}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Plus className="size-4" />
                    Nova categoria
                  </button>
                </div>

                {showNewCategory && (
                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                    <label className="space-y-1 text-sm text-gray-700">
                      <span>Nome da categoria</span>
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(event) => setNewCategoryName(event.target.value)}
                        placeholder="Nome da categoria"
                        className="w-full rounded-xl border border-gray-300 px-3 py-2"
                      />
                    </label>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={addCategory}
                        className="rounded-xl bg-orange-500 px-4 py-2 text-sm text-white transition hover:bg-orange-600"
                      >
                        Criar categoria
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategory(false);
                          setNewCategoryName('');
                        }}
                        className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-white"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  {settings.categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                      <span className="text-sm text-gray-900">{category.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSettings((current) => ({
                            ...current,
                            categories: current.categories.filter((item) => item.id !== category.id),
                          }))
                        }
                        aria-label={`Remover ${category.name}`}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'textos' && (
              <form className="space-y-4" onSubmit={(event) => void handleSave(event)}>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Textos institucionais</h2>
                  <p className="text-sm text-gray-500">Edite os avisos e microcopys usados pelo painel e pela plataforma.</p>
                </div>

                {settings.institutionalTexts.map((text) => (
                  <label key={text.id} className="block space-y-1 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                    <span className="font-medium text-gray-900">{text.label}</span>
                    <textarea
                      value={text.text}
                      onChange={(event) =>
                        setSettings((current) => ({
                          ...current,
                          institutionalTexts: current.institutionalTexts.map((item) =>
                            item.id === text.id ? { ...item, text: event.target.value } : item,
                          ),
                        }))
                      }
                      className="min-h-24 w-full rounded-xl border border-gray-300 bg-white px-3 py-2"
                    />
                  </label>
                ))}
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
