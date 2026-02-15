
import { v1 } from '@google-cloud/firestore';

const client = new v1.FirestoreClient({
    credentials: {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    projectId: process.env.FIREBASE_PROJECT_ID,
});

async function testLowLevelNoParens() {
    try {
        console.log('Testing low-level FirestoreClient with "default"...');
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const databaseId = 'default'; // NO PARENS
        const parent = `projects/${projectId}/databases/${databaseId}/documents`;

        // List documents in a collection 'test'
        // If collection doesn't exist, it should just return empty or success.
        const request = {
            parent,
            collectionId: 'test',
        };

        const [documents] = await client.listDocuments(request);
        console.log('Low-level listDocuments success!');
        console.log('Documents found:', documents.length);
        documents.forEach(doc => console.log(doc.name));

    } catch (error) {
        console.error('Low-level client error:', error);
    }
}

testLowLevelNoParens();
