import { type ApiLocale } from '../../i18n/locale';
import { tApi } from '../../i18n/messages';

const BLOCKED_FINANCIAL_PATTERNS = [
  /\bpix\b/u,
  /\bdinheiro\b/u,
  /\bdoac(?:ao|oes)\b/u,
  /\bvaquinha\b/u,
  /\bpagamentos?\b/u,
  /\btransferenc(?:ia|ias)\b/u,
  /(?:^|[^\p{L}\p{N}])r\$(?:\s*\d+(?:[.,]\d{1,2})?)?(?=$|[^\p{L}\p{N}])/iu,
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

export function getChatFinancialModerationMessage(locale?: ApiLocale) {
  return tApi('chat.financialModeration', locale);
}
