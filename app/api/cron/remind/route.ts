import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { sendWeightReminder } from '@/lib/notification';
import { lineClient } from '@/lib/line';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    // 1. Security Check
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const testUserId = searchParams.get('userId');

        if (testUserId) {
            console.log(`[CRON] Attempting to send test message to: ${testUserId}`);
            await lineClient.pushMessage({
                to: testUserId,
                messages: [{
                    type: 'text',
                    text: '【Team Weight Manager】\n今週の体重入力の時間です！\n\n入力はこちらから:\nhttps://liff.line.me/' + process.env.NEXT_PUBLIC_LIFF_ID
                }]
            });
            return NextResponse.json({ success: true, message: `Test message sent to ${testUserId}` });
        }

        // Production logic
        const snapshot = await adminDb.collection('users').where('role', '==', 'player').get();
        const userIds = snapshot.docs
            .map(doc => doc.data().line_user_id)
            .filter((id): id is string => !!id);

        console.log(`[CRON] Found ${userIds.length} players with LINE ID.`);

        if (userIds.length > 0) {
            await sendWeightReminder(userIds);
        }

        return NextResponse.json({ success: true, message: `Cron executed. Sent to ${userIds.length} players.` });

    } catch (error) {
        console.error('[CRON] Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error', details: String(error) }, { status: 500 });
    }
}
