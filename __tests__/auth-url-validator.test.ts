import { isAllowedAuthUrl } from '@/lib/shyntr-api';

describe('isAllowedAuthUrl', () => {
  afterEach(() => {
    delete process.env.SHYNTR_AUTH_ALLOWED_ORIGINS;
  });

  it('allows the internal API origin', () => {
    expect(isAllowedAuthUrl('http://localhost:7497/auth/password/verify')).toBe(true);
  });

  it('allows the public API origin', () => {
    expect(isAllowedAuthUrl('http://localhost:7496/auth/methods')).toBe(true);
  });

  it('allows an origin listed in SHYNTR_AUTH_ALLOWED_ORIGINS', () => {
    process.env.SHYNTR_AUTH_ALLOWED_ORIGINS = 'https://verifier.example.com:8443';
    expect(isAllowedAuthUrl('https://verifier.example.com:8443/password/verify')).toBe(true);
  });

  it('rejects an unlisted origin', () => {
    process.env.SHYNTR_AUTH_ALLOWED_ORIGINS = 'https://verifier.example.com';
    expect(isAllowedAuthUrl('https://evil.example.com/password/verify')).toBe(false);
  });

  it('rejects an invalid URL', () => {
    expect(isAllowedAuthUrl('/password/verify')).toBe(false);
  });

  it('rejects an unsupported scheme', () => {
    process.env.SHYNTR_AUTH_ALLOWED_ORIGINS = 'ftp://verifier.example.com';
    expect(isAllowedAuthUrl('ftp://verifier.example.com/password/verify')).toBe(false);
  });

  it('rejects wildcard-like allowlist values', () => {
    process.env.SHYNTR_AUTH_ALLOWED_ORIGINS = 'https://*.example.com';
    expect(isAllowedAuthUrl('https://auth.example.com/password/verify')).toBe(false);
  });
});
