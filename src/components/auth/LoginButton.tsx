
"use client";

import * as React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react'; // Or a Google Icon if preferred
import { useToast } from '@/hooks/use-toast';

export function LoginButton() {
  const { toast } = useToast();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
       toast({
          title: "Login Successful",
          description: "You have successfully logged in.",
       });
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
      toast({
          title: "Login Failed",
          description: "Could not log in with Google. Please try again.",
          variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handleLogin} variant="outline" size="sm">
      <LogIn className="mr-2 h-4 w-4" />
      Login with Google
    </Button>
  );
}
