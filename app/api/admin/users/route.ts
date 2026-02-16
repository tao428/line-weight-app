
import { NextRequest, NextResponse } from 'next/server';
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

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, target_weight } = body;

        if (!userId || target_weight === undefined) {
            return NextResponse.json({ error: 'userId and target_weight are required' }, { status: 400 });
        }

        await adminDb.collection('users').doc(userId).update({
            target_weight: parseFloat(target_weight),
            updated_at: new Date(),
        });

        return NextResponse.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
