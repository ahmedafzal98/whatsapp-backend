# Deployment Troubleshooting Guide - Render.com

## 🔍 Common Issues and Solutions

### Issue 1: Service Not Starting / Endpoints Not Responding

**Symptoms:**
- Cannot access `/status` endpoint
- Service shows as "deployed" but not responding
- QR code page doesn't load

**Solutions:**

1. **Check Render Logs:**
   - Go to your Render dashboard
   - Click on your service
   - Go to "Logs" tab
   - Look for errors like:
     - `Failed to launch browser`
     - `EADDRINUSE` (port already in use)
     - `Out of memory`

2. **Verify Instance Type:**
   - ⚠️ **Free tier** may not work well (512MB RAM, 0.1 CPU)
   - ✅ **Recommended:** Upgrade to **Starter ($7/mo)** or higher
   - Free tier spins down after inactivity, breaking WhatsApp session

3. **Check Environment Variables:**
   - Go to "Environment" tab in Render
   - Ensure these are set:
     - `NODE_ENV=production`
     - `PORT` (auto-set by Render, don't override)

---

### Issue 2: QR Code Not Appearing

**Symptoms:**
- `/qr` shows "Waiting for QR code..."
- QR code never generates

**Solutions:**

1. **Check Chromium Installation:**
   - Look in logs for: `Failed to launch browser`
   - If present, rebuild the service (trigger new deploy)

2. **Increase Timeout:**
   - Chromium takes 30-60 seconds to start on first run
   - Wait 2-3 minutes after deployment before visiting `/qr`
   - Refresh the page a few times

3. **Check Service Status:**
   ```bash
   curl https://your-app-url.onrender.com/status
   ```
   Should return: `{"ready":false,"needsQR":true}` (before scanning)

---

### Issue 3: QR Code Scanned But Not Authenticating

**Symptoms:**
- You scan the QR code successfully
- WhatsApp shows "Linked"
- But `/status` still shows `"ready": false`

**Solutions:**

1. **Wait Longer:**
   - Authentication can take 1-2 minutes
   - Check logs for "✅ Client authenticated successfully!"

2. **Check Session Storage:**
   - Render may not persist the `.wwebjs_auth/` folder
   - **Solution:** You'll need to scan QR code after each deployment
   - For persistent storage, use Render Disks (paid feature)

3. **Restart Service:**
   - Go to Render dashboard
   - Click "Manual Deploy" → "Clear build cache & deploy"

---

### Issue 4: Service Keeps Crashing

**Symptoms:**
- Service shows "Deploy failed" or "Unhealthy"
- Constant restarts in logs

**Solutions:**

1. **Memory Issues (Most Common):**
   - Chromium needs ~400-500MB RAM
   - Free tier only has 512MB total
   - **Solution:** Upgrade to Starter or higher

2. **Check Health Check:**
   - Health check path: `/status`
   - Should return 200 OK even if WhatsApp not ready
   - Test locally: `curl http://localhost:3000/status`

3. **Review Logs:**
   - Look for `OOMKilled` (out of memory)
   - Look for `Failed to launch browser`
   - Look for JavaScript errors

---

### Issue 5: Session Lost After Restart

**Symptoms:**
- Have to scan QR code after every deployment
- WhatsApp session doesn't persist

**Explanation:**
- Render's free/starter tiers don't persist files between deployments
- The `.wwebjs_auth/` folder is deleted

**Solutions:**

1. **Use Render Disks (Paid):**
   - Add a persistent disk to your service
   - Mount it to `/usr/src/app/.wwebjs_auth`

2. **Use Remote Auth Strategy:**
   - Store session in a database (MongoDB, PostgreSQL)
   - Requires code changes to use RemoteAuth instead of LocalAuth

3. **Accept Re-scanning:**
   - For testing/low-use cases, just re-scan after deploys

---

## 🛠️ Debugging Steps

### Step 1: Test Health Check
```bash
curl https://whatsapp-backend-74sa.onrender.com/
```
**Expected:** JSON with service info
**If fails:** Service not running at all

### Step 2: Test Status Endpoint
```bash
curl https://whatsapp-backend-74sa.onrender.com/status
```
**Expected:** `{"ready":false,"needsQR":false}` or similar
**If fails:** Express server not responding

### Step 3: Test QR Endpoint
Visit in browser:
```
https://whatsapp-backend-74sa.onrender.com/qr
```
**Expected:** "Waiting for QR code..." or actual QR code
**If blank:** JavaScript error or server crash

### Step 4: Check Logs
In Render dashboard:
1. Go to your service
2. Click "Logs"
3. Look for these messages:
   - ✅ `Server started successfully!`
   - ✅ `Server running on http://0.0.0.0:PORT`
   - ⏳ `Initializing WhatsApp client...`
   - 📱 `QR Code received!`

---

## 🚀 Recommended Render Configuration

### Instance Type:
- **Development/Testing:** Starter ($7/mo)
- **Production:** Standard ($25/mo) or higher

### Environment Variables:
```
NODE_ENV=production
```

### Health Check Path:
```
/status
```

### Docker Configuration:
- ✅ Use the provided `Dockerfile`
- ✅ Don't modify Puppeteer args unless necessary

---

## 🔧 If All Else Fails

### Option 1: Manual Rebuild
1. Go to Render dashboard
2. Click "Manual Deploy"
3. Select "Clear build cache & deploy"
4. Wait 5-10 minutes
5. Visit `/qr` and scan

### Option 2: Check Docker Locally
Test if Docker image works on your machine:
```bash
cd whatsapp-backend
docker build -t whatsapp-api .
docker run -p 3000:3000 whatsapp-api
```
Visit `http://localhost:3000/qr`

### Option 3: Try Different Instance Type
If on Free tier, upgrade to Starter:
1. Go to Settings
2. Change Instance Type to "Starter"
3. Save changes
4. Redeploy

### Option 4: Contact Support
If none of the above works:
- Check Render Status: https://status.render.com/
- Contact Render Support (paid plans only)
- Open GitHub issue: https://github.com/ahmedafzal98/whatsapp-backend/issues

---

## 📊 Expected Startup Timeline

| Time | What's Happening |
|------|------------------|
| 0:00 | Deployment triggered |
| 0:30 | Building Docker image |
| 2:00 | Image built, starting container |
| 2:30 | Server started, listening on PORT |
| 3:00 | Chromium initializing |
| 4:00 | QR code generated, ready to scan |
| 5:00 | (After scanning) Authenticating... |
| 6:00 | ✅ Authenticated! Service ready |

**Total time:** 5-6 minutes from deploy to fully ready

---

## 💡 Performance Tips

1. **Keep Service Warm (Paid Tiers):**
   - Services don't spin down on paid tiers
   - WhatsApp connection stays active

2. **Monitor Logs:**
   - Check logs regularly for disconnections
   - Set up log alerts in Render

3. **Rate Limiting:**
   - Don't send too many messages at once
   - WhatsApp may ban your number

4. **Health Checks:**
   - Use the `/status` endpoint to monitor
   - Set up external monitoring (UptimeRobot, etc.)

---

## 📞 Quick Reference

**Service URL:** `https://whatsapp-backend-74sa.onrender.com`

**Key Endpoints:**
- Health: `/`
- Status: `/status`
- QR Code: `/qr`
- Groups: `/groups`
- Send: `/send-to-group`
- Logout: `/logout`

**First-Time Setup:**
1. Deploy to Render (5-10 min)
2. Visit `/qr` endpoint
3. Scan QR code with WhatsApp
4. Wait for authentication (1-2 min)
5. Check `/status` shows `"ready": true`
6. Test with `/groups` endpoint
7. Send test message!

---

**Last Updated:** February 2026  
**For more help:** https://github.com/ahmedafzal98/whatsapp-backend
