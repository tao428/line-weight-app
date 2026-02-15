
'use client';

import { useState, useEffect } from 'react';
import { useLiff } from '@/components/LiffProvider';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import { format } from 'date-fns';

export default function LiffEntryPage() {
    const { liff, isLoggedIn, profile } = useLiff();
    const router = useRouter();
    const [weight, setWeight] = useState<string>('');
    const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        if (!liff) return;
        if (!isLoggedIn) {
            // Option: Auto login? Or show message.
            // Usually LIFF apps handle login automatically if opened in LINE.
            setStatusMessage('Please login to LINE.');
        }
    }, [liff, isLoggedIn]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile?.userId) {
            alert('User ID not found. Please reload.');
            return;
        }

        setIsSubmitting(true);
        setStatusMessage('Saving...');

        try {
            const response = await fetch('/api/weight', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: profile.userId,
                    weight: parseFloat(weight),
                    date: date,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save weight');
            }

            const result = await response.json();
            setStatusMessage('Saved successfully!');
            alert('Weight saved successfully!');

            // Close LIFF window
            if (liff?.isInClient()) {
                liff.closeWindow();
            } else {
                // If external browser, maybe redirect or just show success
                setStatusMessage('Saved. You can close this window.');
            }

        } catch (error) {
            console.error(error);
            setStatusMessage('Error saving weight.');
            alert('Failed to save weight. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!liff || !isLoggedIn) {
        return (
            <div className="flex min-h-screen items-center justify-center p-6 bg-slate-50">
                <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 flex flex-col items-center">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-indigo-600 p-4 text-center">
                    <h1 className="text-xl font-bold text-white">Record Weight</h1>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Weight (kg)</label>
                        <input
                            type="number"
                            step="0.1"
                            required
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="0.0"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-lg"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !weight}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>Save Record</span>
                            </>
                        )}
                    </button>

                    {statusMessage && (
                        <p className="text-center text-sm text-gray-500 mt-2">{statusMessage}</p>
                    )}
                </form>
            </div>
        </div>
    );
}
