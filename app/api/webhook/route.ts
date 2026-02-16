import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { lineClient } from '@/lib/line';
import { WebhookEvent } from '@line/bot-sdk';

// LINE Channel Secret from env
const channelSecret = process.env.LINE_CHANNEL_SECRET || '';

// ブラウザ確認用
export async function GET(req: NextRequest) {
    return NextResponse.json({ status: 'ok', message: 'Webhook is working!' });
}

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
            console.error('Invalid signature', {
                received: signature,
                calculated: hash,
                bodyLength: body.length
            });
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const data = JSON.parse(body);
        const events = data.events;

        // Process events (if any)
        // For verification, events might be empty or contain a dummy event
        // We just return 200 OK
        console.log('Webhook payload:', JSON.stringify(data, null, 2));


        if (events && Array.isArray(events)) {
            await Promise.all(events.map(async (event: WebhookEvent) => {
                try {
                    if (event.type === 'follow') {
                        const liffUrl = `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}`;
                        await lineClient.replyMessage({
                            replyToken: event.replyToken!,
                            messages: [{
                                type: 'text',
                                text: `友だち追加ありがとうございます！\n\nこちらからプロフィール登録をお願いします。\n${liffUrl}`
                            }]
                        });
                        console.log(`Sent welcome message to ${event.source.userId}`);
                    }
                } catch (err) {
                    console.error('Error handling event:', err);
                }
            }));
        }

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('Error in webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
