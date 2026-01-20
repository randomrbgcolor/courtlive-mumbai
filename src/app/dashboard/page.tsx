
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import CustomerDashboard from '@/components/dashboard/CustomerDashboard';
import LogoutButton from '@/components/common/LogoutButton';

export default async function DashboardPage() {
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

  if (profile?.role === 'clerk') {
    redirect('/dashboard/clerk');
  } else if (profile?.role === 'admin') {
    redirect('/dashboard/admin');
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
        <LogoutButton />
      </div>
      <CustomerDashboard />
    </div>
  );
}