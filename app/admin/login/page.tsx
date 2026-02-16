'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCog } from 'lucide-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
            localStorage.setItem('admin_session', 'true');
            router.replace('/admin');
        } else {
            alert('Incorrect password');
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center space-y-6">
                <div className="bg-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-purple-200 shadow-lg">
                    <UserCog className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Admin Login</h1>
                    <p className="text-slate-500 mt-2">Enter your password to access.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none text-lg"
                    />
                    <button
                        type="submit"
                        disabled={!password}
                        className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl transition-colors active:scale-[0.98] disabled:opacity-70"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
