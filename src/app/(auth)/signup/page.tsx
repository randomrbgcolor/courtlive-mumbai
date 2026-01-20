
import SignupForm from '@/components/auth/SignupForm';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Account</h1>
      <SignupForm />
      <p className="text-center text-gray-600 mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
          Log in
        </Link>
      </p>
    </div>
  );
}