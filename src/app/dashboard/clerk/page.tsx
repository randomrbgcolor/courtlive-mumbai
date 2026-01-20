
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ClerkDashboard from '@/components/dashboard/ClerkDashboard';
import LogoutButton from '@/components/common/LogoutButton';

export default async function ClerkPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'clerk') {
    redirect('/dashboard');
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Clerk Dashboard</h1>
        <LogoutButton />
      </div>
      <ClerkDashboard />
    </div>
  );
}