'use client';

import {useFormState} from 'react-dom';
import {useTranslations} from 'next-intl';
import {handleLoginSubmit, handleLoginCancel, LoginFormState} from '@/actions/auth';
import {CardWrapper} from './CardWrapper';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Button} from '@/components/ui/button';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {Loader2, AlertCircle} from 'lucide-react';
import {useCallback, useState, useTransition} from "react";
import {AuthMethod} from "@/lib/shyntr-api";

interface LoginFormProps {
    loginChallenge: string;
    tenantName: string;
    clientName: string;
    methods: AuthMethod[];
}

export function LoginForm({loginChallenge, tenantName, clientName, methods}: LoginFormProps) {
    const t = useTranslations('login');

    const boundAction = handleLoginSubmit.bind(null, loginChallenge);
    const [state, formAction] = useFormState(boundAction, {});
    const [isPending, startTransition] = useTransition();
    const [passwordFocused, setPasswordFocused] = useState(false);

    const passwordMethod = methods.find((m) => m.type === "password");
    const ssoMethods = methods.filter((m) => m.type !== "password");

    const handleUsernameFocus = useCallback(() => {
        setPasswordFocused(false);
    }, []);

    const handlePasswordFocus = useCallback(() => {
        setPasswordFocused(true);
    }, []);

    const handleSubmit = (payload: FormData) => {
        startTransition(() => {
            formAction(payload);
        });
    };

    const handleCancel = async () => {
        await handleLoginCancel(loginChallenge);
    };

    const handleSSORedirect = (loginUrl?: string) => {
        if (!loginUrl) return;
        window.location.href = loginUrl;
    };

    const getProviderIcon = (provider: AuthMethod) => {
        if (provider.logo_url) {
            return <img src={provider.logo_url} alt={provider.name} className="w-6 h-6 object-contain"/>;
        }

        const name = provider.name.toLowerCase();

        if (name.includes('shyntr')) return <img src="/mascot.png" alt="Shyntr"
                                                 className="w-6 h-6 object-contain"/>;
        if (name.includes('google')) return <img src="/assets/google.png" alt="Google"
                                                 className="w-6 h-6 object-contain"/>;
        if (name.includes('github')) return <img src="/assets/github.png" alt="GitHub"
                                                 className="w-6 h-6 object-contain"/>;
        if (name.includes('keycloak')) return <img src="/assets/keycloak.png" alt="Keycloak"
                                                   className="w-6 h-6 object-contain"/>;
        if (name.includes('okta')) return <img src="/assets/okta.png" alt="Okta" className="w-6 h-6 object-contain"/>;
        if (name.includes('auth0')) return <img src="/assets/auth0.png" alt="Auth0" className="w-6 h-6 object-contain"/>;
        if (name.includes('microsoft') || name.includes('adfs') || name.includes('entra')) return <img src="/assets/microsoft.png" alt="Microsoft"
                                                                                                       className="w-6 h-6 object-contain"/>;
        if (name.includes('apple')) return <img src="/assets/apple.png" alt="Apple" className="w-6 h-6 object-contain" />;
        if (name.includes('x')) return <img src="/assets/x.png" alt="X" className="w-6 h-6 object-contain" />;
        if (name.includes('facebook')) return <img src="/assets/facebook.png" alt="Facebook" className="w-6 h-6 object-contain" />;
        if (name.includes('linkedin')) return <img src="/assets/linkedin.png" alt="LinkedIn" className="w-6 h-6 object-contain" />;
        if (name.includes('gitlab')) return <img src="/assets/gitlab.png" alt="GitLab" className="w-6 h-6 object-contain" />;
        if (name.includes('atlassian') || name.includes('bitbucket')) return <img src="/assets/atlassian.svg" alt="Atlassian" className="w-6 h-6 object-contain" />;
        if (name.includes('ping')) return <img src="/assets/pingID.png" alt="Ping Identity" className="w-6 h-6 object-contain" />;
        if (name.includes('onelogin')) return <img src="/assets/onelogin.png" alt="OneLogin" className="w-6 h-6 object-contain" />;
        if (name.includes('slack')) return <img src="/assets/slack.png" alt="Slack" className="w-6 h-6 object-contain" />;
        if (name.includes('ory') || name.includes('hydra') || name.includes('polis')) return <img src="/assets/ory.png" alt="Ory" className="w-6 h-6 object-contain" />;
        if (name.includes('saml')) return <img src="/assets/saml.png" alt="SAML" className="w-6 h-6 object-contain" />;
        if (name.includes('openid') || name.includes('oidc') || name.includes('oauth')) return <img src="/assets/openid.png" alt="Openid" className="w-6 h-6 object-contain" />;

        return <></>;
    };

    return (
        <CardWrapper mascotIdle={!passwordFocused}>
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {t('signIn')}
                </h1>
                <p className="text-sm text-gray-500">
                    {t.rich('toContinueTo', {
                        name: clientName,
                        b: (chunks) => <span className="font-semibold text-gray-700">{chunks}</span>
                    })}
                </p>
                {tenantName !== 'Shyntr' && (
                    <div
                        className="mt-3 inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                        {t('at')} <span className="font-semibold ml-1 text-gray-800">{tenantName}</span>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {state.error && (
                    <Alert variant="destructive" className="bg-red-50 border-red-200 rounded-xl">
                        <AlertCircle className="h-4 w-4"/>
                        <AlertDescription className="text-sm">
                            {state.error === 'invalid_credentials' ? t('invalidCredentials') : state.error}
                        </AlertDescription>
                    </Alert>
                )}

                {passwordMethod && (
                    <form action={handleSubmit} className="space-y-4">
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
                                onFocus={handleUsernameFocus}
                                className="h-12 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-blue-500 text-base"
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
                                onFocus={handlePasswordFocus}
                                className="h-12 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-blue-500 text-base"
                            />
                        </div>

                        {/*<div className="flex items-center space-x-3">
                  <Checkbox
                      id="remember"
                      name="remember"
                      disabled={isPending}
                      className="h-5 w-5 border-gray-300 rounded data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer font-normal">
                    {t('rememberMe')}
                  </Label>
                </div>*/}

                        <div className="flex items-center justify-between pt-4">
                            <Button
                                type="submit"
                                className="w-full h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                        {t('signingIn')}
                                    </>
                                ) : (
                                    t('login')
                                )}
                            </Button>
                        </div>
                    </form>
                )}

                {passwordMethod && ssoMethods.length > 0 && (
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"/>
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
                                className="relative w-full h-12 text-sm font-medium border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-xl transition-all flex items-center justify-center"
                                onClick={() => handleSSORedirect(provider.login_url)}
                                disabled={isPending}
                            >
                                <div className="absolute left-4 flex items-center justify-center">
                                    {getProviderIcon(provider)}
                                </div>

                                <span>{t('signInWith', {name: provider.name})}</span>
                            </Button>
                        ))}

                        {!passwordMethod && (
                            <div className="flex items-center justify-center pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-4"
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
                    <Alert className="bg-yellow-50 border-yellow-200 rounded-xl">
                        <AlertCircle className="h-4 w-4 text-yellow-600"/>
                        <AlertDescription className="text-sm text-yellow-800 ml-2">
                            {t('noMethods')}
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </CardWrapper>
    );
}