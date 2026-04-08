import { ConversationChat } from '../../components/shared/ConversationChat';

export default function PatientChat() {
  return <ConversationChat emptyActionTo="/paciente/propostas" emptyActionLabel="Ver propostas" />;
}
