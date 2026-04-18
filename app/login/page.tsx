import { getLoginSession, getLoginMethods } from '@/lib/shyntr-api';
import { LoginForm } from '@/components/LoginForm';
import { SessionExpired } from '@/components/SessionExpired';

interface LoginPageProps {
  searchParams: Promise<{ login_challenge?: string; tenant_id?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const loginChallenge = params.login_challenge;

  if (!loginChallenge) {
    return <SessionExpired />;
  }

  const [sessionRes, methodsRes] = await Promise.all([
    getLoginSession(loginChallenge),
    getLoginMethods(loginChallenge),
  ]);

  if (sessionRes.error || !sessionRes.data || methodsRes.error) {
    return <SessionExpired />;
  }

  const tenantName =
    sessionRes.data.TenantID || methodsRes.data?.tenant_id || params.tenant_id || 'Shyntr';
  const clientName = sessionRes.data.ClientID || 'Application';
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
