
import { Firestore } from '@google-cloud/firestore';

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.error('Environment variables not set');
    process.exit(1);
}

const firestore = new Firestore({
    projectId: process.env.FIREBASE_PROJECT_ID,
    credentials: {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    databaseId: '(default)', // Explicitly set
});

async function testWrite() {
    try {
        console.log('Attempting to write to Firestore...');
        const docRef = firestore.collection('test').doc('connection_test');
        await docRef.set({
            timestamp: new Date(),
            status: 'connected'
        });
        console.log('Write successful!');

        const doc = await docRef.get();
        console.log('Read successful:', doc.data());

    } catch (error) {
        console.error('Error with Firestore:', error);
    }
}

testWrite();
