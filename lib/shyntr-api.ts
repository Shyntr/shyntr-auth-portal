import axios, { AxiosError } from 'axios';

export interface LoginSessionResponse {
  ID: string;
  TenantID: string;
  ClientID: string;
  Subject: string;
  RequestedScope?: string[];
  RequestedAudience?: string[];
  RequestURL?: string;
  Protocol?: string;
  Authenticated?: boolean;
  Remember?: boolean;
  RememberFor?: number;
  Active?: boolean;
}

export interface ClientInfo {
  client_id: string;
  tenant_id: string;
  name: string;
  redirect_uris?: string[];
  grant_types?: string[];
  response_types?: string[];
  response_modes?: string[];
  scopes?: string[];
  audience?: string[];
  public?: boolean;
  token_endpoint_auth_method?: string;
  enforce_pkce?: boolean;
  allowed_cors_origins?: string[];
  post_logout_redirect_uris?: string[];
  jwks_uri?: string;
  id_token_encrypted_response_alg?: string;
  id_token_encrypted_response_enc?: string;
  skip_consent?: boolean;
  subject_type?: string;
  backchannel_logout_uri?: string;
  access_token_lifespan?: string;
  id_token_lifespan?: string;
  refresh_token_lifespan?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConsentSessionResponse {
  challenge: string;
  client_id: string;
  subject?: string;
  requested_scope: string[];
  requested_audience?: string[];
  skip?: boolean;
  request_url?: string;
  client?: ClientInfo;
  tenant?: string;
}

export interface AcceptLoginPayload {
  subject: string;
  remember?: boolean;
  remember_for?: number;
  context?: Record<string, unknown>;
}

export interface LDAPLoginPayload {
  login_challenge: string;
  username: string;
  password: string;
}

export interface PasswordVerifyPayload {
  login_challenge: string;
  username: string;
  password: string;
}

type NormalizedIdentityAttributeValue = string | number | boolean | null;

export interface NormalizedLoginIdentity {
  attributes?: Record<string, NormalizedIdentityAttributeValue>;
  groups?: string[];
  roles?: string[];
}

export interface NormalizedLoginAuthentication {
  amr?: string[];
  acr?: string;
  authenticated_at?: string;
}

export interface NormalizedLoginContext {
  [key: string]: unknown;
  identity?: NormalizedLoginIdentity;
  authentication?: NormalizedLoginAuthentication;
}

export interface PasswordVerifierIdentityResult {
  subject: string;
  context: NormalizedLoginContext;
}

export interface AcceptConsentPayload {
  grant_scope: string[];
  grant_audience?: string[];
  remember?: boolean;
  remember_for?: number;
}

export interface RejectRequestPayload {
  error: string;
  error_description?: string;
}

export interface RedirectResponse {
  redirect_to: string;
}

export interface ApiError {
  error: string;
  error_description?: string;
  status_code?: number;
}

export interface AuthMethod {
  id: string;
  type: 'password' | 'saml' | 'oidc' | 'ldap';
  name: string;
  logo_url?: string;
  login_url?: string;
}

export interface LoginMethodsResponse {
  challenge: string;
  tenant_id: string;
  methods: AuthMethod[];
}

const INTERNAL_API_URL = process.env.SHYNTR_INTERNAL_API_URL;
const PUBLIC_API_URL = process.env.SHYNTR_PUBLIC_API_URL;

if (!INTERNAL_API_URL || !PUBLIC_API_URL) {
  throw new Error(
    'SHYNTR_INTERNAL_API_URL and SHYNTR_PUBLIC_API_URL are required. Expected current backend admin/public origins, for example http://localhost:7497 and http://localhost:7496.'
  );
}

const REQUIRED_INTERNAL_API_URL = INTERNAL_API_URL;
const REQUIRED_PUBLIC_API_URL = PUBLIC_API_URL;
const VERIFIER_TIMEOUT_MS = 8000;

const apiClient = axios.create({
  baseURL: `${REQUIRED_INTERNAL_API_URL}/admin`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

function mapFetchError(status: number, data: unknown, fallback: string): ApiError {
  const body = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {};

  return {
    error: typeof body.error === 'string' ? body.error : 'api_error',
    error_description:
      typeof body.error_description === 'string' ? body.error_description : fallback,
    status_code: status,
  };
}

function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    if (axiosError.response) {
      return {
        error: axiosError.response.data?.error || 'api_error',
        error_description: axiosError.response.data?.error_description || axiosError.message,
        status_code: axiosError.response.status,
      };
    }

    return {
      error: 'network_error',
      error_description: axiosError.message,
      status_code: 0,
    };
  }

  return {
    error: 'unknown_error',
    error_description: String(error),
    status_code: 500,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function summarizeDiagnosticValue(value: unknown, depth = 0): unknown {
  if (value === null || typeof value === 'boolean' || typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return value.length > 200 ? `${value.slice(0, 200)}...` : value;
  }

  if (Array.isArray(value)) {
    if (depth >= 1) {
      return { type: 'array', length: value.length };
    }

    return {
      type: 'array',
      length: value.length,
      sample: value.slice(0, 3).map((item) => summarizeDiagnosticValue(item, depth + 1)),
    };
  }

  if (!isRecord(value)) {
    return typeof value;
  }

  const entries = Object.entries(value);
  const summary: Record<string, unknown> = {};

  for (const [key, entryValue] of entries.slice(0, 10)) {
    summary[key] =
      depth >= 1
        ? Array.isArray(entryValue)
          ? { type: 'array', length: entryValue.length }
          : isRecord(entryValue)
            ? { type: 'object', keys: Object.keys(entryValue) }
            : summarizeDiagnosticValue(entryValue, depth + 1)
        : summarizeDiagnosticValue(entryValue, depth + 1);
  }

  if (entries.length > 10) {
    summary.__truncated__ = entries.length - 10;
  }

  return summary;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCleanString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '' && value.trim() === value;
}

function sanitizeStringList(value: unknown): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    return undefined;
  }

  const sanitized: string[] = [];
  for (const item of value) {
    if (!isCleanString(item)) {
      return undefined;
    }
    sanitized.push(item);
  }

  return sanitized;
}

function sanitizeIdentityAttributes(
  value: unknown
): Record<string, NormalizedIdentityAttributeValue> | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isPlainObject(value)) {
    return undefined;
  }

  const attributes: Record<string, NormalizedIdentityAttributeValue> = {};

  for (const [key, attributeValue] of Object.entries(value)) {
    if (!isCleanString(key)) {
      return undefined;
    }

    if (
      attributeValue !== null &&
      typeof attributeValue !== 'string' &&
      typeof attributeValue !== 'number' &&
      typeof attributeValue !== 'boolean'
    ) {
      return undefined;
    }

    attributes[key] = attributeValue;
  }

  return attributes;
}

function sanitizeNormalizedIdentity(value: unknown): NormalizedLoginIdentity | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isPlainObject(value)) {
    return undefined;
  }

  const attributes = sanitizeIdentityAttributes(value.attributes);
  const groups = sanitizeStringList(value.groups);
  const roles = sanitizeStringList(value.roles);

  if (
    (value.attributes !== undefined && attributes === undefined) ||
    (value.groups !== undefined && groups === undefined) ||
    (value.roles !== undefined && roles === undefined)
  ) {
    return undefined;
  }

  const identity: NormalizedLoginIdentity = {};
  if (attributes !== undefined) {
    identity.attributes = attributes;
  }
  if (groups !== undefined) {
    identity.groups = groups;
  }
  if (roles !== undefined) {
    identity.roles = roles;
  }

  return identity;
}

function sanitizeNormalizedAuthentication(
  value: unknown
): NormalizedLoginAuthentication | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isPlainObject(value)) {
    return undefined;
  }

  const amr = sanitizeStringList(value.amr);
  if (value.amr !== undefined && amr === undefined) {
    return undefined;
  }

  const authentication: NormalizedLoginAuthentication = {};

  if (amr !== undefined) {
    authentication.amr = amr;
  }

  if (value.acr !== undefined) {
    if (!isCleanString(value.acr)) {
      return undefined;
    }
    authentication.acr = value.acr;
  }

  if (value.authenticated_at !== undefined) {
    if (!isCleanString(value.authenticated_at)) {
      return undefined;
    }

    const authenticatedAt = new Date(value.authenticated_at);
    if (Number.isNaN(authenticatedAt.getTime())) {
      return undefined;
    }

    authentication.authenticated_at = value.authenticated_at;
  }

  return authentication;
}

export function normalizePasswordVerifierIdentityResult(
  data: unknown
): PasswordVerifierIdentityResult | undefined {
  if (!isPlainObject(data) || !isCleanString(data.subject) || !isPlainObject(data.context)) {
    return undefined;
  }

  const identity = sanitizeNormalizedIdentity(data.context.identity);
  const authentication = sanitizeNormalizedAuthentication(data.context.authentication);

  if (
    (data.context.identity !== undefined && identity === undefined) ||
    (data.context.authentication !== undefined && authentication === undefined)
  ) {
    return undefined;
  }

  if (identity === undefined && authentication === undefined) {
    return undefined;
  }

  const context: NormalizedLoginContext = {};
  if (identity !== undefined) {
    context.identity = identity;
  }
  if (authentication !== undefined) {
    context.authentication = authentication;
  }

  return {
    subject: data.subject,
    context,
  };
}

export function isAllowedAuthUrl(url: string): boolean {
  if (!url || url.trim() === '') {
    return false;
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return false;
  }

  const allowedOrigins = new Set<string>();

  for (const base of [REQUIRED_INTERNAL_API_URL, REQUIRED_PUBLIC_API_URL]) {
    try {
      allowedOrigins.add(new URL(base).origin);
    } catch {
      // Ignore malformed base URLs in config.
    }
  }

  const extraRaw = process.env.SHYNTR_AUTH_ALLOWED_ORIGINS ?? '';
  for (const entry of extraRaw.split(',')) {
    const trimmed = entry.trim();
    if (trimmed === '') {
      continue;
    }

    try {
      const extra = new URL(trimmed);
      if (extra.protocol === 'http:' || extra.protocol === 'https:') {
        allowedOrigins.add(extra.origin);
      }
    } catch {
      // Ignore invalid or unsupported allowlist entries.
    }
  }

  return allowedOrigins.has(parsed.origin);
}

export async function getLoginSession(
  loginChallenge: string
): Promise<{ data?: LoginSessionResponse; error?: ApiError }> {
  try {
    const response = await apiClient.get<LoginSessionResponse>('/login', {
      params: { login_challenge: loginChallenge },
    });

    return { data: response.data };
  } catch (error) {
    return { error: handleApiError(error) };
  }
}

export async function acceptLogin(
  loginChallenge: string,
  payload: AcceptLoginPayload
): Promise<{ data?: RedirectResponse; error?: ApiError }> {
  try {
    const response = await apiClient.put<RedirectResponse>('/login/accept', payload, {
      params: { login_challenge: loginChallenge },
    });

    const responseData = response.data as unknown;
    const responseKeys = isRecord(responseData) ? Object.keys(responseData) : [];
    const redirectTo =
      isRecord(responseData) && typeof responseData.redirect_to === 'string'
        ? responseData.redirect_to
        : undefined;

    console.info('Shyntr acceptLogin transport result', {
      has_login_challenge: loginChallenge.trim() !== '',
      status_code: response.status,
      response_keys: responseKeys,
      has_redirect_to: typeof redirectTo === 'string' && redirectTo !== '',
      response_summary: summarizeDiagnosticValue(responseData),
    });

    return { data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;

      console.error('Shyntr acceptLogin transport error', {
        has_login_challenge: loginChallenge.trim() !== '',
        status_code: error.response?.status ?? null,
        backend_error:
          isRecord(responseData) && typeof responseData.error === 'string'
            ? responseData.error
            : null,
        backend_error_description:
          isRecord(responseData) && typeof responseData.error_description === 'string'
            ? responseData.error_description
            : null,
        response_keys: isRecord(responseData) ? Object.keys(responseData) : [],
        response_summary: summarizeDiagnosticValue(responseData),
      });
    } else {
      console.error('Shyntr acceptLogin transport error', {
        has_login_challenge: loginChallenge.trim() !== '',
        error_type: error instanceof Error ? error.name : typeof error,
        error_message: error instanceof Error ? error.message : String(error),
      });
    }

    return { error: handleApiError(error) };
  }
}

export async function rejectLogin(
  loginChallenge: string
): Promise<{ data?: RedirectResponse; error?: ApiError }> {
  try {
    const payload: RejectRequestPayload = { error: 'access_denied' };
    const response = await apiClient.put<RedirectResponse>('/login/reject', payload, {
      params: { login_challenge: loginChallenge },
    });

    return { data: response.data };
  } catch (error) {
    return { error: handleApiError(error) };
  }
}

export async function getConsentSession(
  consentChallenge: string
): Promise<{ data?: ConsentSessionResponse; error?: ApiError }> {
  try {
    const response = await apiClient.get<ConsentSessionResponse>('/consent', {
      params: { consent_challenge: consentChallenge },
    });

    return { data: response.data };
  } catch (error) {
    return { error: handleApiError(error) };
  }
}

export async function acceptConsent(
  consentChallenge: string,
  payload: AcceptConsentPayload
): Promise<{ data?: RedirectResponse; error?: ApiError }> {
  try {
    const response = await apiClient.put<RedirectResponse>('/consent/accept', payload, {
      params: { consent_challenge: consentChallenge },
    });

    return { data: response.data };
  } catch (error) {
    return { error: handleApiError(error) };
  }
}

export async function rejectConsent(
  consentChallenge: string
): Promise<{ data?: RedirectResponse; error?: ApiError }> {
  try {
    const payload: RejectRequestPayload = { error: 'access_denied' };
    const response = await apiClient.put<RedirectResponse>('/consent/reject', payload, {
      params: { consent_challenge: consentChallenge },
    });

    return { data: response.data };
  } catch (error) {
    return { error: handleApiError(error) };
  }
}

export async function getLoginMethods(
  challenge: string
): Promise<{ data?: LoginMethodsResponse; error?: ApiError }> {
  try {
    const response = await fetch(
      `${REQUIRED_PUBLIC_API_URL}/auth/methods?login_challenge=${encodeURIComponent(challenge)}`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      let data: unknown = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      return {
        error: mapFetchError(
          response.status,
          data,
          `Failed to retrieve login methods (${response.status}).`
        ),
      };
    }

    const data = (await response.json()) as LoginMethodsResponse;
    return { data };
  } catch (error) {
    return { error: handleApiError(error) };
  }
}

export async function loginWithLDAP(
  loginURL: string,
  payload: LDAPLoginPayload
): Promise<{ data?: RedirectResponse; error?: ApiError }> {
  try {
    const response = await fetch(loginURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      redirect: 'manual',
      cache: 'no-store',
    });

    if (response.status >= 300 && response.status < 400) {
      const redirectTo = response.headers.get('location');
      if (!redirectTo) {
        return {
          error: {
            error: 'server_error',
            error_description: 'LDAP login completed without a redirect location.',
            status_code: response.status,
          },
        };
      }

      return { data: { redirect_to: redirectTo } };
    }

    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      return {
        error: mapFetchError(
          response.status,
          data,
          `LDAP login failed (${response.status}).`
        ),
      };
    }

    if (typeof data === 'object' && data !== null) {
      const redirectTo = (data as Record<string, unknown>).redirect_to;
      if (typeof redirectTo === 'string' && redirectTo !== '') {
        return { data: { redirect_to: redirectTo } };
      }
    }

    return {
      error: {
        error: 'server_error',
        error_description: 'LDAP login did not return a redirect target.',
        status_code: response.status,
      },
    };
  } catch (error) {
    return { error: handleApiError(error) };
  }
}

export async function verifyPasswordCredentials(
  loginURL: string,
  payload: PasswordVerifyPayload
): Promise<{ data?: PasswordVerifierIdentityResult; error?: ApiError }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), VERIFIER_TIMEOUT_MS);

  try {
    const response = await fetch(loginURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      redirect: 'manual',
      cache: 'no-store',
      signal: controller.signal,
    });

    if (response.status >= 300 && response.status < 400) {
      return {
        error: {
          error: 'login_failed',
          error_description: 'Password verifier returned an unsupported redirect response.',
          status_code: response.status,
        },
      };
    }

    if (response.status === 400 || response.status === 401 || response.status === 403) {
      return {
        error: {
          error: 'invalid_credentials',
          status_code: response.status,
        },
      };
    }

    if (!response.ok) {
      return {
        error: {
          error: 'login_failed',
          status_code: response.status,
        },
      };
    }

    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      return {
        error: {
          error: 'login_failed',
          error_description: 'Password verifier returned an unreadable response.',
          status_code: response.status,
        },
      };
    }

    const normalized = normalizePasswordVerifierIdentityResult(data);
    if (normalized) {
      return { data: normalized };
    }

    return {
      error: {
        error: 'login_failed',
        error_description: 'Password verifier did not return a valid identity result.',
        status_code: response.status,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        error: {
          error: 'timeout',
          error_description: 'Password verifier request timed out.',
          status_code: 0,
        },
      };
    }

    return { error: handleApiError(error) };
  } finally {
    clearTimeout(timeoutId);
  }
}
