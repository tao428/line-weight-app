
import { adminDb } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, weight, date } = body;

        // Validation
        if (!userId || typeof userId !== 'string') {
            return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
        }
        if (weight === undefined || typeof weight !== 'number') {
            return NextResponse.json({ error: 'Invalid weight' }, { status: 400 });
        }
        if (!date || typeof date !== 'string') {
            return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
        }

        // Save to Firestore
        // Collection structure: weights/{recordId}
        // We might want to query by user, so including userId is important.
        // We might also want to query by date.

        // Using a composite ID or auto-ID? Auto-ID is safer for multiple entries per day if allowed, 
        // but usually one weight per day per user is enough.
        // Let's use auto-ID for now but queryable fields.

        // Check if entry exists for this user and date? 
        // For simplicity, let's just add/update. 
        // If we want to enforce one per day, we could use a specific ID format like `weight_${userId}_${date}`.
        // Let's assume one entry per day is preferred, so we overwrite if exists.

        // Date format expected: YYYY-MM-DD
        const docId = `${userId}_${date}`;
        await adminDb.collection('weights').doc(docId).set({
            userId,
            weight,
            date,
            timestamp: new Date(), // Server timestamp for record creation/update
        });

        // Also update user's last_weight
        await adminDb.collection('users').doc(userId).set({
            last_weight: weight,
            last_recorded_at: new Date()
        }, { merge: true });

        return NextResponse.json({ success: true, message: 'Weight saved successfully' });
    } catch (error) {
        console.error('Error saving weight:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
