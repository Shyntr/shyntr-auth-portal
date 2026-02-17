import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('common');

  return (
    <footer className="mt-8 text-center text-sm text-gray-500">
      <p>
        {t('poweredBy')} <span className="font-semibold text-orange-600">{t('shyntr')}</span>
      </p>
    </footer>
  );
}
