import { loadStoredSession } from './authSession';
import { getCurrentBrowserLocale, type SupportedLocale } from '../i18n/locale';

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
type RefreshTokenGetter = () => string | null;
type SessionChangeHandler = (session: AuthSession | null) => void;
const AUTH_EXPIRED_EVENT = 'nextdream:auth-expired';

let getAccessToken: AccessTokenGetter = () => null;
let getRefreshToken: RefreshTokenGetter = () => null;
let handleSessionChange: SessionChangeHandler = () => {};
let refreshSessionRequest: Promise<AuthSession | null> | null = null;

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '');

export function setAccessTokenGetter(getter: AccessTokenGetter) {
  getAccessToken = getter;
}

export function setRefreshTokenGetter(getter: RefreshTokenGetter) {
  getRefreshToken = getter;
}

export function setSessionChangeHandler(handler: SessionChangeHandler) {
  handleSessionChange = handler;
}

function getAvailableAccessToken() {
  return getAccessToken() ?? loadStoredSession()?.accessToken ?? null;
}

function getAvailableRefreshToken() {
  return getRefreshToken() ?? loadStoredSession()?.refreshToken ?? null;
}

function isCurrentRefreshToken(initialRefreshToken: string | null) {
  return getAvailableRefreshToken() === initialRefreshToken;
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
  return apiRequestInternal<T>(path, init, true);
}

async function apiRequestInternal<T>(
  path: string,
  init: RequestInit,
  allowRefresh: boolean,
  overrideAccessToken?: string,
): Promise<T> {
  const headers = normalizeHeaders(init.headers);
  const token = overrideAccessToken ?? getAvailableAccessToken();
  const authorizationHeaderKey = Object.keys(headers).find(
    (key) => key.toLowerCase() === 'authorization',
  );
  const isAuthRoute = path.startsWith('/auth');
  const requestRefreshToken = isAuthRoute ? null : getAvailableRefreshToken();

  if (!headers['Content-Type'] && init.body && !(init.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const activeLocale = getCurrentBrowserLocale();
  if (!Object.keys(headers).some((key) => key.toLowerCase() === 'x-nextdream-locale')) {
    headers['X-NextDream-Locale'] = activeLocale;
  }
  if (!Object.keys(headers).some((key) => key.toLowerCase() === 'accept-language')) {
    headers['Accept-Language'] = activeLocale;
  }
  if (overrideAccessToken) {
    if (authorizationHeaderKey) {
      delete headers[authorizationHeaderKey];
    }
    headers.Authorization = `Bearer ${overrideAccessToken}`;
  } else if (token && !authorizationHeaderKey) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    credentials: init.credentials ?? 'include',
    headers,
  });

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as unknown) : undefined;

  if (
    response.status === 401 &&
    allowRefresh &&
    !isAuthRoute
  ) {
    const refreshedSession = await refreshAuthSession();
    if (refreshedSession?.accessToken) {
      return apiRequestInternal<T>(path, init, false, refreshedSession.accessToken);
    }
  }

  if (!response.ok) {
    const isCurrentAuthContext = isAuthRoute || isCurrentRefreshToken(requestRefreshToken);
    if (response.status === 401 && !isAuthRoute && isCurrentAuthContext) {
      handleSessionChange(null);
    }
    const fallback = `Request failed with status ${response.status}`;
    const message = extractMessage(payload, fallback);
    if (
      response.status === 401 &&
      isCurrentAuthContext &&
      (message === 'Missing authentication token' || message === 'Invalid token')
    ) {
      notifyAuthExpired();
    }
    throw new ApiError(message, response.status, payload);
  }

  return (payload ?? {}) as T;
}

async function refreshAuthSession(): Promise<AuthSession | null> {
  if (refreshSessionRequest) return refreshSessionRequest;

  const initialRefreshToken = getAvailableRefreshToken();
  if (!initialRefreshToken) {
    if (isCurrentRefreshToken(initialRefreshToken)) {
      handleSessionChange(null);
    }
    return null;
  }

  refreshSessionRequest = (async () => {
    try {
      const response = await fetch(buildUrl('/auth/refresh'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-NextDream-Locale': getCurrentBrowserLocale(),
          'Accept-Language': getCurrentBrowserLocale(),
        },
        body: JSON.stringify({ refreshToken: initialRefreshToken }),
      });

      const text = await response.text();
      const payload = text ? (JSON.parse(text) as unknown) : undefined;

      if (!response.ok) {
        if (isCurrentRefreshToken(initialRefreshToken)) {
          handleSessionChange(null);
        }
        return null;
      }

      const session = payload as Partial<AuthSession>;
      if (!session.accessToken || !session.refreshToken || !session.user) {
        if (isCurrentRefreshToken(initialRefreshToken)) {
          handleSessionChange(null);
        }
        return null;
      }

      if (!isCurrentRefreshToken(initialRefreshToken)) {
        return null;
      }

      handleSessionChange(session as AuthSession);
      return session as AuthSession;
    } catch {
      if (isCurrentRefreshToken(initialRefreshToken)) {
        handleSessionChange(null);
      }
      return null;
    } finally {
      refreshSessionRequest = null;
    }
  })();

  return refreshSessionRequest;
}

export type ApiUserRole = 'paciente' | 'apoiador' | 'instituicao' | 'admin';
export type SandboxPersona = Exclude<ApiUserRole, 'admin'>;

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: ApiUserRole;
  state?: string;
  city?: string;
  locationLabel?: string;
  institutionType?: string;
  institutionResponsibleName?: string;
  institutionResponsiblePhone?: string;
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

export interface AuthRegisterResponse {
  success: true;
  email: string;
  role: Exclude<ApiUserRole, 'admin'>;
  requiresEmailVerification: true;
  requiresApproval: boolean;
}

export interface CreateDreamInput {
  title: string;
  description: string;
  originalLanguage?: DreamLanguage;
  category: string;
  format: 'remoto' | 'presencial' | 'ambos';
  urgency: 'baixa' | 'media' | 'alta';
  privacy: 'publico' | 'verificados' | 'anonimo';
  managedPatientId?: string;
}

export type DreamLanguage = SupportedLocale;

export interface DreamTranslation {
  title: string;
  description: string;
  source: 'machine' | 'human';
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string | null;
  model?: string;
}

export interface PublicDream {
  id: string;
  title: string;
  description: string;
  originalLanguage?: DreamLanguage;
  translations?: Partial<Record<DreamLanguage, DreamTranslation>>;
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
  patientContext?: string;
  operatorRole?: 'paciente' | 'instituicao';
  canEdit?: boolean;
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
  patientId?: string;
  patientName?: string;
  patientCity?: string;
  managedByInstitution?: boolean;
  institutionName?: string;
  canRespond?: boolean;
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
  demoLogin(payload: { persona: SandboxPersona }) {
    return apiRequest<AuthSession>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  refresh(payload: { refreshToken: string }) {
    return apiRequest<AuthSession>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  register(payload: {
    name: string;
    email: string;
    password: string;
    role: ApiUserRole;
    institutionType?: string;
    institutionResponsibleName?: string;
    institutionResponsiblePhone?: string;
    institutionDescription?: string;
    state?: string;
    city?: string;
  }) {
    return apiRequest<AuthRegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  verifyEmail(payload: { token: string }) {
    return apiRequest<{ success: true }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  requestPasswordReset(payload: { email: string }) {
    return apiRequest<void>('/auth/password-reset/request', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  confirmPasswordReset(payload: { token: string; newPassword: string }) {
    return apiRequest<{ success: true }>('/auth/password-reset/confirm', {
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
  acceptPatientInvite(payload: { email: string; token: string; name: string; password: string }) {
    return apiRequest<AuthSession>('/auth/patient-invites/accept', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  forgotPassword(payload: { email: string }) {
    return apiRequest<{ ok: boolean }>('/auth/password/forgot', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  resetPassword(payload: { requestId: string; token: string; newPassword: string }) {
    return apiRequest<{ ok: boolean }>('/auth/password/reset', {
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
  listMinePage(params: {
    page?: number;
    pageSize?: number;
    query?: string;
    status?: PublicDream['status'] | '';
    category?: string;
    format?: PublicDream['format'] | '';
  }) {
    return apiRequest<PaginatedResult<PublicDream>>(`/dreams/mine${buildQueryString(params)}`);
  },
  create(payload: CreateDreamInput) {
    return apiRequest<PublicDream>('/dreams', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        originalLanguage: payload.originalLanguage ?? getCurrentBrowserLocale(),
      }),
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
  translateDream(dreamId: string, targetLanguage: DreamLanguage) {
    return apiRequest<DreamTranslation>(`/dreams/${dreamId}/translations`, {
      method: 'POST',
      body: JSON.stringify({ targetLanguage }),
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
  dreamTitle?: string;
  dreamStatus?: PublicDream['status'];
  dreamPath?: string;
  patientId: string;
  operatorUserId?: string;
  managedPatientId?: string;
  supporterId: string;
  managedByInstitution?: boolean;
  patientName?: string;
  patientLocation?: string;
  institutionName?: string;
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
  generatedAt?: string;
  environment?: string;
  systemStatus?: {
    api: 'online' | 'degraded';
    email: 'resend' | 'smtp' | 'sandbox' | 'test' | 'not-configured';
    dataMode: 'database' | 'sandbox';
  };
  workQueues?: {
    reportsOpen: number;
    institutionsPendingApproval: number;
    chatsWithModeration: number;
    contactMessagesNew: number;
    dreamsPaused: number;
    proposalsInReview: number;
  };
  health?: {
    usersByRole: Partial<Record<ApiUserRole, number>>;
    dreamsByStatus: Record<string, number>;
    proposalsByStatus: Record<string, number>;
    activeChats: number;
    closedChats: number;
    backlog: number;
  };
  riskCare?: {
    moderatedMessages: number;
    suspendedUsersRecent: number;
    recurringReportedTargets: Array<{
      targetType: string;
      targetId: string;
      count: number;
      latestReason?: string;
    }>;
  };
  recent?: {
    auditLogs: AdminAuditLog[];
    reports: AdminReportSummary[];
    moderatedChats: AdminChatSummary[];
    adminInvites: AdminInvite[];
  };
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
  updatedAt?: string;
}

export interface AdminUserActivitySummary {
  dreams?: number;
  proposalsReceived?: number;
  proposalsSent?: number;
  acceptedProposals?: number;
  conversations?: number;
  activeConversations?: number;
  managedPatients?: number;
  linkedPatients?: number;
  supporterConnections?: number;
}

export interface AdminUserActivityDream {
  id: string;
  title: string;
  category: string;
  status: PublicDream['status'];
  urgency: PublicDream['urgency'];
  updatedAt: string;
}

export interface AdminUserActivityProposal {
  id: string;
  dreamId: string;
  dreamTitle?: string;
  supporterId?: string;
  supporterName?: string;
  patientId?: string;
  patientName?: string;
  status: Proposal['status'];
  offering?: string;
  createdAt: string;
}

export interface AdminUserActivityConversation {
  id: string;
  dreamId: string;
  dreamTitle?: string;
  supporterId?: string;
  supporterName?: string;
  patientId?: string;
  patientName?: string;
  status: Conversation['status'];
  messageCount: number;
  createdAt: string;
  lastMessageAt?: string;
}

export interface AdminUserDetail extends AdminUser {
  emailNotificationsEnabled?: boolean;
  institutionType?: string;
  institutionResponsibleName?: string;
  institutionResponsiblePhone?: string;
  institutionDescription?: string;
  activitySummary: AdminUserActivitySummary;
  recentDreams: AdminUserActivityDream[];
  recentProposals: AdminUserActivityProposal[];
  recentConversations: AdminUserActivityConversation[];
}

export interface UpdateAdminUserInput {
  name?: string;
  email?: string;
  state?: string;
  city?: string;
  verified?: boolean;
  approved?: boolean;
  institutionType?: string;
  institutionResponsibleName?: string;
  institutionResponsiblePhone?: string;
  institutionDescription?: string;
}

export interface AdminPasswordResetResult {
  id: string;
  mode: 'manual' | 'reset-link';
  delivery?: 'email';
  email?: string;
  expiresAt?: string;
}

export interface AdminSecurityTrailItem {
  id: string;
  action: string;
  details: string;
  date: string;
  severity: 'alta' | 'media' | 'baixa';
  outcome: 'ok' | 'warn' | 'danger';
}

export interface AdminAccountDetail extends AdminUser {
  securityTrail: AdminSecurityTrailItem[];
}

export interface AdminSettingsRule {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface AdminSettingsCategory {
  id: string;
  name: string;
}

export interface AdminInstitutionalText {
  id: string;
  label: string;
  text: string;
}

export interface AdminSettingsPayload {
  blockedWords: string[];
  rules: AdminSettingsRule[];
  categories: AdminSettingsCategory[];
  institutionalTexts: AdminInstitutionalText[];
  updatedAt?: string;
}

export interface AdminDreamSummary {
  id: string;
  title: string;
  originalLanguage?: DreamLanguage;
  translations?: Partial<Record<DreamLanguage, DreamTranslation>>;
  category: string;
  format: PublicDream['format'];
  urgency: PublicDream['urgency'];
  privacy: PublicDream['privacy'];
  status: PublicDream['status'];
  patientId?: string;
  patientName?: string;
  operatorName?: string;
  managedPatientName?: string;
  institutionName?: string;
  city?: string;
  state?: string;
  locationLabel?: string;
  proposalCount?: number;
  chatCount?: number;
  reportCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDreamDetail extends AdminDreamSummary {
  description: string;
  relatedProposals: Array<{
    id: string;
    supporterId?: string;
    supporterName?: string;
    status: Proposal['status'];
    message?: string;
    offering?: string;
    availability?: string;
    duration?: string;
    createdAt: string;
  }>;
  linkedConversation: AdminChatDetail | null;
  relatedReports?: AdminReportSummary[];
}

export interface AdminProposalSummary {
  id: string;
  dreamId: string;
  dreamTitle?: string;
  dreamCategory?: string;
  dreamStatus?: PublicDream['status'];
  supporterId?: string;
  supporterName?: string;
  supporterEmail?: string;
  patientName?: string;
  institutionName?: string;
  city?: string;
  state?: string;
  locationLabel?: string;
  status: Proposal['status'];
  message?: string;
  offering?: string;
  availability?: string;
  duration?: string;
  conversationId?: string;
  conversationStatus?: 'ativa' | 'encerrada';
  reportCount?: number;
  riskLevel?: 'high' | 'medium' | 'pending' | 'low';
  createdAt: string;
  updatedAt?: string;
}

export interface AdminProposalDetail extends AdminProposalSummary {
  supporterEmail?: string;
  dreamStatus?: PublicDream['status'];
  relatedConversation?: AdminChatDetail | null;
  relatedReports?: AdminReportSummary[];
}

export interface AdminContactMessageSummary {
  id: string;
  name: string;
  email: string;
  subject: string;
  status: 'novo' | 'em-analise' | 'respondido';
  createdAt: string;
}

export interface AdminChatSummary {
  id: string;
  dreamId: string;
  dreamTitle?: string;
  patientId?: string;
  patientName?: string;
  institutionName?: string;
  managedPatientName?: string;
  supporterId: string;
  supporterName?: string;
  status: 'ativa' | 'encerrada';
  messageCount: number;
  lastMessageAt: string | null;
  lastMessagePreview?: string | null;
  createdAt: string;
  hasModeratedMessages: boolean;
  hasModerationReport: boolean;
  lastModerationAt: string | null;
}

export interface AdminChatDetail extends AdminChatSummary {
  latestMessages: Array<{
    id: string;
    senderId: string;
    senderName?: string;
    body: string;
    moderated: boolean;
    createdAt: string;
  }>;
  moderationReports: Array<{
    id: string;
    type: string;
    status: 'aberto' | 'em-analise' | 'resolvido';
    reason: string;
    createdAt: string;
  }>;
}

export type AdminReportSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface AdminReportTargetSummary {
  chatId?: string;
  dreamTitle?: string;
  patientId?: string;
  patientName?: string;
  institutionName?: string;
  supporterId?: string;
  supporterName?: string;
  hasModeratedMessages?: boolean;
  messageId?: string;
  conversationId?: string;
  senderId?: string;
  senderName?: string;
  moderated?: boolean;
  body?: string;
  dreamId?: string;
  proposalId?: string;
  targetUserId?: string;
  targetUserName?: string;
  targetUserEmail?: string;
  status?: string;
  createdAt?: string;
}

export interface AdminReportSummary {
  id: string;
  type: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: 'aberto' | 'em-analise' | 'resolvido';
  severity?: AdminReportSeverity;
  entityLabel?: string;
  reporterName?: string;
  accusedName?: string;
  responsibleName?: string;
  resolution?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  targetSummary?: AdminReportTargetSummary | null;
}

export interface AdminReportDetail extends AdminReportSummary {
  targetSummary?: AdminReportTargetSummary | null;
}

export interface InstitutionOverview {
  managedPatients: number;
  linkedPatients: number;
  pendingAccessInvites: number;
  dreams: number;
  dreamsPublished: number;
  dreamsInConversation: number;
  proposals: number;
  pendingProposals: number;
  acceptedProposals: number;
  activeConversations: number;
  supporterConnections: number;
}

export interface ManagedPatient {
  id: string;
  institutionId: string;
  linkedUserId?: string;
  linkedUserEmail?: string;
  accessStatus?: 'sem-acesso' | 'convite-pendente' | 'ativo';
  pendingInviteEmail?: string;
  pendingInviteExpiresAt?: string;
  name: string;
  state?: string;
  city?: string;
  locationLabel?: string;
  caseSummary?: string;
  supportContext?: string;
  careFocus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ManagedPatientDetail {
  patient: ManagedPatient;
  summary: {
    dreams: number;
    proposals: number;
    activeConversations: number;
  };
  dreams?: Array<{
    id: string;
    title: string;
    category: string;
    status: PublicDream['status'];
    urgency: PublicDream['urgency'];
    updatedAt: string;
  }>;
  proposals?: Array<{
    id: string;
    dreamId: string;
    dreamTitle?: string;
    status: Proposal['status'];
    supporterId: string;
    supporterName?: string;
    createdAt: string;
  }>;
  conversations?: Array<{
    id: string;
    dreamId: string;
    dreamTitle?: string;
    status: Conversation['status'];
    supporterId: string;
    supporterName?: string;
    createdAt: string;
  }>;
  timeline?: Array<{
    id: string;
    type: 'sonho' | 'proposta' | 'conversa' | 'notificacao';
    title: string;
    description: string;
    createdAt: string;
  }>;
}

export interface AdminInvite {
  id: string;
  email: string;
  expiresAt: string;
  usedAt?: string;
  createdAt?: string;
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
  variables?: string[];
  channel?: 'email';
  editable?: boolean;
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
  listUsers(params: {
    page?: number;
    pageSize?: number;
    query?: string;
    role?: ApiUserRole | '';
    status?: 'ativo' | 'suspenso' | '';
    approval?: 'aprovado' | 'pendente' | '';
    verification?: 'verificado' | 'pendente' | '';
  } = {}) {
    return apiRequest<PaginatedResult<AdminUser>>(`/admin/users${buildQueryString(params)}`);
  },
  getUserDetail(userId: string) {
    return apiRequest<AdminUserDetail>(`/admin/users/${userId}`);
  },
  updateUser(userId: string, payload: UpdateAdminUserInput) {
    return apiRequest<AdminUserDetail>(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  listAdmins() {
    return apiRequest<AdminUser[]>('/admin/admins');
  },
  listAdminsPage(params: {
    page?: number;
    pageSize?: number;
    query?: string;
    status?: 'ativo' | 'suspenso' | '';
  } = {}) {
    return apiRequest<PaginatedResult<AdminUser>>(`/admin/admins/page${buildQueryString(params)}`);
  },
  getAdminDetail(userId: string) {
    return apiRequest<AdminAccountDetail>(`/admin/admins/${userId}`);
  },
  listAdminInvites() {
    return apiRequest<AdminInvite[]>('/admin/admins/invites');
  },
  suspendUser(userId: string, reason: string) {
    return apiRequest<{ id: string; suspended: boolean; suspensionReason?: string }>(`/admin/users/${userId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
  reactivateUser(userId: string, reason: string) {
    return apiRequest<{ id: string; suspended: boolean; suspensionReason?: string }>(`/admin/users/${userId}/reactivate`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
  approveUser(userId: string) {
    return apiRequest<{ id: string; role: ApiUserRole; approved: boolean; approvedAt?: string }>(`/admin/users/${userId}/approve`, {
      method: 'POST',
    });
  },
  resetUserPassword(userId: string, payload: { mode: 'manual'; newPassword: string } | { mode: 'reset-link' }) {
    return apiRequest<AdminPasswordResetResult>(`/admin/users/${userId}/password/reset`, {
      method: 'POST',
      body: JSON.stringify(payload),
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
      reason?: string;
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
  listDreams(params: {
    page?: number;
    pageSize?: number;
    query?: string;
    status?: PublicDream['status'] | '';
    category?: string;
    format?: PublicDream['format'] | '';
    urgency?: PublicDream['urgency'] | '';
    privacy?: PublicDream['privacy'] | '';
    location?: string;
    report?: 'true' | 'false' | '';
    proposal?: 'with' | 'without' | '';
    dateFrom?: string;
    dateTo?: string;
  }) {
    return apiRequest<PaginatedResult<AdminDreamSummary>>(`/admin/dreams${buildQueryString(params)}`);
  },
  getDreamDetail(dreamId: string) {
    return apiRequest<AdminDreamDetail>(`/admin/dreams/${dreamId}`);
  },
  updateDreamStatus(dreamId: string, status: PublicDream['status'], reason?: string) {
    return apiRequest<{ id: string; status: PublicDream['status'] }>(`/admin/dreams/${dreamId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, reason }),
    });
  },
  listProposals(params: {
    page?: number;
    pageSize?: number;
    query?: string;
    status?: Proposal['status'] | '';
    supporter?: string;
    dream?: string;
    location?: string;
    conversation?: 'true' | 'false' | '';
    report?: 'true' | 'false' | '';
    risk?: 'high' | 'medium' | 'pending' | 'low' | '';
    dateFrom?: string;
    dateTo?: string;
  }) {
    return apiRequest<PaginatedResult<AdminProposalSummary>>(`/admin/proposals${buildQueryString(params)}`);
  },
  getProposalDetail(proposalId: string) {
    return apiRequest<AdminProposalDetail>(`/admin/proposals/${proposalId}`);
  },
  updateProposalStatus(proposalId: string, status: Proposal['status'], reason?: string) {
    return apiRequest<{ id: string; status: Proposal['status'] }>(`/admin/proposals/${proposalId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, reason }),
    });
  },
  listMessages(params: {
    page?: number;
    pageSize?: number;
    query?: string;
    status?: AdminContactMessage['status'] | '';
    email?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    return apiRequest<PaginatedResult<AdminContactMessageSummary>>(`/admin/messages${buildQueryString(params)}`);
  },
  getMessageDetail(messageId: string) {
    return apiRequest<AdminContactMessage>(`/admin/messages/${messageId}`);
  },
  listChats(params: {
    page?: number;
    pageSize?: number;
    query?: string;
    status?: Conversation['status'] | '';
    dream?: string;
    patient?: string;
    supporter?: string;
    moderated?: 'true' | 'false' | '';
    report?: 'true' | 'false' | '';
    risk?: 'high' | 'medium' | 'low' | '';
    unanswered?: '24h' | '72h' | '7d' | '';
    entity?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    return apiRequest<PaginatedResult<AdminChatSummary>>(`/admin/chats${buildQueryString(params)}`);
  },
  getChatDetail(chatId: string) {
    return apiRequest<AdminChatDetail>(`/admin/chats/${chatId}`);
  },
  closeChat(chatId: string, reason: string) {
    return apiRequest<{ id: string; status: 'ativa' | 'encerrada' }>(`/admin/chats/${chatId}/close`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
  listReports(params: {
    page?: number;
    pageSize?: number;
    query?: string;
    status?: AdminReport['status'] | '';
    severity?: AdminReportSeverity | '';
    type?: string;
    targetType?: string;
    entity?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    return apiRequest<PaginatedResult<AdminReportSummary>>(`/admin/reports${buildQueryString(params)}`);
  },
  getReportDetail(reportId: string) {
    return apiRequest<AdminReportDetail>(`/admin/reports/${reportId}`);
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
  listAuditPage(params: {
    page?: number;
    pageSize?: number;
    query?: string;
    type?: string;
    severity?: AdminAuditLog['severity'] | '';
    outcome?: AdminAuditLog['outcome'] | '';
    dateFrom?: string;
    dateTo?: string;
  } = {}) {
    return apiRequest<PaginatedResult<AdminAuditLog>>(`/admin/audit/page${buildQueryString(params)}`);
  },
  getSettings() {
    return apiRequest<AdminSettingsPayload>('/admin/settings');
  },
  updateSettings(payload: Omit<AdminSettingsPayload, 'updatedAt'>) {
    return apiRequest<AdminSettingsPayload>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
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
  getPatient(managedPatientId: string) {
    return apiRequest<ManagedPatientDetail>(`/institution/patients/${managedPatientId}`);
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
  createPatientAccessInvite(managedPatientId: string, payload: { email: string }) {
    return apiRequest<{ id: string; email: string; managedPatientId: string; expiresAt: string; inviteUrl: string }>(
      `/institution/patients/${managedPatientId}/access-invite`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
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
    institutionResponsibleName?: string;
    institutionResponsiblePhone?: string;
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
