'use client';

import { useFormState } from 'react-dom';
import { useTranslations } from 'next-intl';
import { handleLoginSubmit, handleLoginCancel, LoginFormState } from '@/actions/auth';
import { CardWrapper } from './CardWrapper';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { useTransition } from "react";
import { AuthMethod } from "@/lib/shyntr-api";

interface LoginFormProps {
  loginChallenge: string;
  tenantName: string;
  clientName: string;
  methods: AuthMethod[];
}

export function LoginForm({ loginChallenge, tenantName, clientName, methods }: LoginFormProps) {
  const t = useTranslations('login');

  const boundAction = handleLoginSubmit.bind(null, loginChallenge);
  const [state, formAction] = useFormState(boundAction, {});
  const [isPending, startTransition] = useTransition();

  const passwordMethod = methods.find((m) => m.type === "password");
  const ssoMethods = methods.filter((m) => m.type !== "password");

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

  return (
      <CardWrapper>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('signIn')}
          </h1>
          <p className="text-sm text-gray-500">
            {t('toContinueTo')} <span className="font-semibold text-gray-700">{clientName}</span>
          </p>
          {tenantName !== 'Shyntr' && (
              <div className="mt-3 inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                {t('at')} <span className="font-semibold ml-1 text-gray-800">{tenantName}</span>
              </div>
          )}
        </div>

        <div className="space-y-6">
          {state.error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {state.error === 'invalid_credentials' ? t('invalidCredentials') : state.error}
                </AlertDescription>
              </Alert>
          )}

          {passwordMethod && (
              <form action={handleSubmit} className="space-y-6">
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
                      className="h-12 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-blue-500 text-base"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                      id="remember"
                      name="remember"
                      disabled={isPending}
                      className="h-5 w-5 border-gray-300 rounded data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer font-normal">
                    {t('rememberMe')}
                  </Label>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button
                      type="button"
                      variant="ghost"
                      className="text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-4"
                      onClick={handleCancel}
                      disabled={isPending}
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                      type="submit"
                      className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all"
                      disabled={isPending}
                  >
                    {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('signingIn')}
                        </>
                    ) : (
                        t('next')
                    )}
                  </Button>
                </div>
              </form>
          )}

          {passwordMethod && ssoMethods.length > 0 && (
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">veya</span>
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
                        className="w-full h-12 text-sm font-medium border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-xl transition-all"
                        onClick={() => handleSSORedirect(provider.login_url)}
                        disabled={isPending}
                    >
                      {provider.name} ile {t('signIn')}
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
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-sm text-yellow-800 ml-2">
                  Bu uygulama/tenant için tanımlanmış bir giriş yöntemi bulunamadı.
                </AlertDescription>
              </Alert>
          )}
        </div>
      </CardWrapper>
  );
}