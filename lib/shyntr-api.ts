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

    return { data: response.data };
  } catch (error) {
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
