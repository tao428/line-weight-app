
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { sendWeightReminder } from '@/lib/notification';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const snapshot = await adminDb.collection('users').where('role', '==', 'player').get();
        // Filter users who have a line_user_id
        const userIds = snapshot.docs
            .map(doc => doc.data().line_user_id)
            .filter((id): id is string => !!id);

        if (userIds.length === 0) {
            return NextResponse.json({ success: false, message: 'No players with LINE ID found.' });
        }

        await sendWeightReminder(userIds);

        return NextResponse.json({ success: true, message: `Sent reminder to ${userIds.length} users.` });
    } catch (error) {
        console.error('Error sending notifications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
