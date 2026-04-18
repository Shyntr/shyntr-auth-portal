'use client';

import { useFormState } from 'react-dom';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { handleLoginCancel, handleLoginSubmit } from '@/actions/auth';
import { AuthMethod } from '@/lib/shyntr-api';
import { CardWrapper } from './CardWrapper';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoginFormProps {
  loginChallenge: string;
  tenantName: string;
  clientName: string;
  methods: AuthMethod[];
}

export function LoginForm({
  loginChallenge,
  tenantName,
  clientName,
  methods,
}: LoginFormProps) {
  const t = useTranslations('login');
  const boundAction = handleLoginSubmit.bind(null, loginChallenge);
  const [state, formAction] = useFormState(boundAction, {});
  const [isPending, startTransition] = useTransition();
  const [passwordFocused, setPasswordFocused] = useState(false);

  const passwordMethod = methods.find((method) => method.type === 'password');
  const ldapMethods = methods.filter((method) => method.type === 'ldap');
  const ssoMethods = methods.filter(
    (method) => method.type === 'saml' || method.type === 'oidc'
  );
  const credentialMethods = [...(passwordMethod ? [passwordMethod] : []), ...ldapMethods];
  const initialCredentialMethod = credentialMethods[0];
  const [selectedCredentialMethodId, setSelectedCredentialMethodId] = useState(
    initialCredentialMethod?.id || ''
  );

  const selectedCredentialMethod =
    credentialMethods.find((method) => method.id === selectedCredentialMethodId) ||
    initialCredentialMethod;

  const handleSubmit = (payload: FormData) => {
    startTransition(() => {
      formAction(payload);
    });
  };

  const handleCancel = async () => {
    await handleLoginCancel(loginChallenge);
  };

  const handleSSORedirect = (loginUrl?: string) => {
    if (!loginUrl) {
      return;
    }

    window.location.href = loginUrl;
  };

  const credentialSubmitLabel =
    selectedCredentialMethod?.type === 'ldap'
      ? t('signInWith', { name: selectedCredentialMethod.name })
      : t('login');

  const getProviderIcon = (provider: AuthMethod) => {
    if (provider.logo_url) {
      return <img src={provider.logo_url} alt={provider.name} className="h-6 w-6 object-contain" />;
    }

    const name = provider.name.toLowerCase();

    if (name.includes('shyntr')) {
      return <img src="/mascot.png" alt="Shyntr" className="h-6 w-6 object-contain" />;
    }
    if (name.includes('google')) {
      return <img src="/assets/google.png" alt="Google" className="h-6 w-6 object-contain" />;
    }
    if (name.includes('github')) {
      return <img src="/assets/github.png" alt="GitHub" className="h-6 w-6 object-contain" />;
    }
    if (name.includes('keycloak')) {
      return <img src="/assets/keycloak.png" alt="Keycloak" className="h-6 w-6 object-contain" />;
    }
    if (name.includes('okta')) {
      return <img src="/assets/okta.png" alt="Okta" className="h-6 w-6 object-contain" />;
    }
    if (name.includes('auth0')) {
      return <img src="/assets/auth0.png" alt="Auth0" className="h-6 w-6 object-contain" />;
    }
    if (name.includes('microsoft') || name.includes('adfs') || name.includes('entra')) {
      return (
        <img src="/assets/microsoft.png" alt="Microsoft" className="h-6 w-6 object-contain" />
      );
    }
    if (name.includes('apple')) {
      return <img src="/assets/apple.png" alt="Apple" className="h-6 w-6 object-contain" />;
    }
    if (name.includes('x')) {
      return <img src="/assets/x.png" alt="X" className="h-6 w-6 object-contain" />;
    }
    if (name.includes('facebook')) {
      return <img src="/assets/facebook.png" alt="Facebook" className="h-6 w-6 object-contain" />;
    }
    if (name.includes('linkedin')) {
      return <img src="/assets/linkedin.png" alt="LinkedIn" className="h-6 w-6 object-contain" />;
    }
    if (name.includes('gitlab')) {
      return <img src="/assets/gitlab.png" alt="GitLab" className="h-6 w-6 object-contain" />;
    }
    if (name.includes('atlassian') || name.includes('bitbucket')) {
      return (
        <img src="/assets/atlassian.svg" alt="Atlassian" className="h-6 w-6 object-contain" />
      );
    }
    if (name.includes('ping')) {
      return (
        <img src="/assets/pingID.png" alt="Ping Identity" className="h-6 w-6 object-contain" />
      );
    }
    if (name.includes('onelogin')) {
      return <img src="/assets/onelogin.png" alt="OneLogin" className="h-6 w-6 object-contain" />;
    }
    if (name.includes('slack')) {
      return <img src="/assets/slack.png" alt="Slack" className="h-6 w-6 object-contain" />;
    }
    if (name.includes('ory') || name.includes('hydra') || name.includes('polis')) {
      return <img src="/assets/ory.png" alt="Ory" className="h-6 w-6 object-contain" />;
    }
    if (name.includes('ldap') || name.includes('active directory')) {
      return <img src="/assets/openid.png" alt="LDAP" className="h-6 w-6 object-contain" />;
    }
    if (name.includes('saml')) {
      return <img src="/assets/saml.png" alt="SAML" className="h-6 w-6 object-contain" />;
    }
    if (name.includes('openid') || name.includes('oidc') || name.includes('oauth')) {
      return <img src="/assets/openid.png" alt="OpenID" className="h-6 w-6 object-contain" />;
    }

    return null;
  };

  return (
    <CardWrapper mascotIdle={!passwordFocused}>
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">{t('signIn')}</h1>
        <p className="text-sm text-gray-500">
          {t.rich('toContinueTo', {
            name: clientName,
            b: (chunks) => <span className="font-semibold text-gray-700">{chunks}</span>,
          })}
        </p>
        {tenantName !== 'Shyntr' && (
          <div className="mt-3 inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">
            {t('at')} <span className="ml-1 font-semibold text-gray-800">{tenantName}</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {state.error && (
          <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {state.error === 'invalid_credentials' ? t('invalidCredentials') : state.error}
            </AlertDescription>
          </Alert>
        )}

        {credentialMethods.length > 0 && (
          <form action={handleSubmit} className="space-y-4">
            <input
              type="hidden"
              name="auth_method_type"
              value={selectedCredentialMethod?.type || 'password'}
            />
            <input
              type="hidden"
              name="auth_method_login_url"
              value={selectedCredentialMethod?.login_url || ''}
            />

            {credentialMethods.length > 1 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">{t('signIn')}</Label>
                <div className="grid gap-2">
                  {credentialMethods.map((method) => {
                    const isSelected = selectedCredentialMethod?.id === method.id;

                    return (
                      <Button
                        key={method.id}
                        type="button"
                        variant="outline"
                        className={`justify-start rounded-xl border text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedCredentialMethodId(method.id)}
                        disabled={isPending}
                      >
                        <span className="mr-3 flex h-6 w-6 items-center justify-center">
                          {getProviderIcon(method)}
                        </span>
                        {method.name}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                {t('username')}
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder={t('enterUsername')}
                required
                disabled={isPending}
                onFocus={() => setPasswordFocused(false)}
                className="h-12 rounded-xl border-gray-300 text-base focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                {t('password')}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={t('enterPassword')}
                required
                disabled={isPending}
                onFocus={() => setPasswordFocused(true)}
                className="h-12 rounded-xl border-gray-300 text-base focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {selectedCredentialMethod?.type === 'password' && (
              <div className="flex items-center space-x-3 py-1">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  disabled={isPending}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="remember" className="cursor-pointer text-sm font-normal text-gray-600">
                  {t('rememberMe')}
                </Label>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <Button
                type="submit"
                className="h-11 w-full rounded-xl bg-blue-600 px-8 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('signingIn')}
                  </>
                ) : (
                  credentialSubmitLabel
                )}
              </Button>
            </div>
          </form>
        )}

        {credentialMethods.length > 0 && ssoMethods.length > 0 && (
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">{t('or')}</span>
            </div>
          </div>
        )}

        {ssoMethods.length > 0 && (
          <div className="space-y-3">
            {ssoMethods.map((provider) => (
              <Button
                key={provider.id}
                variant="outline"
                type="button"
                className="relative flex h-12 w-full items-center justify-center rounded-xl border-gray-300 text-sm font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
                onClick={() => handleSSORedirect(provider.login_url)}
                disabled={isPending}
              >
                <div className="absolute left-4 flex items-center justify-center">
                  {getProviderIcon(provider)}
                </div>
                <span>{t('signInWith', { name: provider.name })}</span>
              </Button>
            ))}

            {credentialMethods.length === 0 && (
              <div className="flex items-center justify-center pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="px-4 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  {t('cancel')}
                </Button>
              </div>
            )}
          </div>
        )}

        {methods.length === 0 && !state.error && (
          <Alert className="rounded-xl border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="ml-2 text-sm text-yellow-800">
              {t('noMethods')}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </CardWrapper>
  );
}
