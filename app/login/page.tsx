import { getLoginSession, getLoginMethods } from '@/lib/shyntr-api';
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

  const [sessionRes, methodsRes] = await Promise.all([
    getLoginSession(loginChallenge),
    getLoginMethods(loginChallenge)
  ]);

  if (sessionRes.error || !sessionRes.data || methodsRes.error) {
    console.error('Login session or methods fetch failed:', sessionRes.error || methodsRes.error);
    return <SessionExpired />;
  }

  const tenantName = sessionRes.data.tenant?.display_name || 'Shyntr';
  const clientName = sessionRes.data.client?.client_name || 'Application';
  const methods = methodsRes.data?.methods || [];

  return (
    <LoginForm
      loginChallenge={loginChallenge}
      tenantName={tenantName}
      clientName={clientName}
      methods={methods}
    />
  );
}