import { ConversationChat } from '../../components/shared/ConversationChat';

export default function InstitutionChat() {
  return (
    <ConversationChat
      emptyActionTo="/instituicao/propostas"
      emptyActionLabel="Ver propostas"
      tourTargetId="institution-chat-panel"
    />
  );
}
