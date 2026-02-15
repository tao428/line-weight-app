
import { GoogleAuth } from 'google-auth-library';
import https from 'https';

async function testRest() {
    console.log('Testing Firestore REST API...');

    // 1. Get Access Token
    const auth = new GoogleAuth({
        credentials: {
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/datastore'],
        projectId: process.env.FIREBASE_PROJECT_ID,
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken(); // returns { token, res } or string? check docs. 
    // Actually getAccessToken might return null/token.
    // simpler: auth.getAccessToken() returns string.
    const accessToken = await auth.getAccessToken();

    console.log('Access Token obtained.');

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const databaseId = '(default)';
    const collectionId = 'test_collection';

    // 2. Define Endpoints
    const endpoints = [
        `firestore.googleapis.com`,
        `asia-east1-firestore.googleapis.com`
    ];

    const path = `/v1/projects/${projectId}/databases/${databaseId}/documents/${collectionId}`;

    for (const host of endpoints) {
        console.log(`\n--- Requesting ${host}${path} ---`);

        const options = {
            hostname: host,
            path: path,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        };

        await new Promise<void>((resolve) => {
            const req = https.request(options, (res) => {
                console.log(`Status Code: ${res.statusCode}`);
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    console.log('Response Body:', data);
                    resolve();
                });
            });

            req.on('error', (e) => {
                console.error(`Problem with request: ${e.message}`);
                resolve();
            });
            req.end();
        });
    }
}

testRest();
