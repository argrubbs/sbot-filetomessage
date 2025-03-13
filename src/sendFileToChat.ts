import { StreamerbotClient } from '@streamerbot/client';
import { promises as fs } from 'fs';


// Variables for StreamerBot and File
const streamerBotHost = '127.0.0.1'
const streamerBotPort = 8080
const streamerBotEndpoint = '/'
const actionName = 'TunaMessage';
const fileToRead = 'tuna.txt';

const client = new StreamerbotClient({
    host: streamerBotHost,
    port: streamerBotPort,
    endpoint: streamerBotEndpoint,
    onConnect: (data) => {
        console.log('Streamerbot connected:', data);
    },
    onData: (data) => {
        console.log('Received data:', data);
    },
    onError: (error) => {
        console.error('Connection error:', error);
    }
});

let lastMessageSent = '';

async function getMessageAction(messageName: string) {
    const response = await client.getActions();
    console.log('Actions:', response);
    const messageAction = response.actions.find(action => action.name === messageName);
    if (!messageAction) {
        throw new Error('Message action not found');
    }
    return messageAction.id;
}

async function sendTwitchMessage(message: string) {
    try {
        // Don't send if it's the same as the last message
        if (message === lastMessageSent) {
            console.log('Skipping duplicate message');
            return;
        }

        // For Twitch chat, we send the message directly in the action object
        const response = await client.doAction(await getMessageAction(actionName), {
            message: message  // This is the direct message to send, not in args
        });

        lastMessageSent = message;
        console.log('Chat message sent:', message);
        return response;
    } catch (error) {
        console.error('Error sending to chat:', error);
        throw error;
    }
}

// read contents of local file and watch for changes
async function watchFile(fileToRead: string) {
    console.log(`Watching ${fileToRead} for changes...`);
    const watcher = fs.watch(fileToRead);

    for await (const { eventType, filename } of watcher) {
        if (eventType === 'change') {
            console.log(`File ${filename} changed, reading new contents...`);
            try {
                const contents = await fs.readFile(fileToRead, 'utf8');
                await sendTwitchMessage(contents);
            } catch (err) {
                console.error('Error reading updated file:', err);
            }
        }
    }
}

async function run() {
    // const fileToRead = process.argv[2] || 'message.txt';

    try {
        console.log('Connecting to Streamerbot...');
        await client.connect(30000);

        // First read and send
        console.log('Reading initial contents...');
        const initialContent = await fs.readFile(fileToRead, 'utf8');
        console.log('Sending initial message:', initialContent);
        await sendTwitchMessage(initialContent);

        // Then start watching for changes
        await watchFile(fileToRead);
    } catch (error) {
        console.error("ERROR:", error);
    } finally {
        await client.disconnect();
    }
}

// Show usage if --help is passed
if (process.argv.includes('--help')) {
    console.log('Usage: ts-node test-connection.ts [input file]');
    console.log('If no input file is provided, defaults to ./testfile.txt');
    console.log('The contents of the file will be sent to Twitch chat');
    process.exit(0);
}

run(); 
