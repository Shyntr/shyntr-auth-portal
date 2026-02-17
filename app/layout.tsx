import './globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Footer } from '@/components/Footer';
import Image from 'next/image';

export const metadata = {
  title: 'Shyntr Auth Portal',
  description: 'Secure authentication portal powered by Shyntr',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);',
          }}
        />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
        <NextIntlClientProvider messages={messages}>
          <div className="min-h-screen flex flex-col">
            {/* Header with language switcher */}
            <header className="w-full p-4 flex justify-end">
              <LanguageSwitcher currentLocale={locale} />
            </header>

            {/* Main content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
              {/* Logo */}
              <div className="mb-8">
                <Image
                  src="https://customer-assets.emergentagent.com/job_shyntr-sso/artifacts/kzn1h3w2_mascot.png"
                  alt="Shyntr Logo"
                  width={120}
                  height={120}
                  className="drop-shadow-lg"
                  priority
                />
              </div>

              {children}

              <Footer />
            </main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
