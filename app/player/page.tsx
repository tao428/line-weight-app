'use client';

import { useEffect, useState } from 'react';
import { useLiff } from '@/components/LiffProvider';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { WeightChart } from '@/components/WeightChart';
import { cn } from '@/lib/utils';

type UserData = {
    display_name: string;
    target_weight: number;
    height: number;
    role: string;
};

type WeightLog = {
    id: string;
    userId: string;
    weight: number;
    date: string;       // YYYY-MM-DD
    timestamp: string;  // ISO
};

export default function PlayerPage() {
    const { liff, isLoggedIn, profile } = useLiff();
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [logs, setLogs] = useState<WeightLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Input State
    const [inputWeight, setInputWeight] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        if (!profile?.userId) return;
        setLoading(true);
        try {
            // 1. Fetch User Profile
            const userRes = await fetch(`/api/users/${profile.userId}`);
            if (userRes.ok) {
                const data = await userRes.json();
                if (data.user) {
                    setUserData(data.user);

                    // Pre-fill input if empty (optional, maybe not needed)
                    // setInputWeight(data.user.target_weight?.toString() || '');
                } else {
                    // Not found / Not registered
                    console.log('User not found');
                    // router.replace('/'); // Uncomment if strict
                }
            }

            // 2. Fetch Weight Logs
            const weightsRes = await fetch(`/api/weights?userId=${profile.userId}`);
            if (weightsRes.ok) {
                const data = await weightsRes.json();
                setLogs(data.weights || []);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!liff || !isLoggedIn || !profile?.userId) return;
        fetchData();
    }, [liff, isLoggedIn, profile, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile?.userId || !inputWeight) return;

        const weightVal = parseFloat(inputWeight);
        if (isNaN(weightVal)) return;

        setSubmitting(true);
        try {
            const today = format(new Date(), 'yyyy-MM-dd');

            const res = await fetch('/api/weight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: profile.userId,
                    weight: weightVal,
                    date: today
                })
            });

            if (!res.ok) throw new Error('Failed to save');

            // Optimistic update or refetch
            // For simplicity, let's refetch to get server timestamps/formats correct
            await fetchData();

            setInputWeight('');
            alert('記録しました！');
        } catch (error) {
            console.error(error);
            alert('保存に失敗しました。');
        } finally {
            setSubmitting(false);
        }
    };

    // Prepare chart data
    // The API returns 'weights' with { weight, date, timestamp }
    // The Chart component expects { id, weight, recorded_at: Date }
    const chartLogs = logs.map(l => ({
        id: l.id,
        weight: l.weight,
        recorded_at: new Date(l.date) // or l.timestamp if available
    }));

    const latestWeight = logs.length > 0 ? logs[0].weight : null; // Logs are sorted desc from API?
    // API returns weights ordered by date desc. 
    // So logs[0] should be the latest.

    const targetDiff = (userData?.target_weight && latestWeight) ? (latestWeight - userData.target_weight).toFixed(1) : null;
    const diffColor = targetDiff && parseFloat(targetDiff) > 0 ? 'text-red-500' : 'text-emerald-500';

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col p-4">
                <p className="text-slate-500 mb-4">ユーザー情報が見つかりません。</p>
                <p className="text-sm text-slate-400">管理者に登録を依頼してください。</p>
                <div className="mt-4 text-xs text-slate-300">ID: {profile?.userId}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white px-6 py-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Hi, {userData.display_name}</h1>
                    <p className="text-sm text-slate-500">{format(new Date(), 'yyyy年MM月dd日 (EEE)', { locale: ja })}</p>
                </div>
                <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                    {userData.display_name.charAt(0)}
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Status Card */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <p className="text-xs text-slate-400 font-medium uppercase">Current</p>
                        <div className="mt-1 flex items-baseline">
                            <span className="text-3xl font-bold text-slate-800">
                                {latestWeight ?? '--'}
                            </span>
                            <span className="text-sm text-slate-500 ml-1">kg</span>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <p className="text-xs text-slate-400 font-medium uppercase">Target</p>
                        <div className="mt-1">
                            <span className="text-3xl font-bold text-slate-800">
                                {userData.target_weight ?? '--'}
                            </span>
                            <span className="text-sm text-slate-500 ml-1">kg</span>
                        </div>
                        {targetDiff && (
                            <div className={cn("text-xs font-bold mt-1 flex items-center", diffColor)}>
                                {parseFloat(targetDiff) > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                {parseFloat(targetDiff) > 0 ? '+' : ''}{targetDiff} kg
                            </div>
                        )}
                    </div>
                </div>

                {/* Chart */}
                <section>
                    <h2 className="text-sm font-bold text-slate-700 mb-3 px-1">Progress</h2>
                    <WeightChart logs={chartLogs} targetWeight={userData.target_weight} />
                </section>

                {/* Input Form */}
                <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Record Today</h2>
                    <form onSubmit={handleSubmit} className="flex gap-4">
                        <div className="relative flex-1">
                            <input
                                type="number"
                                step="0.1"
                                value={inputWeight}
                                onChange={(e) => setInputWeight(e.target.value)}
                                placeholder="0.0"
                                className="w-full h-14 pl-4 pr-12 text-2xl font-bold bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">kg</span>
                        </div>
                        <button
                            type="submit"
                            disabled={submitting || !inputWeight}
                            className="h-14 w-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : <Plus className="w-6 h-6" />}
                        </button>
                    </form>
                </section>

                {/* Recent History List */}
                <section>
                    <h2 className="text-sm font-bold text-slate-700 mb-3 px-1">Recent History</h2>
                    <div className="space-y-3">
                        {logs.map(log => (
                            <div key={log.id} className="bg-white p-4 rounded-xl flex justify-between items-center shadow-sm border border-slate-50">
                                <span className="text-slate-600 font-medium">
                                    {format(new Date(log.date), 'M/d (EEE)', { locale: ja })}
                                </span>
                                <span className="text-lg font-bold text-slate-800">{log.weight} kg</span>
                            </div>
                        ))}
                        {logs.length === 0 && (
                            <p className="text-center text-slate-400 py-4">No records yet.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
