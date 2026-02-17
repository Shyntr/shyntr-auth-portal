import { getConsentSession } from '@/lib/shyntr-api';
import { ConsentForm } from '@/components/ConsentForm';
import { SessionExpired } from '@/components/SessionExpired';

interface ConsentPageProps {
  searchParams: Promise<{ consent_challenge?: string }>;
}

export default async function ConsentPage({ searchParams }: ConsentPageProps) {
  const params = await searchParams;
  const consentChallenge = params.consent_challenge;

  // If no challenge provided, show session expired
  if (!consentChallenge) {
    return <SessionExpired />;
  }

  // Fetch consent session from internal Shyntr API
  const { data, error } = await getConsentSession(consentChallenge);

  // If API returns error (404/400), show session expired
  if (error || !data) {
    console.error('Consent session fetch failed:', error);
    return <SessionExpired />;
  }

  // Extract branding info
  const tenantName = data.tenant?.display_name || 'Shyntr';
  const clientName = data.client?.client_name || 'Application';
  const requestedScopes = data.requested_scope || ['openid', 'profile'];

  return (
    <ConsentForm
      consentChallenge={consentChallenge}
      tenantName={tenantName}
      clientName={clientName}
      requestedScopes={requestedScopes}
    />
  );
}
