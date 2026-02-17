import { useTranslations } from 'next-intl';
import { CardWrapper } from './CardWrapper';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function SessionExpired() {
  const t = useTranslations('common');

  return (
    <CardWrapper>
      <div className="text-center">
        <div className="mx-auto mb-6 w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {t('sessionExpired')}
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          {t('sessionExpiredDesc')}
        </p>
        <Link href="/">
          <Button 
            variant="outline" 
            className="w-full h-10 text-sm font-medium"
          >
            {t('backToApp')}
          </Button>
        </Link>
      </div>
    </CardWrapper>
  );
}
