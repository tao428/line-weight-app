
import { v1 } from '@google-cloud/firestore';
import * as admin from 'firebase-admin';

// Initialize env vars for the script if not already loaded (handled by dotenv-cli usually)

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.error('Environment variables not set');
    process.exit(1);
}

const client = new v1.FirestoreAdminClient({
    credentials: {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    projectId: process.env.FIREBASE_PROJECT_ID,
});

async function listDatabases() {
    try {
        console.log(`Listing databases for project: ${process.env.FIREBASE_PROJECT_ID}`);
        const parent = client.locationPath(process.env.FIREBASE_PROJECT_ID!, '-'); // List all locations? Or specific?
        // Actually listDatabases takes parent as `projects/{project_id}`
        const projectParent = `projects/${process.env.FIREBASE_PROJECT_ID}`;

        const [databases] = await client.listDatabases({
            parent: `projects/${process.env.FIREBASE_PROJECT_ID}`,
        });

        console.log('Found databases:', databases);
        if (databases && databases.length > 0) {
            databases.forEach(db => {
                console.log(`- Name: ${db.name}`);
                // console.log(`  Type: ${db.type}`); // Type might not be directly accessible or different property name
            });
        } else {
            console.log('No databases found.');
        }

    } catch (error) {
        console.error('Error listing databases:', error);
    }
}

listDatabases();
