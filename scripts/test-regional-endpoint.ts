
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

// EXPLICITLY SET THE REGIONAL ENDPOINT
db.settings({
    host: 'asia-east1-firestore.googleapis.com',
    ssl: true
});

async function testRegional() {
    try {
        console.log('Testing Firestore with Regional Endpoint: asia-east1-firestore.googleapis.com');
        console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);

        const snapshot = await db.collection('test_regional').get();
        console.log('Regional Read Success!');
        console.log('Documents found:', snapshot.size);
    } catch (error) {
        console.error('Regional Read Error:', error);
    }
}

testRegional();
