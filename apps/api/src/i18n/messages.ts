import { HttpException } from '@nestjs/common';
import { DEFAULT_API_LOCALE, type ApiLocale } from './locale';
import { getRequestApiLocale } from './request-locale';

type ApiMessageKey =
  | 'sandbox.financialModeration'
  | 'chat.financialModeration'
  | 'errors.demoOnlySandbox'
  | 'errors.invalidCredentials'
  | 'errors.emailVerificationRequired'
  | 'errors.emailAlreadyRegistered'
  | 'errors.invalidRefreshToken'
  | 'errors.missingAuthenticationToken'
  | 'errors.invalidToken'
  | 'errors.dreamNotFound'
  | 'errors.proposalNotFound'
  | 'errors.conversationNotFound';

const apiDictionaries: Record<ApiLocale, Record<ApiMessageKey, string>> = {
  'pt-BR': {
    'sandbox.financialModeration':
      'No sandbox, mensagens com PIX, dinheiro ou doações são bloqueadas. Reformule oferecendo tempo, presença ou companhia.',
    'chat.financialModeration':
      'Mensagens com PIX, dinheiro ou doações não são permitidas neste chat. Reformule oferecendo tempo, presença ou companhia.',
    'errors.demoOnlySandbox': 'O acesso demo está disponível apenas no modo sandbox.',
    'errors.invalidCredentials': 'Credenciais inválidas',
    'errors.emailVerificationRequired': 'A verificação de email é obrigatória antes do login',
    'errors.emailAlreadyRegistered': 'Email já cadastrado',
    'errors.invalidRefreshToken': 'Token de atualização inválido',
    'errors.missingAuthenticationToken': 'Token de autenticação ausente',
    'errors.invalidToken': 'Token inválido',
    'errors.dreamNotFound': 'Sonho não encontrado',
    'errors.proposalNotFound': 'Proposta não encontrada',
    'errors.conversationNotFound': 'Conversa não encontrada',
  },
  'en-US': {
    'sandbox.financialModeration':
      'In the sandbox, messages about PIX, money, or donations are blocked. Rephrase by offering time, presence, or companionship.',
    'chat.financialModeration':
      'Messages about PIX, money, or donations are not allowed in this chat. Rephrase by offering time, presence, or companionship.',
    'errors.demoOnlySandbox': 'Demo access is only available in sandbox mode.',
    'errors.invalidCredentials': 'Invalid credentials',
    'errors.emailVerificationRequired': 'Email verification is required before login',
    'errors.emailAlreadyRegistered': 'Email already registered',
    'errors.invalidRefreshToken': 'Invalid refresh token',
    'errors.missingAuthenticationToken': 'Missing authentication token',
    'errors.invalidToken': 'Invalid token',
    'errors.dreamNotFound': 'Dream not found',
    'errors.proposalNotFound': 'Proposal not found',
    'errors.conversationNotFound': 'Conversation not found',
  },
  'es-ES': {
    'sandbox.financialModeration':
      'En el sandbox, los mensajes con PIX, dinero o donaciones son bloqueados. Reformula ofreciendo tiempo, presencia o compania.',
    'chat.financialModeration':
      'Los mensajes con PIX, dinero o donaciones no están permitidos en este chat. Reformula ofreciendo tiempo, presencia o compania.',
    'errors.demoOnlySandbox': 'El acceso demo está disponible solo en modo sandbox.',
    'errors.invalidCredentials': 'Credenciales inválidas',
    'errors.emailVerificationRequired': 'La verificación de email es obligatoria antes de iniciar sesión',
    'errors.emailAlreadyRegistered': 'Email ya registrado',
    'errors.invalidRefreshToken': 'Token de actualización inválido',
    'errors.missingAuthenticationToken': 'Token de autenticación ausente',
    'errors.invalidToken': 'Token inválido',
    'errors.dreamNotFound': 'Sueño no encontrado',
    'errors.proposalNotFound': 'Propuesta no encontrada',
    'errors.conversationNotFound': 'Conversación no encontrada',
  },
};

const exceptionMessageKeys: Record<string, ApiMessageKey> = {
  'Demo access is only available in sandbox mode': 'errors.demoOnlySandbox',
  'Invalid credentials': 'errors.invalidCredentials',
  'Email verification is required before login': 'errors.emailVerificationRequired',
  'Email already registered': 'errors.emailAlreadyRegistered',
  'Invalid refresh token': 'errors.invalidRefreshToken',
  'Missing authentication token': 'errors.missingAuthenticationToken',
  'Invalid token': 'errors.invalidToken',
  'Dream not found': 'errors.dreamNotFound',
  'Proposal not found': 'errors.proposalNotFound',
  'Conversation not found': 'errors.conversationNotFound',
};

export function tApi(key: ApiMessageKey, locale: ApiLocale = getRequestApiLocale()): string {
  return apiDictionaries[locale]?.[key] ?? apiDictionaries[DEFAULT_API_LOCALE][key];
}

function translateMessage(message: unknown, locale: ApiLocale): unknown {
  if (typeof message === 'string') {
    const key = exceptionMessageKeys[message];
    return key ? tApi(key, locale) : message;
  }

  if (Array.isArray(message)) {
    return message.map((item) => translateMessage(item, locale));
  }

  return message;
}

export function getLocalizedExceptionResponse(exception: HttpException, locale: ApiLocale): Record<string, unknown> {
  const response = exception.getResponse();

  if (typeof response === 'string') {
    return {
      statusCode: exception.getStatus(),
      message: translateMessage(response, locale),
      error: exception.name.replace(/Exception$/, ''),
    };
  }

  if (response && typeof response === 'object') {
    const payload = response as Record<string, unknown>;
    return {
      ...payload,
      message: translateMessage(payload.message, locale),
    };
  }

  return {
    statusCode: exception.getStatus(),
    message: exception.message,
  };
}
