
import { google } from 'googleapis';

async function listServices() {
    console.log('Listing enabled services...');

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        projectId: process.env.FIREBASE_PROJECT_ID,
    });

    const serviceUsage = google.serviceusage({ version: 'v1', auth });

    try {
        const res = await serviceUsage.services.list({
            parent: `projects/${process.env.FIREBASE_PROJECT_ID}`,
            filter: 'state:ENABLED'
        });

        const services = res.data.services || [];
        console.log('Enabled Services:');
        services.forEach(s => {
            if (s.config?.name?.includes('firestore') || s.config?.name?.includes('datastore')) {
                console.log(` - ${s.config.name}`);
            }
        });
        // Also check if appengine is enabled, sometimes related
        services.forEach(s => {
            if (s.config?.name?.includes('appengine')) {
                console.log(` - ${s.config.name}`);
            }
        });

    } catch (e: any) {
        console.error('Error listing services:', e.message);
    }
}

listServices();
