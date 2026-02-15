
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const snapshot = await adminDb.collection('users').where('role', '==', 'player').get();
        const users = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Convert timestamps to ISO strings for JSON serialization
                last_recorded_at: data.last_recorded_at?.toDate ? data.last_recorded_at.toDate().toISOString() : data.last_recorded_at,
            };
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ users: [] }, { status: 500 });
    }
}
