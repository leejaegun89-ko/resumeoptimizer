'use client';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, DocumentData } from 'firebase/firestore';
import { db, deleteResumeOptimization } from '@/lib/firebase';
import { TrashIcon } from '@heroicons/react/24/outline';

interface CompanyDoc {
  id: string;
  companyName: string;
}

export default function Sidebar() {
  const [companies, setCompanies] = useState<CompanyDoc[]>([]);
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
        const docs: CompanyDoc[] = snapshot.docs.map(doc => ({
          id: doc.id,
          companyName: doc.data().companyName as string,
        })).filter(doc => doc.companyName);
        setCompanies(docs);
        setLoading(false);
      });
      return () => unsub();
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      await deleteResumeOptimization(id);
    }
  };

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
          {companies.map((company) => (
            <li key={company.id} className="bg-zinc-900 rounded-lg px-4 py-2 text-white font-medium border border-zinc-700 shadow flex items-center justify-between hover:bg-yellow-900/20 transition">
              <span>{company.companyName}</span>
              <button
                className="ml-2 p-1 rounded hover:bg-red-700/30 transition"
                title="Delete"
                onClick={() => handleDelete(company.id)}
              >
                <TrashIcon className="h-5 w-5 text-red-400" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
} 