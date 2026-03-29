import { hasEnvVars } from '@/lib/utils';
import { redirect } from 'next/navigation';

export default function Home() {
  return hasEnvVars ? redirect('/protected') : redirect('/auth/login');
}
