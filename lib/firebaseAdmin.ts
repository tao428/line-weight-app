import * as admin from 'firebase-admin';

import { getFirestore } from 'firebase-admin/firestore';

const app = !admin.apps.length
    ? admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    })
    : admin.app();

// Explicitly use 'default' database ID to workaround connection issue in asia-east1
// The standard '(default)' ID fails with NOT_FOUND in this specific project setup.
const db = getFirestore(app, 'default');
export { db as adminDb };
