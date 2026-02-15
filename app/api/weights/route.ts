
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import type { Query } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        let query: Query = adminDb.collection('weights');

        if (userId) {
            query = query.where('userId', '==', userId);
        }

        // Order by date descending
        query = query.orderBy('date', 'desc').limit(100);

        const snapshot = await query.get();
        const weights = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : data.timestamp,
            };
        });

        return NextResponse.json({ weights });
    } catch (error) {
        console.error('Error fetching weights:', error);
        return NextResponse.json({ weights: [] }, { status: 500 });
    }
}
