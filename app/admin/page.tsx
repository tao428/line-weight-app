'use client';

import { useEffect, useState } from 'react';
import { useLiff } from '@/components/LiffProvider';
import { useRouter } from 'next/navigation';
import { Loader2, Edit2, Check, X, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { WeightChart } from '@/components/WeightChart';

type Player = {
    id: string;
    display_name: string;
    target_weight: number;
    last_weight?: number;
    last_recorded_at?: string; // ISO string from API
    height?: number;
};

type WeightLog = {
    id: string;
    userId: string;
    weight: number;
    date: string;
    timestamp: string;
};

// Sub-component for editing target weight
function PlayerRow({ player, refresh, onSelect, isSelected }: { player: Player, refresh: () => void, onSelect: () => void, isSelected: boolean }) {
    const [isEditing, setIsEditing] = useState(false);
    const [target, setTarget] = useState(player.target_weight?.toString() || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const val = parseFloat(target);
        if (isNaN(val)) return;
        setSaving(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: player.id, target_weight: val }),
            });

            if (!res.ok) throw new Error('Failed to update');

            alert('Updated!');
            setIsEditing(false);
            refresh();
        } catch (e) {
            console.error(e);
            alert('Failed to update');
        } finally {
            setSaving(false);
        }
    };

    const diff = (player.last_weight && player.target_weight)
        ? (player.last_weight - player.target_weight).toFixed(1)
        : null;

    const lastDate = player.last_recorded_at ? new Date(player.last_recorded_at) : null;

    return (
        <div
            className={cn(
                "bg-white p-4 rounded-xl shadow-sm border transition-all cursor-pointer relative overflow-hidden",
                isSelected ? "border-indigo-500 ring-2 ring-indigo-100" : "border-slate-100 hover:border-indigo-200"
            )}
            onClick={onSelect}
        >
            {isSelected && <div className="absolute top-0 right-0 p-1 bg-indigo-600 rounded-bl-xl text-white"><TrendingUp className="w-3 h-3" /></div>}

            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold text-slate-800 text-lg">{player.display_name}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                        最終記録: {lastDate ? format(lastDate, 'MM/dd HH:mm', { locale: ja }) : '未記録'}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-slate-800 tracking-tight">
                        {player.last_weight ? `${player.last_weight}` : '--'} <span className="text-sm font-normal text-slate-500">kg</span>
                    </div>
                    {diff && (
                        <p className={cn("text-xs font-bold mt-1", parseFloat(diff) > 0 ? "text-red-500" : "text-emerald-500")}>
                            {parseFloat(diff) > 0 ? '+' : ''}{diff} kg (vs 目標)
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-50" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded">目標:</span>
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                onClick={e => e.stopPropagation()}
                                className="w-20 px-2 py-1 border rounded bg-white text-lg font-bold"
                            />
                            <button onClick={handleSave} disabled={saving} className="p-1 bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200 transition-colors">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            </button>
                            <button onClick={() => setIsEditing(false)} className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <span className="font-bold text-slate-700">{player.target_weight} kg</span>
                    )}
                </div>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-indigo-600 p-2 -mr-2">
                        <Edit2 className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}

export default function AdminPage() {
    const { liff, isLoggedIn, profile } = useLiff();
    const router = useRouter();
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    const fetchPlayers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setPlayers(data.users || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchWeights = async (userId: string) => {
        setLoadingLogs(true);
        try {
            const res = await fetch(`/api/weights?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setWeightLogs(data.weights || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingLogs(false);
        }
    };

    useEffect(() => {
        // Check for admin session from password login
        const isAdminSession = localStorage.getItem('admin_session') === 'true';

        if (isAdminSession) {
            setLoading(true);
            fetchPlayers();
            return;
        }

        // Mock authentication check for local dev / unlinked LIFF
        // In real app, we check firebase or session
        if (!process.env.NEXT_PUBLIC_LIFF_ID && process.env.NODE_ENV === 'development') {
            fetchPlayers();
            return;
        }

        if (!liff) return;

        // If LIFF is logged in but not authorized strictly via Firebase here (we rely on client routing from home for now)
        // ideally we should verify user role again, but for this step we assume if they got here via LIFF they are okay 
        // OR we should actually check their role if they are not session admin.
        if (isLoggedIn && profile?.userId) {
            fetchPlayers();
        } else if (!isLoggedIn) {
            // If not logged in via LIFF and no admin session, redirect to admin login
            router.replace('/admin/login');
        }

    }, [liff, isLoggedIn, profile, router]);

    const handleSelectPlayer = (player: Player) => {
        if (selectedPlayerId === player.id) {
            setSelectedPlayerId(null);
            setWeightLogs([]);
        } else {
            setSelectedPlayerId(player.id);
            fetchWeights(player.id);
        }
    };

    const selectedPlayer = players.find(p => p.id === selectedPlayerId);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Sidebar / List (Mobile: Top) */}
            <div className="w-full md:w-1/3 bg-white border-r border-slate-100 flex flex-col h-screen overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Team Manager</h1>
                        <p className="text-sm text-slate-500">{players.length} Players</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24 md:pb-4">
                    {players.map(player => (
                        <PlayerRow
                            key={player.id}
                            player={player}
                            refresh={fetchPlayers}
                            onSelect={() => handleSelectPlayer(player)}
                            isSelected={selectedPlayerId === player.id}
                        />
                    ))}
                    {players.length === 0 && (
                        <div className="text-center py-10 text-slate-400">
                            No players found.
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content / Chart (Mobile: Bottom Sheet / Modal effectively) */}
            <div className="w-full md:w-2/3 p-6 h-screen overflow-y-auto bg-slate-50">
                {selectedPlayer ? (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                                {selectedPlayer.display_name} - Weight History
                            </h2>

                            {loadingLogs ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <Loader2 className="animate-spin text-indigo-400" />
                                </div>
                            ) : (
                                <WeightChart
                                    logs={weightLogs.map(l => ({
                                        id: l.id,
                                        weight: l.weight,
                                        recorded_at: new Date(l.date)
                                    }))}
                                    targetWeight={selectedPlayer.target_weight}
                                />
                            )}
                        </div>

                        {/* Simple Table of Logs */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <h3 className="font-bold text-slate-700">Detailed Records</h3>
                            </div>
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Weight</th>
                                        <th className="px-6 py-3">Diff</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {[...weightLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => {
                                        const diff = (log.weight - selectedPlayer.target_weight).toFixed(1);
                                        return (
                                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">{format(new Date(log.date), 'yyyy/MM/dd')}</td>
                                                <td className="px-6 py-4 font-bold text-slate-800">{log.weight} kg</td>
                                                <td className={cn("px-6 py-4 font-bold", parseFloat(diff) > 0 ? "text-red-500" : "text-emerald-500")}>
                                                    {parseFloat(diff) > 0 ? '+' : ''}{diff}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                        <TrendingUp className="w-16 h-16 mb-4" />
                        <p className="text-lg font-medium">Select a player to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
}
