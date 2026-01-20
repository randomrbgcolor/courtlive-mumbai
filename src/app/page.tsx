
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'clerk') {
      redirect('/dashboard/clerk');
    } else if (profile?.role === 'admin') {
      redirect('/dashboard/admin');
    } else {
      redirect('/dashboard');
    }
  }

  return (
    <div className="text-center py-12">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to CourtLive Mumbai
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Track live case status across Mumbai courts in real-time
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
