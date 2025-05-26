'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { onAuthStateChanged, signOut, updateEmail, updatePassword, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setEmail(user?.email || '');
    });
    return () => unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
        setEditMode(false);
        setError('');
      }
    }
    if (showProfile) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showProfile]);

  const handleSignOut = async () => {
    await signOut(auth);
    setShowProfile(false);
    setEditMode(false);
    setError('');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (user && email !== (user.email || '')) {
        await updateEmail(user, email);
      }
      if (user && password) {
        await updatePassword(user, password);
      }
      setEditMode(false);
      setPassword('');
    } catch (err) {
      setError('Failed to update. Try a different email or stronger password.');
    }
  };

  return (
    <div className="w-full flex justify-end items-center mb-6 relative z-20">
      {!user ? (
        <button
          className="backdrop-blur-md bg-white/10 border border-zinc-700 text-white px-6 py-2 rounded-xl shadow-lg hover:bg-white/20 hover:border-yellow-400 transition font-semibold text-base tracking-wide"
          onClick={() => router.push('/login')}
        >
          Sign In
        </button>
      ) : (
        <div className="relative" ref={profileRef}>
          <button
            className="backdrop-blur-md bg-white/10 border border-yellow-400 text-yellow-300 px-6 py-2 rounded-xl shadow-lg hover:bg-yellow-400/20 hover:border-yellow-300 transition font-semibold text-base tracking-wide"
            onClick={() => setShowProfile((v) => !v)}
          >
            Profile
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-zinc-900/95 border border-zinc-700 shadow-2xl p-6 backdrop-blur-xl flex flex-col gap-4">
              {!editMode ? (
                <>
                  <div className="text-white text-lg font-semibold mb-2">Profile</div>
                  <div className="text-zinc-300 text-base mb-4 break-all">{user.email}</div>
                  <button
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 text-black font-bold shadow-lg hover:from-yellow-400 hover:to-yellow-300 transition mb-2"
                    onClick={() => setEditMode(true)}
                  >
                    Edit
                  </button>
                  <button
                    className="w-full py-2 rounded-lg bg-zinc-800 text-zinc-200 font-semibold border border-zinc-700 hover:bg-zinc-700 transition"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <form onSubmit={handleEdit} className="flex flex-col gap-3">
                  <label className="text-zinc-300 text-sm">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white focus:border-yellow-400 focus:ring-yellow-400 placeholder:text-zinc-400 transition"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <label className="text-zinc-300 text-sm">New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white focus:border-yellow-400 focus:ring-yellow-400 placeholder:text-zinc-400 transition"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                  />
                  {error && <div className="text-red-400 text-sm text-center">{error}</div>}
                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-lg bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 text-black font-bold shadow-lg hover:from-yellow-400 hover:to-yellow-300 transition"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="flex-1 py-2 rounded-lg bg-zinc-800 text-zinc-200 font-semibold border border-zinc-700 hover:bg-zinc-700 transition"
                      onClick={() => { setEditMode(false); setError(''); setPassword(''); setEmail(user?.email || ''); }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 