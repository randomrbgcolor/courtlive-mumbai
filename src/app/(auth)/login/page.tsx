
import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Login</h1>
      <LoginForm />
      <p className="text-center text-gray-600 mt-4">
        Don't have an account?{' '}
        <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
          Sign up
        </Link>
      </p>
    </div>
  );
}