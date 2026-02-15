
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const db = admin.firestore();

async function testRead() {
    try {
        console.log('Testing Firestore Read...');
        console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
        // Try to read a collection that might not exist, should return empty snapshot, NOT error.
        const snapshot = await db.collection('test_collection').get();
        console.log('Read Success!');
        console.log('Documents found:', snapshot.size);
        snapshot.forEach(doc => console.log(doc.id, doc.data()));
    } catch (error) {
        console.error('Read Error:', error);
    }
}

testRead();
