import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('common');

  return (
    <footer className="mt-8 flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 text-sm">
        <a 
          href="#" 
          className="text-gray-500 hover:text-blue-600 hover:underline transition-colors cursor-pointer"
        >
          {t('help')}
        </a>
        <span className="text-gray-300">•</span>
        <a 
          href="#" 
          className="text-gray-500 hover:text-blue-600 hover:underline transition-colors cursor-pointer"
        >
          {t('privacy')}
        </a>
        <span className="text-gray-300">•</span>
        <a 
          href="#" 
          className="text-gray-500 hover:text-blue-600 hover:underline transition-colors cursor-pointer"
        >
          {t('terms')}
        </a>
      </div>
      <p className="text-xs text-gray-400">
        {t('poweredBy')} <span className="font-semibold text-gray-500">{t('shyntr')}</span>
      </p>
    </footer>
  );
}
