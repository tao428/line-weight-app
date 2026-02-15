
import { GoogleAuth } from 'google-auth-library';
import https from 'https';

async function listDatabasesRest() {
    console.log('Listing Databases via REST API...');

    const auth = new GoogleAuth({
        credentials: {
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/datastore', 'https://www.googleapis.com/auth/cloud-platform'],
        projectId: process.env.FIREBASE_PROJECT_ID,
    });

    const accessToken = await auth.getAccessToken();

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const host = 'firestore.googleapis.com';
    const path = `/v1/projects/${projectId}/databases`;

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

listDatabasesRest();
