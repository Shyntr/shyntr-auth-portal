'use client';

import type { ReactNode } from 'react';
import { useTransition } from 'react';
import { useFormState } from 'react-dom';
import { useTranslations } from 'next-intl';
import { AlertCircle, Loader2, Mail, MapPin, Phone, RefreshCw, Shield, User } from 'lucide-react';
import { ConsentFormState, handleConsentAccept, handleConsentDeny } from '@/actions/auth';
import { CardWrapper } from './CardWrapper';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConsentFormProps {
  consentChallenge: string;
  tenantName: string;
  clientName: string;
  requestedScopes: string[];
  requestedAudience: string[];
  userSubject?: string;
}

const SCOPE_ICONS: Record<string, ReactNode> = {
  openid: <Shield className="h-5 w-5 text-blue-600" />,
  profile: <User className="h-5 w-5 text-purple-600" />,
  email: <Mail className="h-5 w-5 text-green-600" />,
  offline_access: <RefreshCw className="h-5 w-5 text-orange-600" />,
  address: <MapPin className="h-5 w-5 text-red-600" />,
  phone: <Phone className="h-5 w-5 text-teal-600" />,
  test: <User className="h-5 w-5 text-purple-600" />,
  custom: <Shield className="h-5 w-5 text-teal-600" />,
};

export function ConsentForm({
  consentChallenge,
  tenantName,
  clientName,
  requestedScopes,
  requestedAudience,
  userSubject,
}: ConsentFormProps) {
  const t = useTranslations('consent');
  const scopeT = useTranslations('consent.scopes');
  const boundAction = handleConsentAccept.bind(null, consentChallenge);
  const [state, formAction] = useFormState(boundAction, {});
  const [isPending, startTransition] = useTransition();
  const [isDenying, startDenyTransition] = useTransition();

  const handleSubmit = (payload: FormData) => {
    startTransition(() => {
      formAction(payload);
    });
  };

  const handleDeny = () => {
    startDenyTransition(async () => {
      await handleConsentDeny(consentChallenge);
    });
  };

  const isProcessing = isPending || isDenying;

  return (
    <CardWrapper>
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">{t('accessRequest')}</h1>
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-700">{clientName}</span> {t('wantsAccess')}
        </p>
        {tenantName !== 'Shyntr' && (
          <div className="mt-3 inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">
            {tenantName}
          </div>
        )}
      </div>

      {userSubject && (
        <div className="mb-6 flex items-center justify-center">
          <div className="inline-flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">{userSubject}</span>
          </div>
        </div>
      )}

      <form action={handleSubmit} className="space-y-6">
        {state.error && (
          <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{state.error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <p className="mb-3 text-sm font-medium text-gray-700">{t('selectPermissions')}</p>
          <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
            {requestedScopes.map((scope) => (
              <div
                key={scope}
                className="flex items-center gap-4 bg-white p-4 transition-colors hover:bg-gray-50"
              >
                <Checkbox
                  id={`scope_${scope}`}
                  name={`scope_${scope}`}
                  defaultChecked
                  disabled={isProcessing}
                  className="h-5 w-5 rounded border-gray-300 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                />
                <Label
                  htmlFor={`scope_${scope}`}
                  className="flex flex-1 cursor-pointer items-center gap-3 text-sm text-gray-700"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    {SCOPE_ICONS[scope] || <Shield className="h-5 w-5 text-gray-500" />}
                  </div>
                  <span className="font-medium">{scopeT(scope as any) || scope}</span>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {requestedAudience.length > 0 && (
          <div className="space-y-2">
            <p className="mb-3 text-sm font-medium text-gray-700">Requested audiences</p>
            <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
              {requestedAudience.map((audience) => (
                <div
                  key={audience}
                  className="flex items-center gap-4 bg-white p-4 transition-colors hover:bg-gray-50"
                >
                  <Checkbox
                    id={`audience_${audience}`}
                    name={`audience_${audience}`}
                    defaultChecked
                    disabled={isProcessing}
                    className="h-5 w-5 rounded border-gray-300 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                  />
                  <Label
                    htmlFor={`audience_${audience}`}
                    className="flex flex-1 cursor-pointer items-center gap-3 text-sm text-gray-700"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      <Shield className="h-5 w-5 text-gray-500" />
                    </div>
                    <span className="font-medium">{audience}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-3 py-2">
          <Checkbox
            id="remember"
            name="remember"
            disabled={isProcessing}
            className="h-5 w-5 rounded border-gray-300"
          />
          <Label htmlFor="remember" className="cursor-pointer text-sm font-normal text-gray-600">
            {t('rememberDecision')}
          </Label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl border-gray-300 px-6 text-sm font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-100"
            onClick={handleDeny}
            disabled={isProcessing}
          >
            {isDenying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('processing')}
              </>
            ) : (
              t('cancel')
            )}
          </Button>
          <Button
            type="submit"
            className="h-11 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
            disabled={isProcessing}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('processing')}
              </>
            ) : (
              t('allow')
            )}
          </Button>
        </div>
      </form>
    </CardWrapper>
  );
}
