export { containsFinancialLanguage } from '../modules/conversations/chat-financial-moderation';
import { type ApiLocale } from '../i18n/locale';
import { tApi } from '../i18n/messages';

export function getSandboxFinancialModerationMessage(locale?: ApiLocale) {
  return tApi('sandbox.financialModeration', locale);
}
