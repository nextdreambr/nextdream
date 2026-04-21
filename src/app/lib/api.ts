export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

type AccessTokenGetter = () => string | null;
const AUTH_EXPIRED_EVENT = 'nextdream:auth-expired';

let getAccessToken: AccessTokenGetter = () => null;

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '');

export function setAccessTokenGetter(getter: AccessTokenGetter) {
  getAccessToken = getter;
}

function notifyAuthExpired() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}

function buildUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

function buildQueryString(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    search.set(key, String(value));
  }

  const query = search.toString();
  return query ? `?${query}` : '';
}

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  if (Array.isArray(headers)) return Object.fromEntries(headers);
  return { ...headers };
}

function extractMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback;
  const candidate = (payload as { message?: unknown }).message;
  if (typeof candidate === 'string') return candidate;
  if (Array.isArray(candidate) && candidate.length > 0) {
    return String(candidate[0]);
  }
  return fallback;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = normalizeHeaders(init.headers);
  const token = getAccessToken();

  if (!headers['Content-Type'] && init.body && !(init.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    credentials: init.credentials ?? 'include',
    headers,
  });

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as unknown) : undefined;

  if (!response.ok) {
    const fallback = `Request failed with status ${response.status}`;
    const message = extractMessage(payload, fallback);
    if (response.status === 401 && (message === 'Missing authentication token' || message === 'Invalid token')) {
      notifyAuthExpired();
    }
    throw new ApiError(message, response.status, payload);
  }

  return (payload ?? {}) as T;
}

export type ApiUserRole = 'paciente' | 'apoiador' | 'instituicao' | 'admin';

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: ApiUserRole;
  state?: string;
  city?: string;
  locationLabel?: string;
  institutionType?: string;
  institutionDescription?: string;
  verified: boolean;
  approved: boolean;
  emailNotificationsEnabled?: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AuthSession {
  accessToken?: string;
  refreshToken?: string;
  user: ApiUser;
}

export interface CreateDreamInput {
  title: string;
  description: string;
  category: string;
  format: 'remoto' | 'presencial' | 'ambos';
  urgency: 'baixa' | 'media' | 'alta';
  privacy: 'publico' | 'verificados' | 'anonimo';
  managedPatientId?: string;
}

export interface PublicDream {
  id: string;
  title: string;
  description: string;
  category: string;
  format: 'remoto' | 'presencial' | 'ambos';
  urgency: 'baixa' | 'media' | 'alta';
  privacy: 'publico' | 'verificados' | 'anonimo';
  status: 'rascunho' | 'publicado' | 'em-conversa' | 'realizando' | 'concluido' | 'pausado' | 'cancelado';
  patientId: string;
  operatorUserId?: string;
  managedPatientId?: string;
  managedByInstitution?: boolean;
  institutionName?: string;
  patientName?: string;
  patientCity?: string;
  restrictions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProposalInput {
  message: string;
  offering: string;
  availability: string;
  duration: string;
}

export interface Proposal {
  id: string;
  dreamId: string;
  dreamTitle?: string;
  dreamStatus?: PublicDream['status'];
  dreamCategory?: string;
  supporterId: string;
  supporterName?: string;
  message: string;
  offering: string;
  availability: string;
  duration: string;
  status: 'enviada' | 'em-analise' | 'aceita' | 'recusada' | 'expirada';
  createdAt: string;
}

export interface InstitutionProfile extends ApiUser {
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const authApi = {
  login(payload: { email: string; password: string }) {
    return apiRequest<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  register(payload: { name: string; email: string; password: string; role: ApiUserRole; state?: string; city?: string }) {
    return apiRequest<AuthSession>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  acceptAdminInvite(payload: { email: string; token: string; name: string; password: string }) {
    return apiRequest<AuthSession>('/auth/admin-invites/accept', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export const dreamsApi = {
  listPublic() {
    return apiRequest<PublicDream[]>('/dreams/public');
  },
  getById(dreamId: string) {
    return apiRequest<PublicDream>(`/dreams/${dreamId}`);
  },
  listMine() {
    return apiRequest<PublicDream[]>('/dreams/mine');
  },
  listMinePage(params: { page?: number; pageSize?: number; query?: string; status?: PublicDream['status'] | '' }) {
    return apiRequest<PaginatedResult<PublicDream>>(`/dreams/mine${buildQueryString(params)}`);
  },
  create(payload: CreateDreamInput) {
    return apiRequest<PublicDream>('/dreams', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  update(dreamId: string, payload: Partial<CreateDreamInput>) {
    return apiRequest<PublicDream>(`/dreams/${dreamId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  listProposals(dreamId: string) {
    return apiRequest<Proposal[]>(`/dreams/${dreamId}/proposals`);
  },
  createProposal(dreamId: string, payload: CreateProposalInput) {
    return apiRequest<Proposal>(`/dreams/${dreamId}/proposals`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export const proposalsApi = {
  listMine() {
    return apiRequest<Proposal[]>('/proposals/mine');
  },
  listReceived() {
    return apiRequest<Proposal[]>('/proposals/received');
  },
  listReceivedPage(params: { page?: number; pageSize?: number; query?: string; status?: Proposal['status'] | '' }) {
    return apiRequest<PaginatedResult<Proposal>>(`/proposals/received${buildQueryString(params)}`);
  },
  accept(proposalId: string) {
    return apiRequest<Proposal & { conversationId: string }>(`/proposals/${proposalId}/accept`, {
      method: 'POST',
    });
  },
  reject(proposalId: string) {
    return apiRequest<Proposal>(`/proposals/${proposalId}/reject`, {
      method: 'POST',
    });
  },
};

export interface Conversation {
  id: string;
  dreamId: string;
  patientId: string;
  operatorUserId?: string;
  managedPatientId?: string;
  supporterId: string;
  status: 'ativa' | 'encerrada';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  moderated: boolean;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionPath?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  emailEnabled: boolean;
}

export interface AdminOverview {
  totalUsers: number;
  totalDreams: number;
  totalProposals: number;
  totalChats: number;
  totalReportsOpen: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: ApiUserRole;
  state?: string;
  city?: string;
  locationLabel?: string;
  verified: boolean;
  approved: boolean;
  approvedAt?: string;
  suspended: boolean;
  suspensionReason?: string;
  suspendedAt?: string;
  createdAt: string;
}

export interface InstitutionOverview {
  managedPatients: number;
  dreams: number;
  proposals: number;
  activeConversations: number;
}

export interface ManagedPatient {
  id: string;
  institutionId: string;
  linkedUserId?: string;
  name: string;
  state?: string;
  city?: string;
  locationLabel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminInvite {
  id: string;
  email: string;
  expiresAt: string;
}

export interface AdminChat {
  id: string;
  dreamId: string;
  patientId: string;
  supporterId: string;
  status: 'ativa' | 'encerrada';
  messageCount: number;
  lastMessageAt: string | null;
  createdAt: string;
}

export interface AdminContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  status: 'novo' | 'em-analise' | 'respondido';
  createdAt: string;
}

export interface AdminReport {
  id: string;
  type: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: 'aberto' | 'em-analise' | 'resolvido';
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  by: string;
  target: string;
  type: string;
  severity: 'alta' | 'media' | 'baixa';
  outcome: 'ok' | 'warn' | 'danger';
  details: string;
  refPath: string;
  refId?: string;
  date: string;
}

export interface AdminEmailTemplateMeta {
  id: string;
  category: string;
  name: string;
  subject: string;
  recipient: string;
}

export const conversationsApi = {
  listMine() {
    return apiRequest<Conversation[]>('/conversations/mine');
  },
  listMessages(conversationId: string) {
    return apiRequest<ChatMessage[]>(`/conversations/${conversationId}/messages`);
  },
  sendMessage(conversationId: string, body: string) {
    return apiRequest<ChatMessage>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  },
  close(conversationId: string, reason: string) {
    return apiRequest<Conversation>(`/conversations/${conversationId}/close`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

export const notificationsApi = {
  listMine() {
    return apiRequest<AppNotification[]>('/notifications/mine');
  },
  markRead(notificationId: string) {
    return apiRequest<AppNotification>(`/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  },
  markAllRead() {
    return apiRequest<{ ok: boolean }>('/notifications/read-all', {
      method: 'POST',
    });
  },
  getPreferences() {
    return apiRequest<NotificationPreferences>('/notifications/preferences');
  },
  updatePreferences(payload: NotificationPreferences) {
    return apiRequest<NotificationPreferences>('/notifications/preferences', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export const adminApi = {
  overview() {
    return apiRequest<AdminOverview>('/admin/overview');
  },
  listUsers() {
    return apiRequest<AdminUser[]>('/admin/users');
  },
  listAdmins() {
    return apiRequest<AdminUser[]>('/admin/admins');
  },
  suspendUser(userId: string, reason: string) {
    return apiRequest<{ id: string; suspended: boolean; suspensionReason?: string }>(`/admin/users/${userId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
  approveUser(userId: string) {
    return apiRequest<{ id: string; role: ApiUserRole; approved: boolean; approvedAt?: string }>(`/admin/users/${userId}/approve`, {
      method: 'POST',
    });
  },
  updateAdmin(
    userId: string,
    payload: {
      name?: string;
      email?: string;
      role?: ApiUserRole;
      isActive?: boolean;
      currentPassword?: string;
      newPassword?: string;
    },
  ) {
    return apiRequest<AdminUser>(`/admin/admins/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  inviteAdmin(email: string) {
    return apiRequest<AdminInvite>('/admin/admins/invite', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  listDreams() {
    return apiRequest<Array<{ id: string; title: string; category: string; status: PublicDream['status']; patientName?: string; createdAt: string }>>('/admin/dreams');
  },
  updateDreamStatus(dreamId: string, status: PublicDream['status'], reason?: string) {
    return apiRequest<{ id: string; status: PublicDream['status'] }>(`/admin/dreams/${dreamId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, reason }),
    });
  },
  listProposals() {
    return apiRequest<Array<{ id: string; dreamTitle?: string; supporterName?: string; status: Proposal['status']; createdAt: string }>>('/admin/proposals');
  },
  updateProposalStatus(proposalId: string, status: Proposal['status'], reason?: string) {
    return apiRequest<{ id: string; status: Proposal['status'] }>(`/admin/proposals/${proposalId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, reason }),
    });
  },
  listMessages() {
    return apiRequest<AdminContactMessage[]>('/admin/messages');
  },
  listChats() {
    return apiRequest<AdminChat[]>('/admin/chats');
  },
  closeChat(chatId: string, reason: string) {
    return apiRequest<{ id: string; status: 'ativa' | 'encerrada' }>(`/admin/chats/${chatId}/close`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
  listReports() {
    return apiRequest<AdminReport[]>('/admin/reports');
  },
  updateReportStatus(reportId: string, status: AdminReport['status'], resolution?: string) {
    return apiRequest<{ id: string; status: AdminReport['status'] }>(`/admin/reports/${reportId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, resolution }),
    });
  },
  listAudit() {
    return apiRequest<AdminAuditLog[]>('/admin/audit');
  },
  listEmailTemplates() {
    return apiRequest<AdminEmailTemplateMeta[]>('/admin/email-templates');
  },
};

export const institutionApi = {
  overview() {
    return apiRequest<InstitutionOverview>('/institution/overview');
  },
  listPatients() {
    return apiRequest<ManagedPatient[]>('/institution/patients');
  },
  listPatientsPage(params: { page?: number; pageSize?: number; query?: string }) {
    return apiRequest<PaginatedResult<ManagedPatient>>(`/institution/patients${buildQueryString(params)}`);
  },
  createPatient(payload: { name: string; state?: string; city?: string }) {
    return apiRequest<ManagedPatient>('/institution/patients', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  updatePatient(managedPatientId: string, payload: { name?: string; state?: string; city?: string }) {
    return apiRequest<ManagedPatient>(`/institution/patients/${managedPatientId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  getProfile() {
    return apiRequest<InstitutionProfile>('/institution/profile');
  },
  updateProfile(payload: {
    name?: string;
    email?: string;
    state?: string;
    city?: string;
    institutionType?: string;
    institutionDescription?: string;
  }) {
    return apiRequest<InstitutionProfile>('/institution/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  changePassword(payload: { currentPassword: string; newPassword: string }) {
    return apiRequest<{ ok: true }>('/institution/profile/password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
