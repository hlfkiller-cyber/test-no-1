'use client';

import { useState } from 'react';
import { useUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogIn, LogOut, Loader2, User as UserIcon } from 'lucide-react';
import { LoginDialog } from './login-dialog';

export function UserProfileButton() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
    }
  };

  if (isUserLoading) {
    return <Loader2 className="animate-spin" />;
  }

  if (!user) {
    return (
      <>
        <Button variant="outline" onClick={() => setIsLoginDialogOpen(true)}>
          <LogIn className="mr-2" />
          Login
        </Button>
        <LoginDialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen} />
      </>
    );
  }

  const userInitial = user.displayName?.charAt(0).toUpperCase() || <UserIcon />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
