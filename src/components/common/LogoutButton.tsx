
'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition"
    >
      Logout
    </button>
  );
}