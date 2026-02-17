'use client';

import { useActionState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { handleConsentAccept, handleConsentDeny, ConsentFormState } from '@/actions/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Shield, Check } from 'lucide-react';

interface ConsentFormProps {
  consentChallenge: string;
  tenantName: string;
  clientName: string;
  requestedScopes: string[];
}

const SCOPE_ICONS: Record<string, string> = {
  openid: '🔑',
  profile: '👤',
  email: '✉️',
  offline_access: '🔄',
  address: '🏠',
  phone: '📱',
};

export function ConsentForm({ consentChallenge, tenantName, clientName, requestedScopes }: ConsentFormProps) {
  const t = useTranslations('consent');
  const scopeT = useTranslations('consent.scopes');

  const boundAction = handleConsentAccept.bind(null, consentChallenge);
  const [state, formAction, isPending] = useActionState<ConsentFormState, FormData>(boundAction, {});
  const [isDenying, startDenyTransition] = useTransition();

  const handleDeny = () => {
    startDenyTransition(async () => {
      await handleConsentDeny(consentChallenge);
    });
  };

  const isProcessing = isPending || isDenying;

  return (
    <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-orange-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          {t('accessRequest')}
        </CardTitle>
        <CardDescription className="text-gray-600 mt-2">
          <span className="font-semibold text-gray-800">{clientName}</span>{' '}
          {t('wantsAccess')}{' '}
          <span className="font-semibold text-orange-600">{tenantName}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          {state.error && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">{t('selectPermissions')}</p>
            <div className="space-y-2 bg-gray-50 rounded-lg p-4">
              {requestedScopes.map((scope) => (
                <div
                  key={scope}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-white transition-colors"
                >
                  <Checkbox
                    id={`scope_${scope}`}
                    name={`scope_${scope}`}
                    defaultChecked
                    disabled={isProcessing}
                    className="border-gray-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                  />
                  <Label
                    htmlFor={`scope_${scope}`}
                    className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer flex-1"
                  >
                    <span className="text-lg">{SCOPE_ICONS[scope] || '📋'}</span>
                    <span>{scopeT(scope as keyof typeof scopeT) || scope}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 py-2">
            <Checkbox
              id="remember"
              name="remember"
              disabled={isProcessing}
              className="border-gray-300"
            />
            <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
              {t('rememberDecision')}
            </Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleDeny}
              disabled={isProcessing}
            >
              {isDenying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('processing')}
                </>
              ) : (
                t('deny')
              )}
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 bg-orange-600 hover:bg-orange-700 text-white"
              disabled={isProcessing}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('processing')}
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {t('allow')}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
