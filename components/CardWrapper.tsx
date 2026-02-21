import Image from 'next/image';
import { Footer } from './Footer';

interface CardWrapperProps {
  children: React.ReactNode;
  showLogo?: boolean;
}

export function CardWrapper({ children, showLogo = true }: CardWrapperProps) {
  return (
    <div className="w-full" style={{ maxWidth: '450px' }}>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
        {showLogo && (
          <div className="flex justify-center mb-8">
            <Image
              src="/mascot.png"
              alt="Shyntr"
              width={56}
              height={56}
              className="h-14 w-auto drop-shadow-md"
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
