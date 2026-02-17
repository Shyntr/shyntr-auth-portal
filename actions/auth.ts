'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import {
  acceptLogin,
  rejectLogin,
  acceptConsent,
  rejectConsent,
  AcceptLoginPayload,
  AcceptConsentPayload,
} from '@/lib/shyntr-api';

// Mock credentials for demo - in production, this would validate against a real user store
const MOCK_USERS: Record<string, { password: string; userId: string }> = {
  admin: { password: 'password', userId: 'user-admin-001' },
  demo: { password: 'demo123', userId: 'user-demo-002' },
};

export interface LoginFormState {
  error?: string;
  success?: boolean;
}

export interface ConsentFormState {
  error?: string;
  success?: boolean;
}

// ================== LOCALE ACTION ==================

export async function setLocale(locale: string) {
  const cookieStore = await cookies();
  cookieStore.set('locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  });
}

// ================== LOGIN ACTIONS ==================

export async function handleLoginSubmit(
  loginChallenge: string,
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const remember = formData.get('remember') === 'on';

  // Mock credential verification
  const user = MOCK_USERS[username];
  if (!user || user.password !== password) {
    return { error: 'invalid_credentials' };
  }

  // Build payload for Shyntr API
  const payload: AcceptLoginPayload = {
    subject: user.userId,
    remember,
    remember_for: remember ? 3600 : 0,
    context: {
      username: username,
    },
  };

  const result = await acceptLogin(loginChallenge, payload);

  if (result.error) {
    console.error('Login accept failed:', result.error);
    return { error: result.error.error_description || 'Login failed' };
  }

  if (result.data?.redirect_to) {
    redirect(result.data.redirect_to);
  }

  return { error: 'No redirect URL received' };
}

export async function handleLoginCancel(loginChallenge: string): Promise<void> {
  const result = await rejectLogin(loginChallenge);

  if (result.data?.redirect_to) {
    redirect(result.data.redirect_to);
  }

  // If no redirect, go to a default error page
  redirect('/logout');
}

// ================== CONSENT ACTIONS ==================

export async function handleConsentAccept(
  consentChallenge: string,
  prevState: ConsentFormState,
  formData: FormData
): Promise<ConsentFormState> {
  // Collect granted scopes from checkboxes
  const grantedScopes: string[] = [];
  formData.forEach((value, key) => {
    if (key.startsWith('scope_') && value === 'on') {
      grantedScopes.push(key.replace('scope_', ''));
    }
  });

  const remember = formData.get('remember') === 'on';

  const payload: AcceptConsentPayload = {
    grant_scope: grantedScopes,
    grant_audience: [],
    remember,
    remember_for: remember ? 3600 : 0,
  };

  const result = await acceptConsent(consentChallenge, payload);

  if (result.error) {
    console.error('Consent accept failed:', result.error);
    return { error: result.error.error_description || 'Failed to grant consent' };
  }

  if (result.data?.redirect_to) {
    redirect(result.data.redirect_to);
  }

  return { error: 'No redirect URL received' };
}

export async function handleConsentDeny(consentChallenge: string): Promise<void> {
  const result = await rejectConsent(consentChallenge);

  if (result.data?.redirect_to) {
    redirect(result.data.redirect_to);
  }

  // If no redirect, go to logout
  redirect('/logout');
}
