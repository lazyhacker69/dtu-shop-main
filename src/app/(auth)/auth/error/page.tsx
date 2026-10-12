// app/auth/error/page.tsx
"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'Access denied. You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      case 'Default':
        return 'An error occurred during authentication.';
      case 'CredentialsSignin':
        return 'Invalid email or password. Please check your credentials.';
      case 'EmailCreateAccount':
        return 'Could not create account with this email.';
      case 'OAuthAccountNotLinked':
        return 'This email is already associated with another account. Please sign in with your original method.';
      case 'EmailSignin':
        return 'Unable to send email. Please try again.';
      case 'SessionRequired':
        return 'Please sign in to access this page.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const getErrorTitle = (error: string | null) => {
    switch (error) {
      case 'AccessDenied':
        return 'Access Denied';
      case 'Verification':
        return 'Verification Failed';
      case 'CredentialsSignin':
        return 'Sign In Failed';
      case 'OAuthAccountNotLinked':
        return 'Account Linking Error';
      default:
        return 'Authentication Error';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {getErrorTitle(error)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600">
              {getErrorMessage(error)}
            </p>
            {error && (
              <p className="text-xs text-gray-400 mt-2">
                Error code: {error}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Link href="/auth/signin" className="w-full">
              <Button className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </Link>
            
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          {error === 'OAuthAccountNotLinked' && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> If you previously signed up with email and password, 
                please use that method to sign in.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorPageFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-gray-600">Loading error details...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<ErrorPageFallback />}>
      <ErrorContent />
    </Suspense>
  );
}
