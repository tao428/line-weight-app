
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

async function checkDatabase(dbName: string) {
    console.log(`\n--- Checking Database: ${dbName} ---`);
    try {
        const db = getFirestore(app, dbName);
        const collections = await db.listCollections();
        console.log(`[OK] Connected to ${dbName}. Collections: ${collections.length}`);
        collections.forEach(c => console.log(` - ${c.id}`));

        // Try writing a timestamp
        await db.collection('connection_test').doc('ping').set({
            timestamp: new Date(),
            dbName: dbName
        });
        console.log(`[OK] Write successful to ${dbName}`);

    } catch (e: any) {
        console.log(`[FAIL] Could not connect to ${dbName}`);
        console.log(`Error: ${e.code} - ${e.message}`);
    }
}

async function main() {
    await checkDatabase('(default)');
    // Just in case user named the DB same as project
    await checkDatabase('weightdemo-9c8fb');
}

main();
