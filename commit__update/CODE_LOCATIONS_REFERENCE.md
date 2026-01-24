# 📋 COMPLETE CODE LOCATIONS REFERENCE

## 🎯 ALL FILES CREATED & MODIFIED

### ✅ NEW FILES CREATED (5 files)

| File Path | Purpose | Lines | Key Function |
|-----------|---------|-------|--------------|
| `backend/services/RedisService.js` | Redis caching layer | 150 | `cacheMessage()` |
| `backend/services/KafkaProducerService.js` | Publish events to Kafka | 120 | `publishMessage()` |
| `backend/services/KafkaConsumerService.js` | Consume Kafka events | 200 | `startAllConsumers()` |
| `backend/services/CacheInvalidationService.js` | Cache management | 100 | `invalidateChannelMessages()` |
| `backend/utils/fanoutManager.js` | WebSocket distribution | 150 | `fanoutMessage()` |

### ✏️ UPDATED FILES (3 files)

| File Path | Changes | Line Numbers |
|-----------|---------|--------------|
| `backend/package.json` | Added kafkajs, redis | Line 13-14 |
| `backend/controllers/messageController.js` | Kafka + Redis integration | Lines 8, 75, 118 |
| `backend/index.js` | Init Kafka/Redis, consumers | Lines 5-15, 50-90 |

### 🐳 CONFIGURATION FILES (3 files)

| File Path | Purpose |
|-----------|---------|
| `docker-compose.yml` | Run Kafka + Zookeeper + Redis |
| `startup.sh` | Auto-start script (Linux/Mac) |
| `startup.bat` | Auto-start script (Windows) |

### 📚 DOCUMENTATION (4 files)

| File Path | Content |
|-----------|---------|
| `commit__update/KAFKA_REDIS_ARCHITECTURE.md` | Full architecture explanation |
| `commit__update/RUN_AND_DEPLOYMENT_GUIDE.md` | How to run everything |
| `commit__update/TEAM_EXPLANATION_GUIDE.md` | Explain to teammates |
| `commit__update/CODE_LOCATIONS_REFERENCE.md` | This file! |

---

## 🔍 LINE-BY-LINE CODE LOCATIONS

### RedisService.js

```
Line 1-15:      Import & initialization
Line 20-45:     connect() function - Redis connection setup
Line 50-70:     cacheMessage() - Cache with TTL
Line 75-90:     getMessagesByChannel() - Retrieve cache
Line 100-120:   setActiveUser() - Track active users
Line 125-145:   getActiveUsers() - Get channel users
Line 150+:      Cache invalidation & utility methods
```

**Key Sections to Show Team:**
- Line 35: `await this.client.setEx()` - This is the caching magic!
- Line 60: `await this.client.lRange()` - Fast retrieval from cache

---

### KafkaProducerService.js

```
Line 1-15:      Import kafkajs & setup
Line 20-35:     connect() - Connect to Kafka brokers
Line 50-70:     publishMessage() - Publish to 'messages' topic
Line 75-90:     publishUserActivity() - Activity events
Line 95-110:    publishReaction() - Reaction events
Line 115+:      publishNotification() - Notifications
```

**Key Sections to Show Team:**
- Line 50-70: The core publishing logic
- Line 55: `key: message.channelId` - This partitions messages by channel!

---

### KafkaConsumerService.js

```
Line 1-20:      Import & initialization
Line 30-50:     connect() - Connect to Kafka
Line 58-95:     startMessagesConsumer() - Listen to 'messages' topic
Line 100-140:   startActivityConsumer() - Listen to 'user-activity'
Line 145-175:   startReactionsConsumer() - Listen to 'reactions'
Line 180-210:   startNotificationsConsumer() - Listen to 'notifications'
Line 220+:      startAllConsumers() - Start all at once
```

**Key Sections to Show Team:**
- Line 60-70: Inside consumer.run(), this is where events are processed
- Line 65: `await RedisService.cacheMessage()` - Caching happens here
- Line 70: `this.io.to(room).emit()` - Fanout happens here

---

### CacheInvalidationService.js

```
Line 1-20:      Import & class setup
Line 25-40:     invalidateChannelMessages() - Clear cache
Line 45-60:     clearUserUnreadCounts() - Clear counts
Line 65-85:     invalidateServerCache() - Server-wide clear
Line 90-110:    updateChannelActiveUsers() - Update presence
Line 115-130:   getChannelStats() - Get statistics
```

---

### fanoutManager.js

```
Line 1-30:      Class initialization & properties
Line 40-55:     registerConnection() - Track user connections
Line 60-75:     unregisterConnection() - Remove connection
Line 80-95:     fanoutMessage() - Broadcast to channel
Line 100-115:   fanoutToUser() - Send to specific user
Line 120-135:   broadcastToChannel() - Generic broadcast
Line 140-155:   getActiveUsersInChannel() - Get users
Line 160-180:   fanoutReaction(), fanoutTyping(), etc.
```

---

### messageController.js (UPDATED)

```
Line 1-10:      Imports (NOW includes Kafka & Redis)
Line 15-30:     sendMessage() function start
Line 75-85:     NEW! KafkaProducerService.publishMessage()
Line 90-105:    Existing Socket.io emit (still there)
Line 110-130:   getMessages() - NOW uses Redis cache first
Line 135-160:   getConversationMessages() - unchanged
Line 165-200:   searchMessages() - unchanged
```

**Tell Team:** "Lines 75-85 are the NEW additions - we now publish to Kafka!"

---

### index.js (UPDATED)

```
Line 1-15:      Imports (NOW includes Kafka, Redis, FanoutManager)
Line 18-25:     Express & HTTP setup
Line 28-40:     Socket.io setup
Line 42:        NEW! Initialize FanoutManager(io)
Line 45-80:     Routes (unchanged)
Line 100-120:   connectDB() function
Line 125-150:   NEW! initializeKafkaAndRedis() - Startup logic
Line 155-180:   connectDB().then() - Call initialization
Line 185-210:   Graceful shutdown with cleanup
```

**Tell Team:**
- Line 125-150: This is where Kafka + Redis get initialized on startup
- Line 155-165: Wait for initialization to complete before starting server
- Line 185-210: Clean shutdown of all services

---

## 📊 DATA FLOW WITH LINE NUMBERS

```
Frontend sends message
        ↓
Backend: POST /api/messages
        ↓ (messageController.js Line 15)
Validate & Save to MongoDB
        ↓ (messageController.js Line 75)
KafkaProducerService.publishMessage()
        ↓ (KafkaProducerService.js Line 55)
Kafka 'messages' topic receives event
        ↓
KafkaConsumerService listening...
        ↓ (KafkaConsumerService.js Line 65)
RedisService.cacheMessage() ✅ Cached
        ↓ (KafkaConsumerService.js Line 70)
FanoutManager.fanoutMessage() ✅ Sent to users
        ↓ (fanoutManager.js Line 80)
WebSocket emits to channel subscribers
        ↓
Frontend receives & updates UI ✅
```

---

## 🚀 QUICK START COMMANDS

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Start services (Windows)
cd ..
startup.bat

# 2. Start services (Linux/Mac)
chmod +x startup.sh
./startup.sh

# 3. In NEW terminal: Start backend
cd backend
npm run dev

# Expected output:
# ✅ Connected to MongoDB Atlas
# 📦 Connected to Redis
# 📨 Kafka Producer connected
# 📥 Kafka Consumers started
# 🚀 Server running on port 5001
```

---

## ✅ VERIFICATION CHECKLIST

Use this to verify each component works:

```bash
# 1. Check Redis
redis-cli ping
# Expected: PONG ✅

# 2. Check Kafka brokers
docker exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092
# Expected: Shows API versions ✅

# 3. Check topics created
docker exec kafka kafka-topics --list --bootstrap-server localhost:9092
# Expected: messages, user-activity, reactions, notifications ✅

# 4. Send test message
curl -X POST http://localhost:5001/api/messages \
  -H "Content-Type: application/json" \
  -d '{"content":"Test","channelId":"test","senderId":"user1","senderName":"John"}'
# Expected: Message JSON in response ✅

# 5. Check Redis cache
redis-cli LRANGE messages:test 0 -1
# Expected: Shows cached message ✅

# 6. Check consumer lag
docker exec kafka kafka-consumer-groups --describe --group messages-group --bootstrap-server localhost:9092
# Expected: LAG = 0 ✅
```

---

## 🎯 EXPLAIN TO TEAMMATES

### Developer A: "Where's the caching code?"
→ `backend/services/RedisService.js` Line 35-70

### Developer B: "How does the Kafka integration work?"
→ `backend/services/KafkaProducerService.js` Line 50-70 (publishing)  
→ `backend/services/KafkaConsumerService.js` Line 60-75 (consuming)

### Developer C: "How do messages reach users?"
→ `backend/utils/fanoutManager.js` Line 80-95 (fanout logic)  
→ `backend/index.js` Line 42 (initialization)

### Developer D: "What changed in messageController?"
→ `backend/controllers/messageController.js` Lines 8, 75, 118

### Developer E: "How to run everything?"
→ Read `RUN_AND_DEPLOYMENT_GUIDE.md`  
→ Use `startup.bat` (Windows) or `startup.sh` (Linux/Mac)

---

## 📞 FILE LOCATIONS SUMMARY TABLE

| Question | Answer |
|----------|--------|
| "How is Redis used?" | `backend/services/RedisService.js` |
| "How is Kafka used?" | `backend/services/KafkaProducerService.js` + `KafkaConsumerService.js` |
| "Where's the fanout?" | `backend/utils/fanoutManager.js` |
| "Where's it initialized?" | `backend/index.js` Line 125-165 |
| "Where does it integrate?" | `backend/controllers/messageController.js` Line 75 |
| "How to run?" | Use `startup.bat` or `startup.sh` |
| "What dependencies?" | `backend/package.json` Line 13-14 |

---

## 🎬 TEAM WALKTHROUGH SCRIPT

```
1. "Let's look at the architecture first"
   → Show: KAFKA_REDIS_ARCHITECTURE.md

2. "Here's where Redis caching happens"
   → Open: backend/services/RedisService.js
   → Point to: Line 35-70 (cacheMessage & getMessagesByChannel)

3. "Here's where Kafka publishing happens"
   → Open: backend/services/KafkaProducerService.js
   → Point to: Line 50-70 (publishMessage)

4. "Here's where Kafka consuming happens"
   → Open: backend/services/KafkaConsumerService.js
   → Point to: Line 60-75 (consumer processes and fanouts)

5. "Here's how it all starts up"
   → Open: backend/index.js
   → Point to: Line 125-165 (initialization)

6. "Now let's see it in action"
   → Run: startup.bat / startup.sh
   → Run: npm run dev
   → Send: test message
   → Check: redis-cli LRANGE messages:* 0 -1
   → Show: Cache has the message! ✅
```

---

✅ **Print this and use it as your reference document!**
