import { redirect } from 'next/navigation';

export default function Home() {
  // Check if mock auth is enabled
  const isMockAuth = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';

  // Redirect based on auth mode
  // If mock auth: go to dashboard
  // If real auth: middleware will handle redirect to login if not authenticated
  redirect(isMockAuth ? '/dashboard' : '/dashboard');
}
