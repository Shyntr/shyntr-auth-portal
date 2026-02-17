import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, LogIn, CheckSquare, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Card className="w-full max-w-lg shadow-xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-orange-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Shyntr Auth Portal
        </CardTitle>
        <CardDescription className="text-gray-600 mt-2">
          Secure authentication portal for identity verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 text-center pb-2">
          This portal handles authentication flows. Use the links below to test the available pages:
        </p>
        
        <div className="grid gap-3">
          <Link href="/login?login_challenge=test_challenge_123">
            <Button variant="outline" className="w-full h-12 justify-start gap-3 border-gray-200 hover:bg-orange-50 hover:border-orange-300">
              <LogIn className="h-5 w-5 text-orange-600" />
              <div className="text-left">
                <div className="font-medium">Login Page</div>
                <div className="text-xs text-gray-500">User authentication flow</div>
              </div>
            </Button>
          </Link>
          
          <Link href="/consent?consent_challenge=test_consent_456">
            <Button variant="outline" className="w-full h-12 justify-start gap-3 border-gray-200 hover:bg-orange-50 hover:border-orange-300">
              <CheckSquare className="h-5 w-5 text-orange-600" />
              <div className="text-left">
                <div className="font-medium">Consent Page</div>
                <div className="text-xs text-gray-500">Permission grant flow</div>
              </div>
            </Button>
          </Link>
          
          <Link href="/logout">
            <Button variant="outline" className="w-full h-12 justify-start gap-3 border-gray-200 hover:bg-orange-50 hover:border-orange-300">
              <LogOut className="h-5 w-5 text-orange-600" />
              <div className="text-left">
                <div className="font-medium">Logout Page</div>
                <div className="text-xs text-gray-500">Session termination</div>
              </div>
            </Button>
          </Link>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Demo Credentials</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-mono bg-gray-200 px-1 rounded">admin</span> / <span className="font-mono bg-gray-200 px-1 rounded">password</span></p>
            <p><span className="font-mono bg-gray-200 px-1 rounded">demo</span> / <span className="font-mono bg-gray-200 px-1 rounded">demo123</span></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
