'use client';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Sidebar() {
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(true);
      if (!firebaseUser) {
        setCompanies([]);
        setLoading(false);
        return;
      }
      const q = query(
        collection(db, 'resumeOptimizations'),
        where('userId', '==', firebaseUser.uid),
        orderBy('createdAt', 'desc')
      );
      const unsub = onSnapshot(q, (snapshot) => {
        const names = snapshot.docs.map(doc => doc.data().companyName).filter(Boolean);
        setCompanies(names);
        setLoading(false);
      });
      return () => unsub();
    });
    return () => unsubscribe();
  }, []);

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-zinc-950/90 border-r border-zinc-800 shadow-xl z-30 flex flex-col p-6">
      <h2 className="text-xl font-bold text-yellow-300 mb-6 tracking-wide">My Applications</h2>
      {!user ? (
        <div className="text-zinc-400">Please sign in to track your application history</div>
      ) : loading ? (
        <div className="text-zinc-400">Loading...</div>
      ) : companies.length === 0 ? (
        <div className="text-zinc-500">No companies yet.</div>
      ) : (
        <ul className="space-y-3">
          {companies.map((name, idx) => (
            <li key={idx} className="bg-zinc-900 rounded-lg px-4 py-2 text-white font-medium border border-zinc-700 shadow hover:bg-yellow-900/20 transition cursor-pointer">
              {name}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
} 