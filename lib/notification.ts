
import { lineClient } from '@/lib/line';
import { TextMessage } from '@line/bot-sdk';

export async function sendWeightReminder(userIds: string[]) {
    if (userIds.length === 0) {
        console.log('[Notification] No users to send reminder to.');
        return;
    }

    const messsage: TextMessage = {
        type: 'text',
        text: `【Team Weight Manager】\n今週の体重入力の時間です！\n\n入力はこちらから:\nhttps://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}`,
    };

    // LINE multicast allows up to 500 users at once.
    // If we have more, we need to chunk them.
    const CHUNK_SIZE = 500;
    for (let i = 0; i < userIds.length; i += CHUNK_SIZE) {
        const chunk = userIds.slice(i, i + CHUNK_SIZE);
        try {
            await lineClient.multicast({
                to: chunk,
                messages: [messsage],
            });
            console.log(`[Notification] Sent reminder to ${chunk.length} users.`);
        } catch (error) {
            console.error('[Notification] Failed to send reminder:', error);
            // Continue to next chunk even if one fails
        }
    }
}
