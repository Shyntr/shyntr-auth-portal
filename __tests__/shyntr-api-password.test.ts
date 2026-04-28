import {
  normalizePasswordVerifierIdentityResult,
  verifyPasswordCredentials,
} from '@/lib/shyntr-api';

const VALID_URL = 'http://localhost:7497/auth/password/verify';
const TEST_PAYLOAD = {
  login_challenge: 'test_challenge_abc123',
  username: 'testuser',
  password: 'S3cr3tP@ssw0rd!',
};
const VALID_IDENTITY_RESULT = {
  subject: 'ext:testuser',
  context: {
    identity: {
      attributes: {
        preferred_username: 'testuser',
        email: 'testuser@example.com',
        email_verified: true,
        login_count: 3,
        display_name: null,
      },
      groups: ['engineering'],
      roles: ['admin'],
    },
    authentication: {
      amr: ['pwd'],
      acr: 'urn:shyntr:password',
      authenticated_at: '2026-04-23T18:30:00Z',
    },
  },
};

function mockFetchResponse(
  status: number,
  body?: unknown,
  headers: Record<string, string> = {}
): void {
  const responseHeaders = new Headers(headers);
  jest.spyOn(global, 'fetch').mockResolvedValueOnce({
    status,
    ok: status >= 200 && status < 300,
    headers: responseHeaders,
    json: async () => body,
  } as Response);
}

function mockFetchThrows(error: Error): void {
  jest.spyOn(global, 'fetch').mockRejectedValueOnce(error);
}

function mockFetchMalformedJson(status: number): void {
  jest.spyOn(global, 'fetch').mockResolvedValueOnce({
    status,
    ok: status >= 200 && status < 300,
    headers: new Headers(),
    json: async () => {
      throw new SyntaxError('Unexpected token < in JSON at position 0');
    },
  } as unknown as Response);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('verifyPasswordCredentials', () => {
  it('returns subject and context on valid 200 response', async () => {
    mockFetchResponse(200, VALID_IDENTITY_RESULT);

    const result = await verifyPasswordCredentials(VALID_URL, TEST_PAYLOAD);

    expect(result.data).toEqual(VALID_IDENTITY_RESULT);
    expect(result.error).toBeUndefined();
  });

  it('classifies 401 as invalid_credentials', async () => {
    mockFetchResponse(401);

    const result = await verifyPasswordCredentials(VALID_URL, TEST_PAYLOAD);

    expect(result.error?.error).toBe('invalid_credentials');
  });

  it('classifies 302 as login_failed', async () => {
    mockFetchResponse(302);

    const result = await verifyPasswordCredentials(VALID_URL, TEST_PAYLOAD);

    expect(result.error?.error).toBe('login_failed');
  });

  it('classifies invalid JSON as login_failed', async () => {
    mockFetchMalformedJson(200);

    const result = await verifyPasswordCredentials(VALID_URL, TEST_PAYLOAD);

    expect(result.error?.error).toBe('login_failed');
  });

  it('classifies invalid response shape as login_failed', async () => {
    mockFetchResponse(200, {
      subject: 'ext:testuser',
      context: {
        identity: {
          attributes: {
            nested: { invalid: true },
          },
        },
      },
    });

    const result = await verifyPasswordCredentials(VALID_URL, TEST_PAYLOAD);

    expect(result.error?.error).toBe('login_failed');
  });

  it('does not include the password in returned errors', async () => {
    mockFetchThrows(new TypeError('fetch failed'));

    const result = await verifyPasswordCredentials(VALID_URL, TEST_PAYLOAD);

    expect(JSON.stringify(result)).not.toContain(TEST_PAYLOAD.password);
  });
});

describe('normalizePasswordVerifierIdentityResult', () => {
  it('copies only the normalized verifier envelope', () => {
    const result = normalizePasswordVerifierIdentityResult({
      ...VALID_IDENTITY_RESULT,
      upstream_response: { token: 'must-not-forward' },
      context: {
        ...VALID_IDENTITY_RESULT.context,
        raw: { token: 'must-not-forward' },
      },
    });

    expect(result).toEqual(VALID_IDENTITY_RESULT);
    expect(JSON.stringify(result)).not.toContain('must-not-forward');
  });

  it('rejects missing identity and authentication context', () => {
    expect(
      normalizePasswordVerifierIdentityResult({
        subject: 'ext:testuser',
        context: {},
      })
    ).toBeUndefined();
  });
});
