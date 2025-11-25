
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
import { User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initiateGoogleSignIn } from '@/firebase/non-blocking-login';

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
  const { user, isUserLoading } = useUser();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    // When user state changes to authenticated, close the dialog.
    if (user && open) {
        setIsSigningIn(false);
        onOpenChange(false);
    }
    
    // When user state changes to authenticated and we have a firestore instance,
    // ensure their user document exists.
    if (user && firestore) {
      const checkAndCreateUser = async (currentUser: User) => {
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (!userDocSnap.exists()) {
            const userData = {
              id: currentUser.uid,
              displayName: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL,
              createdAt: serverTimestamp(),
            };
            // Use non-blocking write to avoid delaying UI. Errors are handled globally.
            setDocumentNonBlocking(userDocRef, userData, { merge: false });
          }
        } catch (error) {
          // This catch is for getDoc errors, which are less common.
          console.error("Error checking user document:", error);
        }
      };
      
      checkAndCreateUser(user);
    }
  }, [user, firestore, onOpenChange, open]);

  const handleGoogleSignIn = () => {
    if (!auth) return;
    setIsSigningIn(true);
    initiateGoogleSignIn(auth);
  };
  
  // Use isUserLoading from the central hook to reflect the initial auth state check.
  const isAuthInProgress = isSigningIn || isUserLoading;

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
            disabled={isAuthInProgress}
          >
            {isAuthInProgress ? (
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
