import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('common');

  return (
    <footer className="mt-6 flex flex-col items-center gap-3">
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <a href="#" className="hover:text-gray-700 transition-colors">
          {t('help')}
        </a>
        <a href="#" className="hover:text-gray-700 transition-colors">
          {t('privacy')}
        </a>
        <a href="#" className="hover:text-gray-700 transition-colors">
          {t('terms')}
        </a>
      </div>
      <p className="text-xs text-gray-400">
        {t('poweredBy')} <span className="font-medium text-gray-500">{t('shyntr')}</span>
      </p>
    </footer>
  );
}
