'use client';

import { useTransition } from 'react';
import { useFormState } from 'react-dom';
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
  openid: <Shield className="w-5 h-5 text-blue-600" />,
  profile: <User className="w-5 h-5 text-purple-600" />,
  email: <Mail className="w-5 h-5 text-green-600" />,
  offline_access: <RefreshCw className="w-5 h-5 text-orange-600" />,
  address: <MapPin className="w-5 h-5 text-red-600" />,
  phone: <Phone className="w-5 h-5 text-teal-600" />,
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
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('accessRequest')}
        </h1>
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-700">{clientName}</span>{' '}
          {t('wantsAccess')}
        </p>
      </div>

      {/* User Profile Chip */}
      {userSubject && (
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-700 font-medium">{userSubject}</span>
          </div>
        </div>
      )}

      <form action={handleSubmit} className="space-y-6">
        {state.error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 rounded-xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{state.error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 mb-3">
            {t('selectPermissions')}
          </p>
          <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
            {requestedScopes.map((scope) => (
              <div
                key={scope}
                className="flex items-center gap-4 p-4 bg-white hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  id={`scope_${scope}`}
                  name={`scope_${scope}`}
                  defaultChecked
                  disabled={isProcessing}
                  className="h-5 w-5 border-gray-300 rounded data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label
                  htmlFor={`scope_${scope}`}
                  className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer flex-1"
                >
                  <div className="flex-shrink-0 w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                    {SCOPE_ICONS[scope] || <Shield className="w-5 h-5 text-gray-500" />}
                  </div>
                  <span className="font-medium">{scopeT(scope as keyof typeof scopeT) || scope}</span>
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3 py-2">
          <Checkbox
            id="remember"
            name="remember"
            disabled={isProcessing}
            className="h-5 w-5 border-gray-300 rounded"
          />
          <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer font-normal">
            {t('rememberDecision')}
          </Label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="h-11 px-6 text-sm font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 rounded-xl transition-all"
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
            className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all"
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
