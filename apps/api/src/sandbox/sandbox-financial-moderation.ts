const BLOCKED_FINANCIAL_TERMS = [
  'pix',
  'dinheiro',
  'doação',
  'doacao',
  'vaquinha',
  'pagamento',
  'transferência',
  'transferencia',
  'r$',
  'reais',
] as const;

export function containsFinancialLanguage(value: string) {
  const normalized = value.toLowerCase();
  return BLOCKED_FINANCIAL_TERMS.some((term) => normalized.includes(term));
}

export function getSandboxFinancialModerationMessage() {
  return 'No sandbox, mensagens com PIX, dinheiro ou doações são bloqueadas. Reformule oferecendo tempo, presença ou companhia.';
}
