import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// LINE Channel Secret from env
const channelSecret = process.env.LINE_CHANNEL_SECRET || '';

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get('x-line-signature');

        if (!channelSecret) {
            console.error('LINE_CHANNEL_SECRET is not set');
            return NextResponse.json({ error: 'Config Error' }, { status: 500 });
        }

        // Verify Signature
        const hash = crypto
            .createHmac('sha256', channelSecret)
            .update(body)
            .digest('base64');

        if (hash !== signature) {
            console.error('Invalid signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const events = JSON.parse(body).events;

        // Process events (if any)
        // For verification, events might be empty or contain a dummy event
        // We just return 200 OK

        // Example: Log event
        events.forEach((event: any) => {
            console.log('Received event:', event);
        });

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('Error in webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
