const BLOCKED_FINANCIAL_PATTERNS = [
  /\bpix\b/u,
  /\bdinheiro\b/u,
  /\bdoac(?:ao|oes)\b/u,
  /\bvaquinha\b/u,
  /\bpagamentos?\b/u,
  /\btransferenc(?:ia|ias)\b/u,
  /(?:^|[^\p{L}\p{N}])r\$(?=$|[^\p{L}\p{N}])/u,
  /\breais?\b/u,
] as const;

function normalizeFinancialText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function containsFinancialLanguage(value: string) {
  const normalized = normalizeFinancialText(value);
  return BLOCKED_FINANCIAL_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function getSandboxFinancialModerationMessage() {
  return 'Mensagens com PIX, dinheiro ou doações são bloqueadas no sandbox. Reformule oferecendo tempo, presença ou companhia.';
}
