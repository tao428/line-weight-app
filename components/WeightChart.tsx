'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface WeightLog {
    id: string;
    weight: number;
    recorded_at: Date;
}

interface WeightChartProps {
    logs: WeightLog[];
    targetWeight?: number;
}

export function WeightChart({ logs, targetWeight }: WeightChartProps) {
    // Sort logs by date ascending
    const data = [...logs].sort((a, b) => a.recorded_at.getTime() - b.recorded_at.getTime())
        .map(log => ({
            ...log,
            dateStr: format(log.recorded_at, 'MM/dd', { locale: ja }),
        }));

    return (
        <div className="w-full h-[300px] bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="dateStr"
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={false}
                        tickLine={false}
                        width={30}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    {targetWeight && (
                        <ReferenceLine y={targetWeight} stroke="#EF4444" strokeDasharray="3 3" label="Target" />
                    )}
                    <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#4F46E5"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
