
import { adminDb } from '../lib/firebaseAdmin';

async function testLibConnection() {
    console.log('Testing lib/firebaseAdmin.ts connection...');
    try {
        const collections = await adminDb.listCollections();
        console.log(`[OK] Connection successful. Collections: ${collections.length}`);

        await adminDb.collection('connection_test').doc('lib_test').set({
            msg: 'Hello from lib',
            ts: new Date()
        });
        console.log('[OK] Write successful');
    } catch (e: any) {
        console.error('[FAIL]', e);
    }
}

testLibConnection();
