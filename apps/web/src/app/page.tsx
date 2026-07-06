import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

/**
 * Root page: redirect to /dashboard if authenticated, /login if not.
 * This is a server component so the auth check happens on the server.
 */
export default async function RootPage() {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
