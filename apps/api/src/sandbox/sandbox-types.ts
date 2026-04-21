import {
  DreamFormat,
  DreamPrivacy,
  DreamStatus,
  DreamUrgency,
} from '../entities/dream.entity';
import { ProposalStatus } from '../entities/proposal.entity';
import { UserRole } from '../entities/user.entity';

export type SandboxPersona = 'paciente' | 'apoiador' | 'instituicao';

export interface SandboxUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  state?: string;
  city?: string;
  institutionType?: string;
  institutionResponsibleName?: string;
  institutionResponsiblePhone?: string;
  institutionDescription?: string;
  verified: boolean;
  approved: boolean;
  approvedAt?: Date;
  suspended: boolean;
  emailNotificationsEnabled: boolean;
  sessionVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SandboxManagedPatient {
  id: string;
  institutionId: string;
  linkedUserId?: string;
  name: string;
  state?: string;
  city?: string;
  pendingInviteEmail?: string;
  pendingInviteExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SandboxDream {
  id: string;
  title: string;
  description: string;
  category: string;
  format: DreamFormat;
  urgency: DreamUrgency;
  privacy: DreamPrivacy;
  status: DreamStatus;
  patientId: string;
  managedPatientId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SandboxProposal {
  id: string;
  dreamId: string;
  supporterId: string;
  message: string;
  offering: string;
  availability: string;
  duration: string;
  status: ProposalStatus;
  createdAt: Date;
}

export interface SandboxConversation {
  id: string;
  dreamId: string;
  patientId: string;
  managedPatientId?: string;
  supporterId: string;
  status: 'ativa' | 'encerrada';
  createdAt: Date;
}

export interface SandboxMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  moderated: boolean;
  createdAt: Date;
}

export interface SandboxNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  actionPath?: string;
  read: boolean;
  createdAt: Date;
}

export interface SandboxSessionState {
  id: string;
  persona: SandboxPersona;
  currentUserId: string;
  users: SandboxUser[];
  managedPatients: SandboxManagedPatient[];
  dreams: SandboxDream[];
  proposals: SandboxProposal[];
  conversations: SandboxConversation[];
  messages: SandboxMessage[];
  notifications: SandboxNotification[];
  createdAt: Date;
  updatedAt: Date;
}
