import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to dashboard (mock auth is enabled by default)
  redirect('/dashboard');
}
