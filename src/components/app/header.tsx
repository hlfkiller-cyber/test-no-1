import { Video } from 'lucide-react';
import { UserProfileButton } from '@/components/app/user-profile-button';
import Link from 'next/link';

export function Header() {
  return (
    <header className="py-4 md:py-6 bg-card/50 border-b">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center justify-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Video className="h-8 w-8 text-primary" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground sm:text-5xl font-headline">
              Nitish Ideas
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 hidden sm:block">
              Ignite your next viral video idea with the power of AI.
            </p>
          </div>
        </Link>
        <UserProfileButton />
      </div>
    </header>
  );
}
