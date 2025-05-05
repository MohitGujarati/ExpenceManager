
"use client";

import * as React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


export function LogoutButton() {
    const { toast } = useToast();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast({
                title: "Logout Successful",
                description: "You have been logged out.",
            });
        } catch (error) {
            console.error("Error signing out:", error);
            toast({
                 title: "Logout Failed",
                 description: "Could not log out. Please try again.",
                 variant: "destructive",
            });
        }
    };

    return (
        <Button onClick={handleLogout} variant="ghost" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
    );
}
