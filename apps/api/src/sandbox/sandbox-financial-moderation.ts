export { containsFinancialLanguage } from '../modules/conversations/chat-financial-moderation';

export function getSandboxFinancialModerationMessage() {
  return 'No sandbox, mensagens com PIX, dinheiro ou doações são bloqueadas. Reformule oferecendo tempo, presença ou companhia.';
}
