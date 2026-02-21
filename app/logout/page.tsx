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
        <div className="mx-auto mb-6 w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {t('title')}
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          {t('message')}
        </p>
        <Link href="/login">
          <Button
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            {t('backToLogin')}
          </Button>
        </Link>
      </div>
    </CardWrapper>
  );
}
