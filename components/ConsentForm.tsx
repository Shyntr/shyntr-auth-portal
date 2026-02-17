'use client';

import { useActionState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { handleConsentAccept, handleConsentDeny, ConsentFormState } from '@/actions/auth';
import { CardWrapper } from './CardWrapper';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, User, Shield, Mail, RefreshCw, MapPin, Phone } from 'lucide-react';

interface ConsentFormProps {
  consentChallenge: string;
  tenantName: string;
  clientName: string;
  requestedScopes: string[];
  userSubject?: string;
}

const SCOPE_ICONS: Record<string, React.ReactNode> = {
  openid: <Shield className="w-4 h-4 text-gray-500" />,
  profile: <User className="w-4 h-4 text-gray-500" />,
  email: <Mail className="w-4 h-4 text-gray-500" />,
  offline_access: <RefreshCw className="w-4 h-4 text-gray-500" />,
  address: <MapPin className="w-4 h-4 text-gray-500" />,
  phone: <Phone className="w-4 h-4 text-gray-500" />,
};

export function ConsentForm({ 
  consentChallenge, 
  tenantName, 
  clientName, 
  requestedScopes,
  userSubject 
}: ConsentFormProps) {
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
    <CardWrapper>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {t('accessRequest')}
        </h1>
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{clientName}</span>{' '}
          {t('wantsAccess')}
        </p>
      </div>

      {/* User Profile Chip */}
      {userSubject && (
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-200">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm text-gray-700 font-medium">{userSubject}</span>
          </div>
        </div>
      )}

      <form action={formAction} className="space-y-5">
        {state.error && (
          <Alert variant="destructive" className="bg-red-50 border-red-100">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{state.error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-700 mb-3">
            {t('selectPermissions')}
          </p>
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
            {requestedScopes.map((scope) => (
              <div
                key={scope}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  id={`scope_${scope}`}
                  name={`scope_${scope}`}
                  defaultChecked
                  disabled={isProcessing}
                  className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label
                  htmlFor={`scope_${scope}`}
                  className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer flex-1"
                >
                  {SCOPE_ICONS[scope] || <Shield className="w-4 h-4 text-gray-500" />}
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
          <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer font-normal">
            {t('rememberDecision')}
          </Label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="h-10 px-6 text-sm font-medium border-gray-300 text-gray-700 hover:bg-gray-50"
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
            className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
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
