import { useState, useRef, useEffect } from 'react';
import { Save, Plus, X, Shield, Tag, FileText, Bell, AlertTriangle, Pencil, Trash2, Check } from 'lucide-react';
import { dreamCategories } from '../../data/mockData';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Template {
  id: string;
  title: string;
  text: string;
}

interface InstitutionalText {
  id: string;
  label: string;
  text: string;
}

interface Rule {
  id: string;
  label: string;
  desc: string;
  enabled: boolean;
}

// ─── Initial data ─────────────────────────────────────────────────────────────

const initialWords = ['pix', 'doação', 'doacao', 'transferência', 'transferencia', 'pagamento', 'dinheiro', 'r$', 'vaquinha', 'arrecadação', 'crowdfunding'];

const initialCategories = dreamCategories.map((c, i) => ({ id: `cat-${i}`, name: c }));

const initialTemplates: Template[] = [
  { id: 't1', title: 'Videochamada', text: 'Posso te ajudar por videochamada! Tenho disponibilidade nos fins de semana e me adaptarei ao seu horário.' },
  { id: 't2', title: 'Presencial', text: 'Posso comparecer presencialmente! Moro na mesma região e tenho transporte disponível.' },
  { id: 't3', title: 'Ensino', text: 'Tenho experiência nessa área e adoraria ensinar no seu ritmo, com total paciência e dedicação.' },
];

const initialTexts: InstitutionalText[] = [
  { id: 'txt1', label: 'Aviso anti-dinheiro (chat)', text: 'O NextDream não permite pedidos de dinheiro, PIX ou doações. Ajuste sua mensagem.' },
  { id: 'txt2', label: 'Aviso ao criar sonho', text: 'Seu sonho não pode envolver pedidos de dinheiro, PIX, transferências ou doações financeiras.' },
  { id: 'txt3', label: 'Microcopy no onboarding', text: 'Sem pedidos de dinheiro. Só conexões humanas.' },
  { id: 'txt4', label: 'Mensagem de boas-vindas (paciente)', text: 'Bem-vindo ao NextDream! Compartilhe seu sonho e encontre apoiadores que queiram estar ao seu lado.' },
  { id: 'txt5', label: 'Mensagem de boas-vindas (apoiador)', text: 'Bem-vindo ao NextDream! Aqui você encontrará pessoas que sonham com sua presença e companhia.' },
];

const initialRules: Rule[] = [
  { id: 'r1', label: 'Bloqueio em tempo real no chat', desc: 'Impede o envio de mensagens com termos financeiros', enabled: true },
  { id: 'r2', label: 'Validação ao criar sonho', desc: 'Escaneia título e descrição do sonho antes de publicar', enabled: true },
  { id: 'r3', label: 'Validação em propostas', desc: 'Escaneia a mensagem da proposta ao enviar', enabled: true },
  { id: 'r4', label: 'Alerta automático ao admin', desc: 'Notifica admin quando houver tentativa bloqueada', enabled: false },
  { id: 'r5', label: 'Suspensão automática após 3 infrações', desc: 'Suspende o usuário automaticamente ao atingir o limite', enabled: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-green-600 text-white text-sm px-4 py-3 rounded-2xl shadow-lg">
      <Check className="w-4 h-4" /> {msg}
    </div>
  );
}

// ─── Tab: Regras ──────────────────────────────────────────────────────────────

function TabRegras({ words, setWords }: { words: string[]; setWords: React.Dispatch<React.SetStateAction<string[]>> }) {
  const [newWord, setNewWord] = useState('');
  const [editingWord, setEditingWord] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const inputRef = useRef<HTMLInputElement>(null);

  const addWord = () => {
    const w = newWord.trim().toLowerCase();
    if (w && !words.includes(w)) { setWords(p => [...p, w]); setNewWord(''); }
  };

  const startEdit = (word: string) => { setEditingWord(word); setEditValue(word); };
  const saveEdit = () => {
    const v = editValue.trim().toLowerCase();
    if (v && !words.includes(v)) setWords(p => p.map(w => w === editingWord ? v : w));
    setEditingWord(null);
  };

  const toggleRule = (id: string) => setRules(p => p.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-800 mb-1" style={{ fontWeight: 600 }}>Palavras e termos bloqueados</h2>
        <p className="text-gray-500 text-sm">Quando detectadas em sonhos ou mensagens de chat, o envio é bloqueado com aviso ao usuário.</p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <p className="text-sm text-red-700" style={{ fontWeight: 600 }}>Regra fundamental do NextDream</p>
        </div>
        <p className="text-xs text-red-600 leading-relaxed">
          Nenhuma transação financeira é permitida na plataforma. Qualquer pedido de dinheiro, PIX, doação ou compensação financeira resulta em bloqueio da mensagem e, em caso de reincidência, suspensão do usuário.
        </p>
      </div>

      {/* Word list */}
      <div>
        <p className="text-sm text-gray-700 mb-3" style={{ fontWeight: 500 }}>Lista de termos bloqueados <span className="text-gray-400 font-normal">({words.length})</span></p>
        <div className="flex flex-wrap gap-2 mb-4">
          {words.map(word => (
            <span key={word} className="group flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-xl text-xs">
              {editingWord === word ? (
                <>
                  <input
                    ref={inputRef}
                    autoFocus
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingWord(null); }}
                    className="w-24 bg-white border border-red-300 rounded px-1.5 py-0.5 text-xs focus:outline-none"
                  />
                  <button onClick={saveEdit} className="text-green-600 hover:text-green-800"><Check className="w-3 h-3" /></button>
                  <button onClick={() => setEditingWord(null)} className="text-gray-400 hover:text-gray-600"><X className="w-3 h-3" /></button>
                </>
              ) : (
                <>
                  {word}
                  <button onClick={() => startEdit(word)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity ml-0.5">
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button onClick={() => setWords(p => p.filter(w => w !== word))} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </>
              )}
            </span>
          ))}
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={newWord}
            onChange={e => setNewWord(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addWord(); }}
            placeholder="Nova palavra bloqueada..."
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <button
            onClick={addWord}
            disabled={!newWord.trim()}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>
      </div>

      {/* Toggles */}
      <div>
        <p className="text-sm text-gray-700 mb-3" style={{ fontWeight: 500 }}>Regras de validação automática</p>
        <div className="space-y-2">
          {rules.map(rule => (
            <button
              key={rule.id}
              onClick={() => toggleRule(rule.id)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
            >
              <div>
                <p className="text-sm text-gray-700" style={{ fontWeight: 500 }}>{rule.label}</p>
                <p className="text-xs text-gray-500">{rule.desc}</p>
              </div>
              <div className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ml-4 ${rule.enabled ? 'bg-orange-500' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${rule.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Categorias ──────────────────────────────────────────────────────────

function TabCategorias() {
  const [cats, setCats] = useState(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const startEdit = (id: string, name: string) => { setEditingId(id); setEditValue(name); };
  const saveEdit = (id: string) => {
    const v = editValue.trim();
    if (v) setCats(p => p.map(c => c.id === id ? { ...c, name: v } : c));
    setEditingId(null);
  };

  const addCat = () => {
    const v = newName.trim();
    if (v) { setCats(p => [...p, { id: uid(), name: v }]); setNewName(''); setShowAdd(false); }
  };

  const deleteCat = (id: string) => {
    setCats(p => p.filter(c => c.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-gray-800 mb-1" style={{ fontWeight: 600 }}>Categorias de sonhos</h2>
        <p className="text-gray-500 text-sm">Gerencie as categorias disponíveis para classificar sonhos. <span className="text-gray-400">{cats.length} categorias ativas.</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {cats.map(cat => (
          <div key={cat.id} className="group flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition-colors">
            {editingId === cat.id ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  autoFocus
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(cat.id); if (e.key === 'Escape') setEditingId(null); }}
                  className="flex-1 px-3 py-1.5 bg-white border border-orange-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
                <button onClick={() => saveEdit(cat.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : deleteConfirm === cat.id ? (
              <div className="flex items-center gap-2 flex-1">
                <p className="text-xs text-red-600 flex-1">Remover <span style={{ fontWeight: 600 }}>"{cat.name}"</span>?</p>
                <button onClick={() => deleteCat(cat.id)} className="px-2.5 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors">Remover</button>
                <button onClick={() => setDeleteConfirm(null)} className="px-2.5 py-1 border border-gray-200 text-xs rounded-lg hover:bg-gray-100 transition-colors">Cancelar</button>
              </div>
            ) : (
              <>
                <span className="text-sm text-gray-700">{cat.name}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(cat.id, cat.name)} className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteConfirm(cat.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add new */}
      {showAdd ? (
        <div className="flex gap-2">
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addCat(); if (e.key === 'Escape') { setShowAdd(false); setNewName(''); } }}
            placeholder="Nome da categoria..."
            className="flex-1 px-4 py-2.5 bg-white border border-orange-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
          <button onClick={addCat} disabled={!newName.trim()} className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm hover:bg-orange-600 disabled:opacity-40 transition-colors">
            <Check className="w-4 h-4" /> Salvar
          </button>
          <button onClick={() => { setShowAdd(false); setNewName(''); }} className="px-4 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-orange-300 hover:text-orange-500 transition-colors w-full justify-center"
        >
          <Plus className="w-4 h-4" /> Nova categoria
        </button>
      )}
    </div>
  );
}

// ─── Tab: Templates ───────────────────────────────────────────────────────────

function TabTemplates() {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editText, setEditText] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const startEdit = (t: Template) => { setEditingId(t.id); setEditTitle(t.title); setEditText(t.text); };
  const saveEdit = (id: string) => {
    if (editTitle.trim()) {
      setTemplates(p => p.map(t => t.id === id ? { ...t, title: editTitle.trim(), text: editText.trim() } : t));
    }
    setEditingId(null);
  };

  const addTemplate = () => {
    if (newTitle.trim()) {
      setTemplates(p => [...p, { id: uid(), title: newTitle.trim(), text: newText.trim() }]);
      setNewTitle(''); setNewText(''); setShowAdd(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-gray-800 mb-1" style={{ fontWeight: 600 }}>Templates de mensagem</h2>
        <p className="text-gray-500 text-sm">Templates disponíveis para apoiadores ao enviar propostas.</p>
      </div>

      <div className="space-y-3">
        {templates.map(t => (
          <div key={t.id} className="border border-gray-200 rounded-xl overflow-hidden">
            {editingId === t.id ? (
              <div className="p-4 space-y-3 bg-orange-50">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block" style={{ fontWeight: 500 }}>Título</label>
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-orange-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block" style={{ fontWeight: 500 }}>Texto</label>
                  <textarea
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-orange-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(t.id)} className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm rounded-xl hover:bg-orange-600 transition-colors">
                    <Check className="w-3.5 h-3.5" /> Salvar
                  </button>
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 border border-gray-200 text-gray-500 text-sm rounded-xl hover:bg-gray-50 transition-colors">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : deleteConfirm === t.id ? (
              <div className="p-4 bg-red-50 flex items-center gap-3">
                <p className="text-xs text-red-600 flex-1">Remover o template <span style={{ fontWeight: 600 }}>"{t.title}"</span>?</p>
                <button onClick={() => { setTemplates(p => p.filter(x => x.id !== t.id)); setDeleteConfirm(null); }} className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-xl hover:bg-red-700 transition-colors">Remover</button>
                <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 border border-gray-200 text-xs rounded-xl hover:bg-gray-100 transition-colors">Cancelar</button>
              </div>
            ) : (
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>{t.title}</p>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(t)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-600 hover:bg-orange-50 px-2.5 py-1.5 rounded-lg transition-colors">
                      <Pencil className="w-3 h-3" /> Editar
                    </button>
                    <button onClick={() => setDeleteConfirm(t.id)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors">
                      <Trash2 className="w-3 h-3" /> Remover
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{t.text}</p>
              </div>
            )}
          </div>
        ))}

        {/* Add new template */}
        {showAdd ? (
          <div className="border-2 border-orange-300 rounded-xl p-4 space-y-3 bg-orange-50">
            <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>Novo template</p>
            <div>
              <label className="text-xs text-gray-600 mb-1 block" style={{ fontWeight: 500 }}>Título</label>
              <input
                autoFocus
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Ex: Artista, Professor, Companhia online..."
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block" style={{ fontWeight: 500 }}>Texto do template</label>
              <textarea
                value={newText}
                onChange={e => setNewText(e.target.value)}
                placeholder="Ex: Tenho disponibilidade para ajudar com..."
                rows={3}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={addTemplate} disabled={!newTitle.trim()} className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm rounded-xl hover:bg-orange-600 disabled:opacity-40 transition-colors">
                <Check className="w-3.5 h-3.5" /> Criar template
              </button>
              <button onClick={() => { setShowAdd(false); setNewTitle(''); setNewText(''); }} className="px-4 py-2 border border-gray-200 text-gray-500 text-sm rounded-xl hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-orange-300 hover:text-orange-500 transition-colors w-full justify-center"
          >
            <Plus className="w-4 h-4" /> Novo template
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Textos ──────────────────────────────────────────────────────────────

function TabTextos() {
  const [texts, setTexts] = useState<InstitutionalText[]>(initialTexts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newText, setNewText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const startEdit = (t: InstitutionalText) => { setEditingId(t.id); setEditValue(t.text); };
  const saveEdit = (id: string) => {
    setTexts(p => p.map(t => t.id === id ? { ...t, text: editValue } : t));
    setEditingId(null);
  };

  const addText = () => {
    if (newLabel.trim()) {
      setTexts(p => [...p, { id: uid(), label: newLabel.trim(), text: newText.trim() }]);
      setNewLabel(''); setNewText(''); setShowAdd(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-gray-800 mb-1" style={{ fontWeight: 600 }}>Textos institucionais</h2>
        <p className="text-gray-500 text-sm">Edite avisos, mensagens de boas-vindas e microcopy exibidos na plataforma.</p>
      </div>

      <div className="space-y-4">
        {texts.map(item => (
          <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden">
            {deleteConfirm === item.id ? (
              <div className="p-4 bg-red-50 flex items-center gap-3">
                <p className="text-xs text-red-600 flex-1">Remover <span style={{ fontWeight: 600 }}>"{item.label}"</span>?</p>
                <button onClick={() => { setTexts(p => p.filter(t => t.id !== item.id)); setDeleteConfirm(null); }} className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-xl hover:bg-red-700 transition-colors">Remover</button>
                <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 border border-gray-200 text-xs rounded-xl hover:bg-gray-100 transition-colors">Cancelar</button>
              </div>
            ) : (
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-700" style={{ fontWeight: 500 }}>{item.label}</label>
                  <div className="flex gap-1">
                    {editingId !== item.id && (
                      <>
                        <button onClick={() => startEdit(item)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-600 hover:bg-orange-50 px-2.5 py-1.5 rounded-lg transition-colors">
                          <Pencil className="w-3 h-3" /> Editar
                        </button>
                        <button onClick={() => setDeleteConfirm(item.id)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {editingId === item.id ? (
                  <div className="space-y-2">
                    <textarea
                      autoFocus
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 bg-orange-50 border border-orange-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(item.id)} className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-xs rounded-xl hover:bg-orange-600 transition-colors">
                        <Check className="w-3 h-3" /> Salvar
                      </button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-2 border border-gray-200 text-gray-500 text-xs rounded-xl hover:bg-gray-50 transition-colors">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2.5 rounded-xl leading-relaxed">{item.text}</p>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Add new text */}
        {showAdd ? (
          <div className="border-2 border-orange-300 rounded-xl p-4 space-y-3 bg-orange-50">
            <p className="text-sm text-gray-800" style={{ fontWeight: 500 }}>Novo texto institucional</p>
            <div>
              <label className="text-xs text-gray-600 mb-1 block" style={{ fontWeight: 500 }}>Nome / rótulo</label>
              <input
                autoFocus
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="Ex: Aviso na página de proposta..."
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block" style={{ fontWeight: 500 }}>Texto</label>
              <textarea
                value={newText}
                onChange={e => setNewText(e.target.value)}
                placeholder="Texto que será exibido na plataforma..."
                rows={3}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={addText} disabled={!newLabel.trim()} className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm rounded-xl hover:bg-orange-600 disabled:opacity-40 transition-colors">
                <Check className="w-3.5 h-3.5" /> Criar texto
              </button>
              <button onClick={() => { setShowAdd(false); setNewLabel(''); setNewText(''); }} className="px-4 py-2 border border-gray-200 text-gray-500 text-sm rounded-xl hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-orange-300 hover:text-orange-500 transition-colors w-full justify-center"
          >
            <Plus className="w-4 h-4" /> Novo texto institucional
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<'regras' | 'categorias' | 'templates' | 'textos'>('regras');
  const [words, setWords] = useState(initialWords);
  const [toast, setToast] = useState(false);

  const handleSave = () => setToast(true);

  const tabs = [
    { key: 'regras', label: '🚫 Regras', icon: Shield },
    { key: 'categorias', label: '🏷️ Categorias', icon: Tag },
    { key: 'templates', label: '📝 Templates', icon: FileText },
    { key: 'textos', label: '📢 Textos', icon: Bell },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {toast && <Toast msg="Configurações salvas com sucesso!" onDone={() => setToast(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800" style={{ fontWeight: 700 }}>Configurações</h1>
          <p className="text-gray-500 text-sm">Regras, categorias, templates e textos institucionais</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm transition-colors"
        >
          <Save className="w-4 h-4" /> Salvar alterações
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-sm transition-colors
              ${activeTab === tab.key ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-200'}`}
            style={{ fontWeight: activeTab === tab.key ? 500 : 400 }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {activeTab === 'regras' && <TabRegras words={words} setWords={setWords} />}
        {activeTab === 'categorias' && <TabCategorias />}
        {activeTab === 'templates' && <TabTemplates />}
        {activeTab === 'textos' && <TabTextos />}
      </div>
    </div>
  );
}
