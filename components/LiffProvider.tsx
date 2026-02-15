'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import liff from '@line/liff';

type LiffContextType = {
    liff: typeof liff | null;
    profile: Awaited<ReturnType<typeof liff.getProfile>> | null;
    error: unknown;
    isLoggedIn: boolean;
};

const LiffContext = createContext<LiffContextType>({
    liff: null,
    profile: null,
    error: null,
    isLoggedIn: false,
});

export const useLiff = () => useContext(LiffContext);

export const LiffProvider = ({ children }: { children: React.ReactNode }) => {
    const [liffObject, setLiffObject] = useState<typeof liff | null>(null);
    const [profile, setProfile] = useState<LiffContextType['profile']>(null);
    const [error, setError] = useState<unknown>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // During development, if LIFF ID is not set, we can skip initialization
        // or mock it. For now, we just warn.
        if (!process.env.NEXT_PUBLIC_LIFF_ID) {
            console.warn('LIFF ID is not defined in .env.local');
            return;
        }

        const initLiff = async () => {
            try {
                await Promise.race([
                    liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('LIFF init timeout')), 2000))
                ]);

                setLiffObject(liff);
                if (liff.isLoggedIn()) {
                    setIsLoggedIn(true);
                    liff.getProfile().then(setProfile).catch(console.error);
                } else if (process.env.NODE_ENV === 'development') {
                    // Local dev: Real init succeeded (probably external browser), but not logged in.
                    // Use mock!
                    console.log('Falling back to Mock LIFF (Not logged in)');
                    const mockProfile = {
                        userId: 'mock_user_id',
                        displayName: 'Mock User',
                        pictureUrl: '',
                        statusMessage: ''
                    };
                    const mockLiff = {
                        init: () => Promise.resolve(),
                        getProfile: () => Promise.resolve(mockProfile),
                        isLoggedIn: () => true,
                        isInClient: () => false,
                        closeWindow: () => console.log('Mock LIFF: closeWindow called'),
                        login: () => console.log('Mock LIFF: login called'),
                        // Add other methods as needed
                    } as unknown as typeof liff;

                    setLiffObject(mockLiff);
                    setIsLoggedIn(true);
                    setProfile(mockProfile);
                }
            } catch (e) {
                console.error('LIFF init failed or timed out', e);
                // Fallback for local development
                if (process.env.NODE_ENV === 'development') {
                    console.log('Falling back to Mock LIFF (Init failed)');
                    const mockProfile = {
                        userId: 'mock_user_id',
                        displayName: 'Mock User',
                        pictureUrl: '',
                        statusMessage: ''
                    };
                    const mockLiff = {
                        init: () => Promise.resolve(),
                        getProfile: () => Promise.resolve(mockProfile),
                        isLoggedIn: () => true,
                        isInClient: () => false,
                        closeWindow: () => console.log('Mock LIFF: closeWindow called'),
                        login: () => console.log('Mock LIFF: login called'),
                        // Add other methods as needed
                    } as unknown as typeof liff;

                    setLiffObject(mockLiff);
                    setIsLoggedIn(true);
                    setProfile(mockProfile);
                } else {
                    setError(e);
                }
            }
        };

        initLiff();
    }, []);

    return (
        <LiffContext.Provider value={{ liff: liffObject, profile, error, isLoggedIn }}>
            {children}
        </LiffContext.Provider>
    );
};
