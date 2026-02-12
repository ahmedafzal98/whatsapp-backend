# WhatsApp Backend API

A Node.js + Express backend API that automates WhatsApp messaging using [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js). Send messages to WhatsApp Groups programmatically through REST API endpoints.

## 🌐 Live Deployment

**API Base URL:** `https://whatsapp-backend-74sa.onrender.com`

**Quick Links:**
- 📡 [API Status](https://whatsapp-backend-74sa.onrender.com/status) - Check if API is ready
- 🔐 [Authenticate](https://whatsapp-backend-74sa.onrender.com/qr) - Scan QR code to connect
- 📚 [Complete API Guide](./API_GUIDE.md) - Full documentation for developers

## ⚠️ Disclaimer

This project uses an **unofficial** WhatsApp library. Use at your own risk. WhatsApp may ban accounts that use unofficial clients.

## ✨ Features

- 🔐 QR Code authentication with session persistence
- 📱 Send messages to WhatsApp Groups
- 📋 List all your WhatsApp groups
- 🔄 Logout and session management
- 🚀 RESTful API endpoints
- 💾 Automatic session restoration (no need to scan QR every time)

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A WhatsApp account
- (For deployment) A server with Chromium support

## 🚀 Installation

### Local Setup

```bash
# Clone the repository
git clone https://github.com/ahmedafzal98/whatsapp-backend.git
cd whatsapp-backend

# Install dependencies
npm install

# Start the server
npm start
```

The server will run on `http://localhost:3000`

### First-Time Authentication

1. Start the server: `npm start`
2. Open your browser: `http://localhost:3000/qr`
3. Scan the QR code with WhatsApp:
   - Open WhatsApp on your phone
   - Go to **Settings** → **Linked Devices** → **Link a Device**
   - Scan the QR code displayed in your browser
4. Wait for "✅ WhatsApp Client is ready!" in the console

## 📡 API Endpoints

### 1. Check Status
**GET** `/status`

Check if the WhatsApp client is ready.

**Response:**
```json
{
  "ready": true,
  "needsQR": false
}
```

---

### 2. View QR Code
**GET** `/qr`

Display QR code for authentication (open in browser).

**Usage:** Visit `http://localhost:3000/qr` in your browser

---

### 3. List Groups
**GET** `/groups`

Get all WhatsApp groups you're a member of.

**Response:**
```json
{
  "groups": [
    {
      "id": "120363123456789012@g.us",
      "name": "Family Group",
      "participants": 12,
      "isReadOnly": false
    }
  ]
}
```

---

### 4. Send Message to Group
**POST** `/send-to-group`

Send a message to a specific WhatsApp group.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "groupId": "120363123456789012@g.us",
  "message": "Hello from API! 🚀"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "3EB0123456789ABCDEF",
  "timestamp": 1707854321,
  "to": "120363123456789012@g.us"
}
```

---

### 5. Logout
**POST** `/logout`

Disconnect WhatsApp and clear session data.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully. Session data has been cleared.",
  "note": "You will need to scan QR code again to reconnect. Restart the server to reinitialize."
}
```

---

## 🧪 Testing with cURL

```bash
# Check status
curl http://localhost:3000/status

# Get all groups
curl http://localhost:3000/groups

# Send a message
curl -X POST http://localhost:3000/send-to-group \
  -H "Content-Type: application/json" \
  -d '{"groupId":"120363123456789012@g.us","message":"Hello World!"}'

# Logout
curl -X POST http://localhost:3000/logout
```

## 📮 Testing with Postman

Import the included `postman_collection.json` or create requests manually:

1. **GET** `http://localhost:3000/status`
2. **GET** `http://localhost:3000/groups`
3. **POST** `http://localhost:3000/send-to-group` with JSON body
4. **POST** `http://localhost:3000/logout`

## 🌐 Deployment

### Option 1: Railway.app (Recommended)

1. Create account at [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect and deploy
5. Set environment variables if needed
6. Get your deployment URL and visit `/qr` to authenticate

### Option 2: Render.com

1. Create account at [Render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Deploy and visit `/qr` to authenticate

### Option 3: Heroku

1. Install Heroku CLI
2. Run:
```bash
heroku create your-app-name
heroku buildpacks:add jontewks/puppeteer
git push heroku main
heroku open
```

### Option 4: VPS (Ubuntu/Debian)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Chromium dependencies
sudo apt-get install -y \
  chromium-browser \
  libx11-xcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxi6 \
  libxtst6 \
  libnss3 \
  libcups2 \
  libxss1 \
  libxrandr2 \
  libasound2 \
  libatk1.0-0 \
  libgtk-3-0

# Clone and setup
git clone https://github.com/ahmedafzal98/whatsapp-backend.git
cd whatsapp-backend
npm install

# Run with PM2
sudo npm install -g pm2
pm2 start server.js --name whatsapp-api
pm2 save
pm2 startup
```

## 🔒 Environment Variables (Optional)

Create a `.env` file:

```env
PORT=3000
NODE_ENV=production
```

Update `server.js` to use:
```javascript
require('dotenv').config();
const PORT = process.env.PORT || 3000;
```

## 📂 Project Structure

```
whatsapp-backend/
├── server.js              # Main application file
├── package.json           # Dependencies and scripts
├── .gitignore            # Git ignore rules
├── README.md             # Documentation
├── .wwebjs_auth/         # Session data (auto-generated, gitignored)
└── node_modules/         # Dependencies (gitignored)
```

## 🐛 Troubleshooting

### "WhatsApp client is not ready"
- Wait a few seconds after starting the server
- Visit `/qr` and scan the QR code
- Check console for "✅ WhatsApp Client is ready!"

### "Failed to launch browser"
- Install Chromium: `sudo apt-get install chromium-browser`
- Add puppeteer args in `server.js` (already included)

### Session expired
- Delete `.wwebjs_auth/` folder
- Restart server
- Scan QR code again

### Deployment: QR code not loading
- Some hosting services need puppeteer buildpack
- Ensure Chromium dependencies are installed
- Use headless mode (already enabled)

## 🔧 Advanced Configuration

### Custom Port

```javascript
// In server.js
const PORT = process.env.PORT || 3000;
```

### Multiple Sessions

```javascript
// Create multiple clients with different IDs
const client1 = new Client({
  authStrategy: new LocalAuth({ clientId: "client-1" })
});

const client2 = new Client({
  authStrategy: new LocalAuth({ clientId: "client-2" })
});
```

## 📊 Rate Limits

WhatsApp has rate limits. Recommended:
- Max 20 messages per minute
- Max 1000 messages per day
- Add delays between messages: `await sleep(1000)`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Credits

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) - The WhatsApp client library
- [Express.js](https://expressjs.com/) - Web framework
- [Puppeteer](https://pptr.dev/) - Browser automation

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check [whatsapp-web.js documentation](https://wwebjs.dev/)

---

**⚠️ Important:** This is an unofficial WhatsApp automation tool. Use responsibly and at your own risk. WhatsApp may ban accounts using unofficial clients.
# whatsapp-backend
