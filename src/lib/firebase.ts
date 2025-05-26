// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: "https://resumebuilder-backend-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

export async function saveResumeResult(userId: string, optimizedBullets: string[]) {
  console.log('Firestore 저장 시도!');
  await addDoc(collection(db, 'resumeResults'), {
    userId,
    optimizedBullets,
    createdAt: new Date()
  });
}

export async function saveResumeOptimization({
  userId,
  userEmail,
  jobDescription,
  companyWebsite,
  companyName,
  originalBullets,
  optimizedBullets,
  fileName,
}: {
  userId: string;
  userEmail: string;
  jobDescription: string;
  companyWebsite?: string;
  companyName: string;
  originalBullets: string[];
  optimizedBullets: string[];
  fileName: string;
}) {
  await addDoc(collection(db, 'resumeOptimizations'), {
    userId,
    userEmail,
    jobDescription,
    companyWebsite,
    companyName,
    originalBullets,
    optimizedBullets,
    fileName,
    createdAt: new Date(),
  });
} 