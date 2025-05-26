'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/'); // On success, go to home
    } catch (err: any) {
      setError('Failed to sign up. Try a different email or stronger password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black bg-gradient-to-b from-black via-[#0a0a23] to-black">
      <div className="rounded-3xl bg-zinc-900/80 shadow-2xl border border-zinc-800 p-8 backdrop-blur-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Sign Up</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            className="w-full px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white focus:border-yellow-400 focus:ring-yellow-400 placeholder:text-zinc-400 transition"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white focus:border-yellow-400 focus:ring-yellow-400 placeholder:text-zinc-400 transition"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 text-black font-bold shadow-lg hover:from-yellow-400 hover:to-yellow-300 transition"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-zinc-300">Already have an account? </span>
          <button
            className="text-yellow-400 hover:underline"
            onClick={() => router.push('/login')}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
} 