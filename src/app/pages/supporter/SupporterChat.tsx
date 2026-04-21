import { ConversationChat } from '../../components/shared/ConversationChat';

export default function SupporterChat() {
  return (
    <ConversationChat
      emptyActionTo="/apoiador/propostas"
      emptyActionLabel="Ver minhas propostas"
      tourTargetId="supporter-chat-panel"
    />
  );
}
