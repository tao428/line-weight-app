'use client';

import { useEffect, useState } from 'react';
import { useLiff } from '@/components/LiffProvider';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Loader2, User, UserCog } from 'lucide-react';

export default function Home() {
  const { liff, isLoggedIn, profile } = useLiff();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'register' | 'error' | 'login'>('loading');
  const [statusMessage, setStatusMessage] = useState('Initializing...');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Registration Form State
  const [role, setRole] = useState<'player' | 'admin'>('player');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If no LIFF ID is set, we might suffer indefinitely in loading state.
    // For local dev without LIFF, we might want a bypass.
    if (!process.env.NEXT_PUBLIC_LIFF_ID) {
      setStatusMessage('LIFF ID missing. Please configure .env.local');
      return;
    }

    if (!liff) return;

    if (!isLoggedIn) {
      setStatus('login');
      return;
    }

    if (!profile?.userId) return;

    // Prefill display name
    if (!displayName) {
      setDisplayName(profile.displayName);
    }

    const checkUser = async () => {
      setStatusMessage('Checking user profile...');
      try {
        const userRef = doc(db, 'users', profile.userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setStatusMessage('Redirecting...');
          if (userData.role === 'admin') {
            router.replace('/admin');
          } else {
            router.replace('/player');
          }
        } else {
          // New User
          setStatus('register');
        }
      } catch (error) {
        console.error(error);
        setStatusMessage('Failed to connect to database.');
        setStatus('error');
      }
    };

    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liff, isLoggedIn, profile, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.userId || !displayName) return;

    setIsSubmitting(true);
    try {
      const userRef = doc(db, 'users', profile.userId);
      await setDoc(userRef, {
        line_user_id: profile.userId,
        display_name: displayName,
        role: role,
        created_at: serverTimestamp(),
        // Initial setup
        target_weight: role === 'player' ? 60 : undefined, // Default
        height: role === 'player' ? 170 : undefined // Default
      });

      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/player');
      }
    } catch (e) {
      console.error(e);
      alert('Registration failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isMounted || status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <div className="flex flex-col items-center animate-pulse">
          <Loader2 className="h-12 w-12 animate-spin mb-4" />
          <h1 className="text-2xl font-bold mb-2">Weight Manager</h1>
          <p className="opacity-90">{statusMessage}</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-red-50">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-bold">Error</h2>
          <p>{statusMessage}</p>
        </div>
      </div>
    )
  }

  const [adminPassword, setAdminPassword] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      localStorage.setItem('admin_session', 'true');
      router.replace('/admin');
    } else {
      alert('Incorrect password');
    }
  };

  if (status === 'login') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center space-y-6">
          <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-indigo-200 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Please login to manage your team.</p>
          </div>

          <button
            onClick={() => liff?.login()}
            className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-100 active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#06C755] font-bold text-xs">L</span>
            </div>
            <span className="text-xl font-bold">LINE Login</span>
          </button>

          <div className="relative border-t border-gray-100 pt-6 mt-6">
            <p className="text-xs text-gray-400 uppercase font-bold mb-4">或者 (Or)</p>
            <form onSubmit={handleAdminLogin} className="space-y-3">
              <input
                type="password"
                placeholder="Admin Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-colors text-sm"
              >
                Admin Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Welcome!</h1>
          <p className="text-indigo-100 mt-2">Create your profile to get started.</p>
        </div>

        <form onSubmit={handleRegister} className="p-8 space-y-6">

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Display Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              placeholder="Your Name"
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">Select Role</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('player')}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                  role === 'player'
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-gray-100 hover:border-gray-200 text-gray-500"
                )}
              >
                <User className="w-8 h-8 mb-2" />
                <span className="font-semibold">Player</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                  role === 'admin'
                    ? "border-purple-600 bg-purple-50 text-purple-700"
                    : "border-gray-100 hover:border-gray-200 text-gray-500"
                )}
              >
                <UserCog className="w-8 h-8 mb-2" />
                <span className="font-semibold">Manager</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

