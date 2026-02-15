
import { adminDb } from '../lib/firebaseAdmin';

async function createTestUser() {
    const userId = 'U3c4eb7f07fcafbd5f2d1b1cb5621885e'; // The ID used in browser test
    console.log(`Creating test user: ${userId}`);

    try {
        await adminDb.collection('users').doc(userId).set({
            line_user_id: userId,
            display_name: 'Test Player (Firestore)',
            role: 'player',
            target_weight: 60.0,
            height: 170.0,
            joined_at: new Date(),
            // last_weight might be updated by the weight submission I did earlier? 
            // If I overwrite, I might lose it, so I'll use merge: true just in case, 
            // though set() without merge overwrites.
            // I'll check if it exists first? No, just set basic info.
        }, { merge: true });

        console.log('[OK] Test user created/updated.');
    } catch (e: any) {
        console.error('[FAIL]', e);
    }
}

createTestUser();
