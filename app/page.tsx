import { CardWrapper } from '@/components/CardWrapper';
import { Button } from '@/components/ui/button';
import { Shield, LogIn, CheckSquare, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <CardWrapper>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Shyntr Auth Portal
        </h1>
        <p className="text-sm text-gray-600">
          Secure authentication portal for identity verification
        </p>
      </div>

      <p className="text-sm text-gray-500 text-center mb-6">
        This portal handles authentication flows. Use the links below to test:
      </p>
      
      <div className="space-y-3">
        <Link href="/login?login_challenge=test_challenge_123" className="block">
          <Button 
            variant="outline" 
            className="w-full h-12 justify-start gap-3 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
          >
            <LogIn className="h-5 w-5 text-blue-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Login Page</div>
              <div className="text-xs text-gray-500">User authentication flow</div>
            </div>
          </Button>
        </Link>
        
        <Link href="/consent?consent_challenge=test_consent_456" className="block">
          <Button 
            variant="outline" 
            className="w-full h-12 justify-start gap-3 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
          >
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Consent Page</div>
              <div className="text-xs text-gray-500">Permission grant flow</div>
            </div>
          </Button>
        </Link>
        
        <Link href="/logout" className="block">
          <Button 
            variant="outline" 
            className="w-full h-12 justify-start gap-3 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
          >
            <LogOut className="h-5 w-5 text-blue-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Logout Page</div>
              <div className="text-xs text-gray-500">Session termination</div>
            </div>
          </Button>
        </Link>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <h3 className="font-medium text-gray-800 text-sm mb-2">Demo Credentials</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">admin</code> / <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">password</code></p>
          <p><code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">demo</code> / <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">demo123</code></p>
        </div>
      </div>
    </CardWrapper>
  );
}
