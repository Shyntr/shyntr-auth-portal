import Image from 'next/image';
import { Footer } from './Footer';

interface CardWrapperProps {
  children: React.ReactNode;
  showLogo?: boolean;
}

export function CardWrapper({ children, showLogo = true }: CardWrapperProps) {
  return (
    <div className="w-full max-w-[450px]">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10">
        {showLogo && (
          <div className="flex justify-center mb-6">
            <Image
              src="https://customer-assets.emergentagent.com/job_shyntr-sso/artifacts/kzn1h3w2_mascot.png"
              alt="Shyntr"
              width={48}
              height={48}
              className="h-12 w-auto"
              priority
            />
          </div>
        )}
        {children}
      </div>
      <Footer />
    </div>
  );
}
