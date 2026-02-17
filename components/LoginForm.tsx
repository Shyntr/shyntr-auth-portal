'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { handleLoginSubmit, handleLoginCancel, LoginFormState } from '@/actions/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, User, Lock } from 'lucide-react';

interface LoginFormProps {
  loginChallenge: string;
  tenantName: string;
  clientName: string;
}

export function LoginForm({ loginChallenge, tenantName, clientName }: LoginFormProps) {
  const t = useTranslations('login');

  // Bind the loginChallenge to the action
  const boundAction = handleLoginSubmit.bind(null, loginChallenge);
  const [state, formAction, isPending] = useActionState<LoginFormState, FormData>(boundAction, {});

  const handleCancel = async () => {
    await handleLoginCancel(loginChallenge);
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-gray-900">
          {t('signInTo')} <span className="text-orange-600">{tenantName}</span>
        </CardTitle>
        <CardDescription className="text-gray-600 mt-1">
          {t('toContinueTo')} <span className="font-medium text-gray-800">{clientName}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          {state.error && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {state.error === 'invalid_credentials' ? t('invalidCredentials') : state.error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-700 font-medium">
              {t('username')}
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="username"
                name="username"
                type="text"
                placeholder={t('enterUsername')}
                required
                disabled={isPending}
                className="pl-10 h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium">
              {t('password')}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={t('enterPassword')}
                required
                disabled={isPending}
                className="pl-10 h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="remember" name="remember" disabled={isPending} />
            <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
              {t('rememberMe')}
            </Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 border-gray-200 hover:bg-gray-50"
              onClick={handleCancel}
              disabled={isPending}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 bg-orange-600 hover:bg-orange-700 text-white"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('signingIn')}
                </>
              ) : (
                t('signIn')
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
