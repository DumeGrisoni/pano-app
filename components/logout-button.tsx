'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export function LogoutButton({ size = 'sm' }: { size?: 'sm' | 'lg' | 'icon' }) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <Button size={size} onClick={logout}>
      <span className="hidden md:block">Déconnexion</span>
      <span className="block md:hidden">
        <LogOut />
      </span>
    </Button>
  );
}
