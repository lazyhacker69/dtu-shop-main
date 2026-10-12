// components/auth/SignOutButton.tsx
'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function SignOutButton() {
  const handleSignOut = () => {
    signOut({
      callbackUrl: '/',
      redirect: true,
    });
  };

  return (
    <Button 
      onClick={handleSignOut}
      variant="outline"
    >
      Sign Out
    </Button>
  );
}
