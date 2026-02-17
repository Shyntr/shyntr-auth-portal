import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function LogoutPage() {
  const t = await getTranslations('logout');

  return (
    <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          {t('title')}
        </CardTitle>
        <CardDescription className="text-gray-600 mt-2">
          {t('message')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <Link href="/login" className="w-full">
          <Button className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white">
            {t('backToLogin')}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
