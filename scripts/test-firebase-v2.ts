
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const app = initializeApp({
    credential: cert(serviceAccount),
}, 'test-app'); // Use a named app to avoid conflicts

const db = getFirestore(app);

async function test() {
    try {
        console.log('Testing connection with modular SDK...');
        const cols = await db.listCollections();
        console.log('Success!', cols.map(c => c.id));
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
