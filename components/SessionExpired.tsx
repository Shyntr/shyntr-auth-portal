import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function SessionExpired() {
  const t = useTranslations('common');

  return (
    <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          {t('sessionExpired')}
        </CardTitle>
        <CardDescription className="text-gray-600 mt-2">
          {t('sessionExpiredDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <Link href="/" className="w-full">
          <Button variant="outline" className="w-full">
            {t('backToApp')}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
