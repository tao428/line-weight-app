'use client';

import { LiffProvider } from '@/components/LiffProvider';

export function Providers({ children }: { children: React.ReactNode }) {
    return <LiffProvider>{children}</LiffProvider>;
}
