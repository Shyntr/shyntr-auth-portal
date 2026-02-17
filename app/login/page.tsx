import { getLoginSession } from '@/lib/shyntr-api';
import { LoginForm } from '@/components/LoginForm';
import { SessionExpired } from '@/components/SessionExpired';

interface LoginPageProps {
  searchParams: Promise<{ login_challenge?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const loginChallenge = params.login_challenge;

  // If no challenge provided, show session expired
  if (!loginChallenge) {
    return <SessionExpired />;
  }

  // Fetch login session from internal Shyntr API
  const { data, error } = await getLoginSession(loginChallenge);

  // If API returns error (404/400), show session expired
  if (error || !data) {
    console.error('Login session fetch failed:', error);
    return <SessionExpired />;
  }

  // Extract branding info
  const tenantName = data.tenant?.display_name || 'Shyntr';
  const clientName = data.client?.client_name || 'Application';

  return (
    <LoginForm
      loginChallenge={loginChallenge}
      tenantName={tenantName}
      clientName={clientName}
    />
  );
}
