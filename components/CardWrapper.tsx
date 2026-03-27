import Image from 'next/image';
import { Footer } from './Footer';
import MascotDisplay from "@/components/mascot/MascotDisplay";

interface CardWrapperProps {
  children: React.ReactNode;
  showLogo?: boolean;
  mascotIdle?: boolean;
}

export function CardWrapper({ children, showLogo = true, mascotIdle = true }: CardWrapperProps) {
  return (
    <div className="w-full" style={{ maxWidth: '450px' }}>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-10">
        {showLogo && (
          <div className="flex justify-center mb-2">
              <div className="bg-gradient-to-b from-white-30/50 to-transparent">
                  <MascotDisplay password={!mascotIdle} />
              </div>
          </div>
        )}
        {children}
      </div>
      <Footer />
    </div>
  );
}
