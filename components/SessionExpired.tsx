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
        <div className="mx-auto mb-6 w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {t('sessionExpired')}
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          {t('sessionExpiredDesc')}
        </p>
        <Link href="/">
          <Button 
            variant="outline" 
            className="w-full h-11 text-sm font-semibold rounded-xl border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-all"
          >
            {t('backToApp')}
          </Button>
        </Link>
      </div>
    </CardWrapper>
  );
}
