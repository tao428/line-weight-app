
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const userId = params.id;
        if (!userId) {
            return NextResponse.json({ error: 'Missing Data' }, { status: 400 });
        }

        const docRef = adminDb.collection('users').doc(userId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const data = docSnap.data();

        // Sanitize dates
        const safeData = {
            ...data,
            joined_at: data?.joined_at?.toDate ? data.joined_at.toDate().toISOString() : data?.joined_at,
            last_recorded_at: data?.last_recorded_at?.toDate ? data.last_recorded_at.toDate().toISOString() : data?.last_recorded_at,
        };

        return NextResponse.json({ user: safeData });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
