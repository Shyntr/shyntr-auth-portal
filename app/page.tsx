import { CardWrapper } from '@/components/CardWrapper';
import { ChevronRight, LogIn, CheckSquare, LogOut, Info } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <CardWrapper>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Shyntr Auth Portal
        </h1>
        <p className="text-sm text-gray-500">
          Secure authentication portal for identity verification
        </p>
      </div>

      <p className="text-sm text-gray-500 text-center mb-6">
        This portal handles authentication flows. Use the links below to test:
      </p>
      
      <div className="space-y-3">
        <Link href="/login?login_challenge=test_challenge_123" className="block">
          <div className="group flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-white hover:border-blue-500 hover:bg-blue-50 hover:shadow-sm transition-all duration-200 cursor-pointer">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
              <LogIn className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Login Page</div>
              <div className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">User authentication flow</div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
        </Link>
        
        <Link href="/consent?consent_challenge=test_consent_456" className="block">
          <div className="group flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-white hover:border-blue-500 hover:bg-blue-50 hover:shadow-sm transition-all duration-200 cursor-pointer">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center transition-colors">
              <CheckSquare className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Consent Page</div>
              <div className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">Permission grant flow</div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
        </Link>
        
        <Link href="/logout" className="block">
          <div className="group flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-white hover:border-blue-500 hover:bg-blue-50 hover:shadow-sm transition-all duration-200 cursor-pointer">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors">
              <LogOut className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Logout Page</div>
              <div className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">Session termination</div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Demo Credentials - Info Alert Style */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 text-sm mb-2">Demo Credentials</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                <code className="font-mono bg-blue-100 px-2 py-0.5 rounded text-blue-900">admin</code>
                <span className="mx-2 text-blue-400">/</span>
                <code className="font-mono bg-blue-100 px-2 py-0.5 rounded text-blue-900">password</code>
              </p>
              <p>
                <code className="font-mono bg-blue-100 px-2 py-0.5 rounded text-blue-900">demo</code>
                <span className="mx-2 text-blue-400">/</span>
                <code className="font-mono bg-blue-100 px-2 py-0.5 rounded text-blue-900">demo123</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
}
