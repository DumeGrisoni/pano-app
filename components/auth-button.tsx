import Link from 'next/link';
import { Button } from './ui/button';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from './logout-button';
import { ThemeSwitcher } from './theme-switcher';
import CartPopUp from './CartPopup';

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex items-center justify-between mx-auto  gap-2 md:gap-8 w-full">
      <span className="md:ml-auto font-semibold">
        Bonjour,{' '}
        {user.user_metadata?.displayName
          ? user.user_metadata.displayName
          : user.email}
      </span>
      <div className="flex ml-auto items-center md:justify-center gap-3">
        <CartPopUp />
        <div className="md:block hidden">
          <LogoutButton />
        </div>
        <div className="md:hidden block">
          <LogoutButton size="icon" />
        </div>

        <ThemeSwitcher />
      </div>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={'outline'}>
        <Link href="/auth/login">Connexion</Link>
      </Button>
      <Button asChild size="sm" variant={'default'}>
        <Link href="/auth/sign-up">Inscription</Link>
      </Button>
    </div>
  );
}
