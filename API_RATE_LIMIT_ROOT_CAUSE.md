# API Rate Limit Issue - Root Cause & Fix ✅

## Problem

Users were consistently getting **429 Too Many Requests** errors from Google Gemini API, hitting the rate limit within a single message.

## Root Causes Identified

### 1. **Duplicate API Calls via Socket.IO** (PRIMARY ISSUE) 🎯

The backend had **TWO parallel handlers** for AI message processing:

- **REST API**: `POST /api/chat/:chatId/message` → calls `generateResponse()`
- **Socket.IO**: `socket.on("ai-message")` → calls `generateResponse()` AGAIN

**Impact**: Every message was hitting the Google Gemini API **TWICE**, effectively halving the rate limit quota.

**Example**:

- Free tier limit: ~15 requests per minute
- With duplicate calls: Only ~7.5 effective requests per minute
- Result: Rate limit hit after 2-3 messages instead of 15

### 2. **No Request Deduplication**

If a user accidentally sent the same message twice (double-click, retry button, etc.), both requests would execute simultaneously, consuming quota twice as fast.

### 3. **Vector Embedding Calls**

Each message was also calling `generateVector()` for semantic search, adding extra API calls.

---

## Solutions Implemented

### 1. **Disabled Socket.IO Handler** ✅

Disabled the duplicate socket handler in `backend/src/sockets/socket.server.js`:

```javascript
socket.on("ai-message", async (messagePayload) => {
  // Socket.IO handler disabled to prevent duplicate API calls
  // Use REST API instead
  socket.emit("ai-response", {
    error: "Socket.IO messaging is disabled. Use REST API endpoint.",
  });
});
```

**Result**: Eliminates duplicate API calls immediately.

---

### 2. **Added Request Deduplication** ✅

In `backend/src/controllers/chat.controller.js`:

```javascript
// Track in-flight requests per chat
const inFlightRequests = new Map();

// Prevent duplicate requests
if (inFlightRequests.has(chatId)) {
  return res.status(429).json({
    error: "Request already in progress",
    message: "Please wait for your previous message to finish processing.",
  });
}

inFlightRequests.set(chatId, true);
// ... process message ...
inFlightRequests.delete(chatId); // Clear when done
```

**Result**: Prevents multiple simultaneous API calls to the same chat.

---

## Expected Improvements

### Before Fix:

- Every 1 user message = 2 API calls (REST + Socket)
- Effective rate limit: ~7-8 requests/minute
- Rate limit hit: After 2-3 messages

### After Fix:

- Every 1 user message = 1 API call (REST only)
- Effective rate limit: ~15 requests/minute
- Rate limit should not hit for typical conversations

---

## Long-Term Recommendations

### Immediate (No cost):

1. ✅ **Batch requests** - Queue multiple messages and send them gradually
2. ✅ **Cache responses** - Store common questions and reuse answers
3. ✅ **Reduce context** - Limit conversation history to reduce token usage

### Short Term ($):

1. **Implement request throttling** - Add a 2-3 second delay between API calls
2. **Add backend caching** - Redis cache for common responses
3. **Implement exponential backoff** - Auto-retry with increasing delays on 429 errors

### Long Term (Recommended):

1. **Switch to paid Google API plan** - Higher rate limits (1000+ RPM)
2. **Use alternative LLM**:
   - Claude API (Anthropic) - Better free tier
   - OpenAI GPT-3.5 - Higher free quota
   - Ollama (self-hosted) - Unlimited, local
   - Together AI - Higher free limits

---

## Files Modified

✅ `backend/src/sockets/socket.server.js` - Disabled duplicate socket handler
✅ `backend/src/controllers/chat.controller.js` - Added request deduplication + in-flight tracking

---

## Testing

After deploying:

1. Send a message - should get response without 429 error
2. Send multiple messages rapidly - should process them without rate limit
3. Check backend logs for deduplication warnings (none = good)

```
✅ Chat created with ID: xxxxx
📤 Sending message to backend...
🤖 Generating AI response with context...
✅ AI response generated: [response]
✅ Message processed successfully
```

No duplicate "Generating AI response" logs = Fix working!

---

## Deployment Steps

1. Pull the changes:

   ```bash
   git pull origin main
   ```

2. Deploy to Render:

   ```bash
   git push heroku main
   # or if using Render's automatic deployment
   # Just push to GitHub and Render will auto-deploy
   ```

3. Monitor logs to confirm no duplicate API calls

---

## Questions?

If users still see 429 errors:

1. Check backend logs for `⚠️ Duplicate request detected` messages
2. Verify only 1 API call per message in logs
3. Consider implementing rate limiting on frontend (waiting 2-3 seconds between messages)
