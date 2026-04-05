import { EnvVarWarning } from '@/components/env-var-warning';
import { AuthButton } from '@/components/auth-button';
import { hasEnvVars } from '@/lib/utils';
import Link from 'next/link';
import { Suspense } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar/Navbar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-[8vh] bg-background fixed">
          <div className="w-full flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex mr-6 md:mr-0 gap-5 items-center justify-center ">
              <Image
                src="/images/logo.svg"
                alt="Pano Bastia Logo"
                width={40}
                height={40}
              />
              <Link
                href={'/'}
                className="hover:text-red-500 font-semibold transition-all duration-300 ease-in-out hidden md:block"
              >
                Pano Bastia
              </Link>
            </div>
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
          <Suspense fallback={<div>Chargement...</div>}>
            <Navbar />
          </Suspense>
        </nav>
        <div className="flex-1 flex flex-col gap-20 md:max-w-5xl p-5 mt-20 md:mt-32 md:ml-40">
          {children}
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 ">
          <p className="flex items-center justify-center gap-3">
            Réaliser par{' '}
          </p>
          <Link
            href="https://vista-studio.vercel.app/dev-web"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            <div className="relative w-20 h-20">
              <Image
                src="/images/vistalogo.svg"
                alt="Vista Studio"
                fill
                className="object-contain dark:invert hover:dark:invert-0 transition-all duration-200"
                loading="eager"
              />
            </div>
          </Link>
        </footer>
      </div>
    </main>
  );
}
