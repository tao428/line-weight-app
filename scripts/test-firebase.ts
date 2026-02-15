
import { adminDb } from '../lib/firebaseAdmin';

async function testConnection() {
    try {
        console.log('Attempting to connect to Firestore...');
        const collections = await adminDb.listCollections();
        console.log('Connected successfully!');
        console.log('Collections:', collections.map(c => c.id));
    } catch (error) {
        console.error('Error connecting to Firestore:', error);
        process.exit(1);
    }
}

testConnection();
