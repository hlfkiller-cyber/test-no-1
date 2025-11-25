
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.863 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
);


export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    // If sign-in was successful, close the dialog
    if (user && isSigningIn) {
        setIsSigningIn(false);
        onOpenChange(false);
    }
    
    // Check if the user document needs to be created
    if (user && firestore) {
      const checkAndCreateUser = async (user: User) => {
        const userDocRef = doc(firestore, 'users', user.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (!userDocSnap.exists()) {
            const userData = {
              id: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              createdAt: serverTimestamp(),
            };
            setDocumentNonBlocking(userDocRef, userData, { merge: false });
          }
        } catch (error) {
          console.error("Error checking or creating user document:", error);
        }
      };

      checkAndCreateUser(user);
    }
  }, [user, firestore, onOpenChange, isSigningIn]);

  const handleGoogleSignIn = async () => {
    if (!auth) return;

    setIsSigningIn(true);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      setIsSigningIn(false); // Reset on error
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Welcome Back</DialogTitle>
          <DialogDescription className="text-center">
            Sign in to save your ideas and access your history.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Button
            onClick={handleGoogleSignIn}
            className="w-full"
            disabled={isSigningIn}
          >
            {isSigningIn ? (
              <Loader2 className="animate-spin" />
            ) : (
                <>
                    <GoogleIcon />
                    Sign in with Google
                </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
