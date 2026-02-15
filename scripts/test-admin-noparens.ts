
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const app = initializeApp({
    credential: cert(serviceAccount),
});

async function testAdminSDKNoParens() {
    console.log('Testing firebase-admin with "default" (no parens)...');
    try {
        // Explicitly pass 'default' as database ID
        const db = getFirestore(app, 'default');
        const collections = await db.listCollections();
        console.log(`[OK] Connected to 'default'. Collections: ${collections.length}`);

        // Try write
        await db.collection('connection_test').doc('ping').set({
            timestamp: new Date(),
            status: 'ok'
        });
        console.log(`[OK] Write successful`);

    } catch (e: any) {
        console.log(`[FAIL] Could not connect`);
        console.log(`Error: ${e.code} - ${e.message}`);
    }
}

testAdminSDKNoParens();
