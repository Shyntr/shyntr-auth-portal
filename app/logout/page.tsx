import { getTranslations } from 'next-intl/server';
import { CardWrapper } from '@/components/CardWrapper';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default async function LogoutPage() {
  const t = await getTranslations('logout');

  return (
    <CardWrapper>
      <div className="text-center">
        <div className="mx-auto mb-6 w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
          <CheckCircle className="w-7 h-7 text-green-500" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {t('title')}
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          {t('message')}
        </p>
        <Link href="/login">
          <Button 
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
          >
            {t('backToLogin')}
          </Button>
        </Link>
      </div>
    </CardWrapper>
  );
}
