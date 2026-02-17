import { getLoginSession } from '@/lib/shyntr-api';
import { LoginForm } from '@/components/LoginForm';
import { SessionExpired } from '@/components/SessionExpired';

interface LoginPageProps {
  searchParams: Promise<{ login_challenge?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const loginChallenge = params.login_challenge;

  if (!loginChallenge) {
    return <SessionExpired />;
  }

  const { data, error } = await getLoginSession(loginChallenge);

  if (error || !data) {
    console.error('Login session fetch failed:', error);
    return <SessionExpired />;
  }

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
