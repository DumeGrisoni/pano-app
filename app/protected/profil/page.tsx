import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
const Profil = () => {
  async function UserDetails() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
      redirect('/auth/login');
    }
    const { name, email, role } = data.claims;
    return (
      <div>
        <h2 className="font-bold text-2xl mb-4">Details utilisateur</h2>
        <p>Name : {name}</p>
        <p>Email : {email}</p>
        <p>Role : {role}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Details utilisateur</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          <Suspense>
            <UserDetails />
          </Suspense>
        </pre>
      </div>
    </div>
  );
};

export default Profil;
