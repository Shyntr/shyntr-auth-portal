import { getConsentSession } from '@/lib/shyntr-api';
import { ConsentForm } from '@/components/ConsentForm';
import { SessionExpired } from '@/components/SessionExpired';

interface ConsentPageProps {
  searchParams: Promise<{ consent_challenge?: string }>;
}

export default async function ConsentPage({ searchParams }: ConsentPageProps) {
  const params = await searchParams;
  const consentChallenge = params.consent_challenge;

  if (!consentChallenge) {
    return <SessionExpired />;
  }

  const { data, error } = await getConsentSession(consentChallenge);

  if (error || !data) {
    console.error('Consent session fetch failed:', error);
    return <SessionExpired />;
  }

  const tenantName = data.tenant?.display_name || 'Shyntr';
  const clientName = data.client?.client_name || 'Application';
  const requestedScopes = data.requested_scope || ['openid', 'profile'];
  const userSubject = data.subject;

  return (
    <ConsentForm
      consentChallenge={consentChallenge}
      tenantName={tenantName}
      clientName={clientName}
      requestedScopes={requestedScopes}
      userSubject={userSubject}
    />
  );
}
