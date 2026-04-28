import { handleLoginSubmit } from '@/actions/auth';
import {
  acceptLogin,
  isAllowedAuthUrl,
  loginWithLDAP,
  verifyPasswordCredentials,
} from '@/lib/shyntr-api';
import { redirect } from 'next/navigation';

jest.mock('@/lib/shyntr-api', () => ({
  acceptLogin: jest.fn(),
  loginWithLDAP: jest.fn(),
  verifyPasswordCredentials: jest.fn(),
  isAllowedAuthUrl: jest.fn(),
  rejectLogin: jest.fn(),
  acceptConsent: jest.fn(),
  rejectConsent: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({ set: jest.fn() }),
}));

const mockLoginWithLDAP = loginWithLDAP as jest.MockedFunction<typeof loginWithLDAP>;
const mockVerifyPassword = verifyPasswordCredentials as jest.MockedFunction<
  typeof verifyPasswordCredentials
>;
const mockAcceptLogin = acceptLogin as jest.MockedFunction<typeof acceptLogin>;
const mockIsAllowedAuthUrl = isAllowedAuthUrl as jest.MockedFunction<typeof isAllowedAuthUrl>;
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

const VALID_CHALLENGE = 'valid_login_challenge_xyz';
const VALID_PASSWORD_URL = 'http://localhost:7497/auth/password/verify';
const VALID_LDAP_URL = 'http://localhost:7497/auth/ldap/verify';
const TEST_PASSWORD = 'SuperSecret123!';
const REDIRECT_TARGET = 'https://app.shyntr.example/oauth/callback';
const NORMALIZED_IDENTITY_RESULT = {
  subject: 'ext:testuser',
  context: {
    identity: {
      attributes: {
        preferred_username: 'testuser',
        email: 'testuser@example.com',
      },
      groups: ['engineering'],
      roles: ['admin'],
    },
    authentication: {
      amr: ['pwd'],
      authenticated_at: '2026-04-23T18:30:00Z',
    },
  },
};

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.append(key, value);
  }
  return fd;
}

function passwordForm(overrides: Partial<Record<string, string>> = {}): FormData {
  return makeFormData({
    auth_method_type: 'password',
    auth_method_login_url: VALID_PASSWORD_URL,
    username: 'testuser',
    password: TEST_PASSWORD,
    ...overrides,
  });
}

function ldapForm(overrides: Partial<Record<string, string>> = {}): FormData {
  return makeFormData({
    auth_method_type: 'ldap',
    auth_method_login_url: VALID_LDAP_URL,
    username: 'testuser',
    password: TEST_PASSWORD,
    ...overrides,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockIsAllowedAuthUrl.mockReturnValue(true);
});

describe('handleLoginSubmit password flow', () => {
  it('calls acceptLogin with verifier subject and context on success', async () => {
    mockVerifyPassword.mockResolvedValue({ data: NORMALIZED_IDENTITY_RESULT });
    mockAcceptLogin.mockResolvedValue({ data: { redirect_to: REDIRECT_TARGET } });

    await handleLoginSubmit(VALID_CHALLENGE, {}, passwordForm()).catch(() => {});

    expect(mockAcceptLogin).toHaveBeenCalledWith(VALID_CHALLENGE, {
      subject: NORMALIZED_IDENTITY_RESULT.subject,
      remember: false,
      remember_for: 0,
      context: NORMALIZED_IDENTITY_RESULT.context,
    });
  });

  it('redirects when acceptLogin returns redirect_to', async () => {
    mockVerifyPassword.mockResolvedValue({ data: NORMALIZED_IDENTITY_RESULT });
    mockAcceptLogin.mockResolvedValue({ data: { redirect_to: REDIRECT_TARGET } });

    await handleLoginSubmit(VALID_CHALLENGE, {}, passwordForm()).catch(() => {});

    expect(mockRedirect).toHaveBeenCalledWith(REDIRECT_TARGET);
  });

  it('fails before verifier call when password login_url is not allowlisted', async () => {
    mockIsAllowedAuthUrl.mockReturnValue(false);

    const result = await handleLoginSubmit(VALID_CHALLENGE, {}, passwordForm());

    expect(result.error).toBe('login_failed');
    expect(mockVerifyPassword).not.toHaveBeenCalled();
  });

  it('returns invalid_credentials when the verifier rejects credentials', async () => {
    mockVerifyPassword.mockResolvedValue({
      error: { error: 'invalid_credentials', status_code: 401 },
    });

    const result = await handleLoginSubmit(VALID_CHALLENGE, {}, passwordForm());

    expect(result.error).toBe('invalid_credentials');
    expect(mockAcceptLogin).not.toHaveBeenCalled();
  });
});

describe('handleLoginSubmit LDAP path', () => {
  it('keeps LDAP flow unchanged', async () => {
    mockLoginWithLDAP.mockResolvedValue({ data: { redirect_to: REDIRECT_TARGET } });

    await handleLoginSubmit(VALID_CHALLENGE, {}, ldapForm()).catch(() => {});

    expect(mockLoginWithLDAP).toHaveBeenCalledWith(VALID_LDAP_URL, {
      login_challenge: VALID_CHALLENGE,
      username: 'testuser',
      password: TEST_PASSWORD,
    });
    expect(mockVerifyPassword).not.toHaveBeenCalled();
  });
});
