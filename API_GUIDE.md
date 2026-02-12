# WhatsApp Backend API - Complete Developer Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [Code Examples](#code-examples)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

---

## 🎯 Overview

This API allows you to send WhatsApp messages to groups programmatically using REST endpoints.

**Base URL:** `https://whatsapp-backend-74sa.onrender.com`  
**Format:** JSON  
**Authentication:** QR Code (one-time scan)

---

## 🚀 Getting Started

### Step 1: Authenticate (First Time Only)

Before using the API, you need to scan a QR code **once**:

1. Open your browser and visit:
   ```
   https://whatsapp-backend-74sa.onrender.com/qr
   ```

2. Open WhatsApp on your phone:
   - Go to **Settings** → **Linked Devices**
   - Tap **Link a Device**
   - Scan the QR code on your screen

3. Wait for the message: **"Client is already authenticated!"**

✅ **Done!** Your session is saved. You won't need to scan again unless you logout.

---

### Step 2: Verify Connection

Check if the API is ready:

**Request:**
```bash
GET https://whatsapp-backend-74sa.onrender.com/status
```

**Success Response:**
```json
{
  "ready": true,
  "needsQR": false
}
```

If `"ready": false`, go back to Step 1 and scan the QR code.

---

## 📡 API Endpoints

### 1. Check Status

**Endpoint:** `GET /status`

Check if WhatsApp client is connected and ready.

**Request:**
```http
GET /status HTTP/1.1
Host: whatsapp-backend-74sa.onrender.com
```

**Response:**
```json
{
  "ready": true,
  "needsQR": false
}
```

**Status Codes:**
- `200 OK` - Request successful

---

### 2. Get All Groups

**Endpoint:** `GET /groups`

Retrieve a list of all WhatsApp groups where you're a member.

**Request:**
```http
GET /groups HTTP/1.1
Host: whatsapp-backend-74sa.onrender.com
```

**Success Response (200 OK):**
```json
{
  "groups": [
    {
      "id": "120363123456789012@g.us",
      "name": "Family Group",
      "participants": 12,
      "isReadOnly": false
    },
    {
      "id": "120363987654321098@g.us",
      "name": "Work Team",
      "participants": 25,
      "isReadOnly": false
    }
  ]
}
```

**Error Response (503 Service Unavailable):**
```json
{
  "error": "WhatsApp client is not ready"
}
```

**Field Descriptions:**
- `id` - Group identifier (use this to send messages)
- `name` - Group name
- `participants` - Number of members in the group
- `isReadOnly` - Whether you can send messages to this group

**Status Codes:**
- `200 OK` - Groups retrieved successfully
- `503 Service Unavailable` - Client not ready (scan QR code)

---

### 3. Send Message to Group

**Endpoint:** `POST /send-to-group`

Send a text message to a specific WhatsApp group.

**Request:**
```http
POST /send-to-group HTTP/1.1
Host: whatsapp-backend-74sa.onrender.com
Content-Type: application/json

{
  "groupId": "120363123456789012@g.us",
  "message": "Hello from API! 🚀"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `groupId` | string | Yes | Group ID from `/groups` endpoint |
| `message` | string | Yes | Text message to send |

**Success Response (200 OK):**
```json
{
  "success": true,
  "messageId": "3EB0123456789ABCDEF",
  "timestamp": 1707854321,
  "to": "120363123456789012@g.us"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Both groupId and message are required",
  "example": {
    "groupId": "123456789-1234567890@g.us",
    "message": "Hello from API!"
  }
}
```

**Error Response (503 Service Unavailable):**
```json
{
  "error": "WhatsApp client is not ready. Please scan QR code first.",
  "qrUrl": "/qr"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "error": "Failed to send message",
  "details": "Error details here"
}
```

**Status Codes:**
- `200 OK` - Message sent successfully
- `400 Bad Request` - Missing or invalid parameters
- `503 Service Unavailable` - Client not authenticated
- `500 Internal Server Error` - Failed to send message

---

### 4. Logout

**Endpoint:** `POST /logout`

Disconnect WhatsApp and clear the session. You'll need to scan the QR code again after logging out.

**Request:**
```http
POST /logout HTTP/1.1
Host: whatsapp-backend-74sa.onrender.com
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully. Session data has been cleared.",
  "note": "You will need to scan QR code again to reconnect. Restart the server to reinitialize."
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Client is not logged in",
  "ready": false
}
```

**Status Codes:**
- `200 OK` - Logged out successfully
- `400 Bad Request` - Already logged out
- `500 Internal Server Error` - Logout failed

---

## 💻 Code Examples

### cURL

#### Check Status
```bash
curl https://whatsapp-backend-74sa.onrender.com/status
```

#### Get All Groups
```bash
curl https://whatsapp-backend-74sa.onrender.com/groups
```

#### Send Message
```bash
curl -X POST https://whatsapp-backend-74sa.onrender.com/send-to-group \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "120363123456789012@g.us",
    "message": "Hello from cURL!"
  }'
```

#### Logout
```bash
curl -X POST https://whatsapp-backend-74sa.onrender.com/logout
```

---

### JavaScript (Node.js)

```javascript
const axios = require('axios');

const BASE_URL = 'https://whatsapp-backend-74sa.onrender.com';

// Check Status
async function checkStatus() {
  const response = await axios.get(`${BASE_URL}/status`);
  console.log('Status:', response.data);
}

// Get All Groups
async function getGroups() {
  const response = await axios.get(`${BASE_URL}/groups`);
  console.log('Groups:', response.data.groups);
  return response.data.groups;
}

// Send Message
async function sendMessage(groupId, message) {
  try {
    const response = await axios.post(`${BASE_URL}/send-to-group`, {
      groupId: groupId,
      message: message
    });
    console.log('Message sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
    throw error;
  }
}

// Logout
async function logout() {
  const response = await axios.post(`${BASE_URL}/logout`);
  console.log('Logged out:', response.data);
}

// Example Usage
async function main() {
  // 1. Check if ready
  await checkStatus();
  
  // 2. Get all groups
  const groups = await getGroups();
  
  // 3. Send message to first group
  if (groups.length > 0) {
    await sendMessage(groups[0].id, 'Hello from Node.js!');
  }
}

main();
```

---

### JavaScript (Browser/Frontend)

```javascript
const BASE_URL = 'https://whatsapp-backend-74sa.onrender.com';

// Check Status
async function checkStatus() {
  const response = await fetch(`${BASE_URL}/status`);
  const data = await response.json();
  console.log('Status:', data);
  return data;
}

// Get All Groups
async function getGroups() {
  const response = await fetch(`${BASE_URL}/groups`);
  const data = await response.json();
  console.log('Groups:', data.groups);
  return data.groups;
}

// Send Message
async function sendMessage(groupId, message) {
  const response = await fetch(`${BASE_URL}/send-to-group`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      groupId: groupId,
      message: message
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to send message');
  }
  
  console.log('Message sent:', data);
  return data;
}

// Example: Send message on button click
document.getElementById('sendBtn').addEventListener('click', async () => {
  const groupId = document.getElementById('groupId').value;
  const message = document.getElementById('message').value;
  
  try {
    await sendMessage(groupId, message);
    alert('Message sent successfully!');
  } catch (error) {
    alert('Error: ' + error.message);
  }
});
```

---

### Python

```python
import requests

BASE_URL = 'https://whatsapp-backend-74sa.onrender.com'

# Check Status
def check_status():
    response = requests.get(f'{BASE_URL}/status')
    print('Status:', response.json())
    return response.json()

# Get All Groups
def get_groups():
    response = requests.get(f'{BASE_URL}/groups')
    data = response.json()
    print('Groups:', data['groups'])
    return data['groups']

# Send Message
def send_message(group_id, message):
    try:
        response = requests.post(
            f'{BASE_URL}/send-to-group',
            json={
                'groupId': group_id,
                'message': message
            }
        )
        response.raise_for_status()
        data = response.json()
        print('Message sent:', data)
        return data
    except requests.exceptions.HTTPError as error:
        print('Error:', error.response.json())
        raise

# Logout
def logout():
    response = requests.post(f'{BASE_URL}/logout')
    print('Logged out:', response.json())

# Example Usage
if __name__ == '__main__':
    # 1. Check if ready
    check_status()
    
    # 2. Get all groups
    groups = get_groups()
    
    # 3. Send message to first group
    if groups:
        send_message(groups[0]['id'], 'Hello from Python!')
```

---

### PHP

```php
<?php

$BASE_URL = 'https://whatsapp-backend-74sa.onrender.com';

// Check Status
function checkStatus($baseUrl) {
    $response = file_get_contents("$baseUrl/status");
    $data = json_decode($response, true);
    echo "Status: " . print_r($data, true) . "\n";
    return $data;
}

// Get All Groups
function getGroups($baseUrl) {
    $response = file_get_contents("$baseUrl/groups");
    $data = json_decode($response, true);
    echo "Groups: " . print_r($data['groups'], true) . "\n";
    return $data['groups'];
}

// Send Message
function sendMessage($baseUrl, $groupId, $message) {
    $data = [
        'groupId' => $groupId,
        'message' => $message
    ];
    
    $options = [
        'http' => [
            'header'  => "Content-Type: application/json\r\n",
            'method'  => 'POST',
            'content' => json_encode($data)
        ]
    ];
    
    $context  = stream_context_create($options);
    $response = file_get_contents("$baseUrl/send-to-group", false, $context);
    $result = json_decode($response, true);
    
    echo "Message sent: " . print_r($result, true) . "\n";
    return $result;
}

// Example Usage
checkStatus($BASE_URL);
$groups = getGroups($BASE_URL);

if (count($groups) > 0) {
    sendMessage($BASE_URL, $groups[0]['id'], 'Hello from PHP!');
}
?>
```

---

## 🚨 Error Handling

### Common Errors

| Status Code | Error | Solution |
|-------------|-------|----------|
| `400` | Missing parameters | Check that you included both `groupId` and `message` |
| `503` | Client not ready | Visit `/qr` and scan the QR code |
| `500` | Failed to send message | Check if the group ID is valid or if you're an admin |

### Example Error Handler (JavaScript)

```javascript
async function sendMessageWithErrorHandling(groupId, message) {
  try {
    const response = await fetch(`${BASE_URL}/send-to-group`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, message })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Handle specific errors
      if (response.status === 503) {
        console.error('WhatsApp not connected. Please scan QR code.');
        window.location.href = `${BASE_URL}/qr`;
      } else if (response.status === 400) {
        console.error('Invalid request:', data.error);
      } else {
        console.error('Failed to send:', data.error);
      }
      throw new Error(data.error);
    }
    
    return data;
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
}
```

---

## ✅ Best Practices

### 1. **Check Status Before Sending**

Always verify the client is ready before sending messages:

```javascript
async function safeSendMessage(groupId, message) {
  const status = await checkStatus();
  
  if (!status.ready) {
    throw new Error('WhatsApp client is not ready. Please authenticate first.');
  }
  
  return await sendMessage(groupId, message);
}
```

### 2. **Cache Group IDs**

Don't call `/groups` every time. Cache the group IDs:

```javascript
let cachedGroups = null;

async function getGroupsWithCache() {
  if (!cachedGroups) {
    cachedGroups = await getGroups();
  }
  return cachedGroups;
}
```

### 3. **Rate Limiting**

WhatsApp has rate limits. Add delays between messages:

```javascript
async function sendMultipleMessages(messages) {
  for (const msg of messages) {
    await sendMessage(msg.groupId, msg.message);
    await sleep(2000); // Wait 2 seconds between messages
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

**Recommended Limits:**
- Max 20 messages per minute
- Max 1000 messages per day
- Wait at least 1-2 seconds between messages

### 4. **Error Retry Logic**

Implement retry for failed requests:

```javascript
async function sendMessageWithRetry(groupId, message, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await sendMessage(groupId, message);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retry ${i + 1}/${maxRetries}...`);
      await sleep(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```

### 5. **Message Formatting**

```javascript
// Use emojis
await sendMessage(groupId, '📢 Important Update!');

// Multi-line messages
await sendMessage(groupId, `
Daily Report:
✅ Task 1 - Complete
✅ Task 2 - Complete
⏳ Task 3 - In Progress
`);

// Bold, italic (WhatsApp formatting)
await sendMessage(groupId, '*Bold Text* _Italic Text_ ~Strikethrough~');
```

### 6. **Environment Variables**

Store your API URL in environment variables:

```javascript
// .env file
WHATSAPP_API_URL=https://whatsapp-backend-74sa.onrender.com

// In your code
const BASE_URL = process.env.WHATSAPP_API_URL;
```

---

## 🔐 Security Best Practices

1. **Don't expose your API publicly** without authentication
2. **Use HTTPS only** (Render provides this by default)
3. **Implement rate limiting** on your client side
4. **Log all API calls** for debugging
5. **Never share your QR code** with others

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue:** "WhatsApp client is not ready"  
**Solution:** Visit `/qr` and scan the QR code

**Issue:** "Failed to send message"  
**Solution:** Verify the group ID is correct and you're a member/admin

**Issue:** Session expired  
**Solution:** Logout and scan QR code again

**Issue:** API is slow  
**Solution:** Upgrade to a better Render instance (Starter or Standard)

---

## 📚 Additional Resources

- **GitHub Repository:** https://github.com/ahmedafzal98/whatsapp-backend
- **Postman Collection:** Import `postman_collection.json` from the repo
- **Render Deployment:** https://render.com/docs
- **WhatsApp Web.js Docs:** https://wwebjs.dev/

---

## 📝 Quick Reference

### All Endpoints Summary

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/status` | Check if client is ready | No |
| GET | `/qr` | View QR code (browser only) | No |
| GET | `/groups` | List all groups | Yes (QR scan) |
| POST | `/send-to-group` | Send message to group | Yes (QR scan) |
| POST | `/logout` | Disconnect WhatsApp | Yes (QR scan) |

---

## 🎉 Example: Complete Workflow

```javascript
const axios = require('axios');
const BASE_URL = 'https://whatsapp-backend-74sa.onrender.com';

async function completeWorkflow() {
  try {
    // Step 1: Check status
    console.log('Step 1: Checking status...');
    const status = await axios.get(`${BASE_URL}/status`);
    console.log('✅ Status:', status.data);
    
    if (!status.data.ready) {
      console.log('❌ Not ready! Please scan QR code at:', `${BASE_URL}/qr`);
      return;
    }
    
    // Step 2: Get groups
    console.log('\nStep 2: Getting groups...');
    const groups = await axios.get(`${BASE_URL}/groups`);
    console.log('✅ Found', groups.data.groups.length, 'groups');
    
    groups.data.groups.forEach((group, index) => {
      console.log(`  ${index + 1}. ${group.name} (${group.participants} members)`);
    });
    
    // Step 3: Send message to first group
    if (groups.data.groups.length > 0) {
      console.log('\nStep 3: Sending message...');
      const targetGroup = groups.data.groups[0];
      
      const result = await axios.post(`${BASE_URL}/send-to-group`, {
        groupId: targetGroup.id,
        message: '🎉 Hello from the API! This is an automated message.'
      });
      
      console.log('✅ Message sent successfully!');
      console.log('   Message ID:', result.data.messageId);
      console.log('   Timestamp:', new Date(result.data.timestamp * 1000));
    }
    
    console.log('\n✅ Workflow completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

completeWorkflow();
```

---

**Last Updated:** February 2026  
**Version:** 1.0.0  
**License:** MIT

---

For questions or issues, please open an issue on GitHub or contact support.

**Happy Coding! 🚀**
