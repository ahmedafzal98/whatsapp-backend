const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const app = express();

// JSON body parser with error handling
app.use(express.json());

// Handle JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        // If JSON parsing fails, just set body to empty object and continue
        req.body = {};
        return next();
    }
    next(err);
});

// Initialize WhatsApp client with local authentication (saves session)
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "client-one"
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

// Store QR code and client status
let qrCodeData = null;
let isClientReady = false;

// QR Code event - scan this with your phone
client.on('qr', async (qr) => {
    console.log('📱 QR Code received! Scan it with your phone.');
    qrCodeData = await qrcode.toDataURL(qr);
    const PORT = process.env.PORT || 3000;
    console.log(`🔗 QR Code available at: http://localhost:${PORT}/qr`);
});

// Client ready event
client.on('ready', () => {
    console.log('✅ WhatsApp Client is ready!');
    isClientReady = true;
});

// Handle authentication
client.on('authenticated', () => {
    console.log('✅ Client authenticated successfully!');
});

// Handle disconnection
client.on('disconnected', (reason) => {
    console.log('❌ Client was disconnected:', reason);
    isClientReady = false;
});

// Handle authentication failure
client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failure:', msg);
    isClientReady = false;
});

// Handle loading screen
client.on('loading_screen', (percent, message) => {
    console.log(`⏳ Loading... ${percent}% - ${message}`);
});

// Initialize the client with error handling
console.log('🔄 Initializing WhatsApp client...');
client.initialize().catch(err => {
    console.error('❌ Failed to initialize WhatsApp client:', err);
});

// =========================
// API ENDPOINTS
// =========================

// GET / - Health check / Home
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        service: 'WhatsApp Backend API',
        version: '1.0.0',
        endpoints: {
            status: '/status',
            qr: '/qr',
            groups: '/groups',
            sendToGroup: '/send-to-group',
            logout: '/logout'
        },
        documentation: 'https://github.com/ahmedafzal98/whatsapp-backend'
    });
});

// GET /qr - Display QR code for initial authentication
app.get('/qr', (req, res) => {
    if (isClientReady) {
        return res.send('<h1>Client is already authenticated!</h1>');
    }
    
    if (!qrCodeData) {
        return res.send('<h1>Waiting for QR code...</h1><p>Refresh in a few seconds.</p>');
    }
    
    res.send(`
        <h1>Scan this QR Code with WhatsApp</h1>
        <img src="${qrCodeData}" alt="QR Code" />
        <p>Open WhatsApp → Settings → Linked Devices → Link a Device</p>
    `);
});

// GET /status - Check if client is ready
app.get('/status', (req, res) => {
    res.json({
        ready: isClientReady,
        needsQR: !isClientReady && qrCodeData !== null
    });
});

// POST /send-to-group - Send message to a WhatsApp Group
app.post('/send-to-group', async (req, res) => {
    try {
        if (!isClientReady) {
            return res.status(503).json({
                error: 'WhatsApp client is not ready. Please scan QR code first.',
                qrUrl: '/qr'
            });
        }

        const { groupId, message } = req.body;

        if (!groupId || !message) {
            return res.status(400).json({
                error: 'Both groupId and message are required',
                example: {
                    groupId: '123456789-1234567890@g.us',
                    message: 'Hello from API!'
                }
            });
        }

        // Send the message
        const sentMessage = await client.sendMessage(groupId, message);

        res.json({
            success: true,
            messageId: sentMessage.id._serialized,
            timestamp: sentMessage.timestamp,
            to: groupId
        });

    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            error: 'Failed to send message',
            details: error.message
        });
    }
});

// GET /groups - List all groups where you're a member
app.get('/groups', async (req, res) => {
    try {
        if (!isClientReady) {
            return res.status(503).json({
                error: 'WhatsApp client is not ready'
            });
        }

        const chats = await client.getChats();
        const groups = chats
            .filter(chat => chat.isGroup)
            .map(group => ({
                id: group.id._serialized,
                name: group.name,
                participants: group.participants?.length || 0,
                isReadOnly: group.isReadOnly
            }));

        res.json({ groups });

    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({
            error: 'Failed to fetch groups',
            details: error.message
        });
    }
});

// POST /logout - Logout and destroy WhatsApp session
app.post('/logout', async (req, res) => {
    try {
        if (!isClientReady) {
            return res.status(400).json({
                error: 'Client is not logged in',
                ready: false
            });
        }

        console.log('🔴 Logging out WhatsApp client...');
        
        // Logout and destroy the session
        await client.logout();
        await client.destroy();
        
        // Reset state
        isClientReady = false;
        qrCodeData = null;
        
        console.log('✅ Successfully logged out!');
        
        res.json({
            success: true,
            message: 'Logged out successfully. Session data has been cleared.',
            note: 'You will need to scan QR code again to reconnect. Restart the server to reinitialize.'
        });

    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({
            error: 'Failed to logout',
            details: error.message
        });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Bind to all interfaces for Docker/Render

app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
    console.log(`📱 Scan QR at: http://localhost:${PORT}/qr`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Server started successfully!`);
});
