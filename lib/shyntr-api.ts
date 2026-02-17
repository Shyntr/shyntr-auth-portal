import axios, { AxiosError } from 'axios';

// Types for Shyntr API
export interface TenantInfo {
  id: string;
  display_name: string;
  logo_url?: string;
}

export interface ClientInfo {
  client_id: string;
  client_name: string;
  logo_uri?: string;
  policy_uri?: string;
  tos_uri?: string;
}

export interface LoginSessionResponse {
  challenge: string;
  client: ClientInfo;
  tenant?: TenantInfo;
  requested_scope?: string[];
  requested_access_token_audience?: string[];
  skip?: boolean;
  subject?: string;
  oidc_context?: Record<string, unknown>;
}

export interface ConsentSessionResponse {
  challenge: string;
  client: ClientInfo;
  tenant?: TenantInfo;
  requested_scope: string[];
  requested_access_token_audience?: string[];
  skip?: boolean;
  subject?: string;
  login_challenge?: string;
  login_session_id?: string;
}

export interface AcceptLoginPayload {
  subject: string;
  remember?: boolean;
  remember_for?: number;
  context?: Record<string, unknown>;
}

export interface AcceptConsentPayload {
  grant_scope: string[];
  grant_audience?: string[];
  remember?: boolean;
  remember_for?: number;
}

export interface RedirectResponse {
  redirect_to: string;
}

export interface ApiError {
  error: string;
  error_description?: string;
  status_code?: number;
}

// Create axios instance for internal API calls
const INTERNAL_API_URL = process.env.SHYNTR_INTERNAL_API_URL || 'http://localhost:7497/admin';

const apiClient = axios.create({
  baseURL: INTERNAL_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to handle API errors
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

// ================== LOGIN ENDPOINTS ==================

export async function getLoginSession(loginChallenge: string): Promise<{ data?: LoginSessionResponse; error?: ApiError }> {
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

export async function rejectLogin(loginChallenge: string): Promise<{ data?: RedirectResponse; error?: ApiError }> {
  try {
    const response = await apiClient.put<RedirectResponse>('/login/reject', {}, {
      params: { login_challenge: loginChallenge },
    });
    return { data: response.data };
  } catch (error) {
    return { error: handleApiError(error) };
  }
}

// ================== CONSENT ENDPOINTS ==================

export async function getConsentSession(consentChallenge: string): Promise<{ data?: ConsentSessionResponse; error?: ApiError }> {
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

export async function rejectConsent(consentChallenge: string): Promise<{ data?: RedirectResponse; error?: ApiError }> {
  try {
    const response = await apiClient.put<RedirectResponse>('/consent/reject', {}, {
      params: { consent_challenge: consentChallenge },
    });
    return { data: response.data };
  } catch (error) {
    return { error: handleApiError(error) };
  }
}
