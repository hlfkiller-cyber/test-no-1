import { Video } from 'lucide-react';
import { UserProfileButton } from '@/components/app/user-profile-button';
import Link from 'next/link';

export function Header() {
  return (
    <header className="py-4 md:py-6 bg-card/50 border-b">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <Link href="/">
            <div className="p-2 sm:p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Video className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
          </Link>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-x-2 flex-wrap">
              <Link href="/">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-foreground">
                  Video Ideas
                </h1>
              </Link>
              <span className="text-base sm:text-lg md:text-xl text-muted-foreground font-normal">
                by Nitish
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 hidden sm:block">
              Ignite your next viral video idea with the power of AI.
            </p>
          </div>
        </div>
        <UserProfileButton />
      </div>
    </header>
  );
}
