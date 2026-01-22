# 🚀 Running Kafka + Redis Discord Application

## 📍 Code Locations & File Structure

### Core Services Created:

```
backend/
├── services/
│   ├── RedisService.js               ✅ Redis caching layer
│   ├── KafkaProducerService.js       ✅ Event publishing
│   ├── KafkaConsumerService.js       ✅ Event consumption & fanout
│   ├── CacheInvalidationService.js   ✅ Cache management
│   └── [Other existing services]
├── utils/
│   └── fanoutManager.js              ✅ WebSocket distribution manager
├── controllers/
│   └── messageController.js          ✅ UPDATED - Kafka integration
├── index.js                          ✅ UPDATED - Startup & initialization
└── package.json                      ✅ UPDATED - Added kafkajs & redis
```

---

## 🛠️ STEP 1: Install Dependencies

```bash
# Navigate to backend
cd backend

# Install new packages
npm install

# Verify installations
npm list kafkajs redis
```

**Output should show:**
```
├── kafkajs@2.2.4
├── redis@4.6.13
```

---

## 🛠️ STEP 2: Run Redis Server

### Option A: Using Docker (Easiest)
```bash
# Pull Redis image
docker pull redis:latest

# Run Redis container
docker run -d -p 6379:6379 --name discord-redis redis:latest

# Verify Redis is running
redis-cli ping
# Output: PONG ✅
```

### Option B: Local Installation
```bash
# Windows - Download from https://github.com/microsoftarchive/redis/releases
# Or use: choco install redis-64

# Start Redis
redis-server

# In another terminal, verify connection
redis-cli ping
# Output: PONG ✅
```

---

## 🛠️ STEP 3: Run Kafka (Zookeeper + Broker)

### Option A: Using Docker Compose (Recommended)

Create file: `docker-compose.yml` in project root

```yaml
version: '3.8'

services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

  redis:
    image: redis:latest
    ports:
      - "6379:6379"
```

**Run it:**
```bash
# Start all services
docker-compose up -d

# Verify services
docker-compose ps

# Check logs
docker-compose logs kafka
docker-compose logs redis
```

### Option B: Local Kafka Installation

```bash
# Download from https://kafka.apache.org/downloads
# Extract and navigate

# Terminal 1: Start Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# Terminal 2: Start Kafka
bin/kafka-server-start.sh config/server.properties

# Terminal 3: Create topics
bin/kafka-topics.sh --create --topic messages --bootstrap-server localhost:9092
bin/kafka-topics.sh --create --topic user-activity --bootstrap-server localhost:9092
bin/kafka-topics.sh --create --topic reactions --bootstrap-server localhost:9092
bin/kafka-topics.sh --create --topic notifications --bootstrap-server localhost:9092
```

---

## 🛠️ STEP 4: Setup Environment Variables

Create/Update `.env` in backend folder:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://your-user:your-password@cluster.mongodb.net/database

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=discord-backend

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Other existing configs
GEMINI_API_KEY=your_key
PORT=5001
```

---

## 🛠️ STEP 5: Run Backend Server

```bash
# Terminal 1: Frontend (if needed)
cd frontend
npm run dev

# Terminal 2: Backend
cd backend
npm run dev
# Or with nodemon
nodemon index.js
```

**Expected Output:**
```
✅ Connected to MongoDB Atlas
📦 Connected to Redis
📨 Kafka Producer connected
📥 Kafka Consumers started
✅ Kafka & Redis infrastructure ready
🚀 Server running on port 5001
🤖 AI Notification Scheduler initialized
🔔 Reminder Scheduler initialized
```

---

## ✅ STEP 6: Verify Everything is Working

### Test 1: Check Redis Connection
```bash
# Terminal command
redis-cli

# Inside Redis CLI
ping
# Output: PONG ✅

# Check keys
KEYS *
# Should see: (empty array) initially

# Exit
exit
```

### Test 2: Check Kafka Topics
```bash
# List topics
docker exec kafka kafka-topics --list --bootstrap-server localhost:9092

# Should show:
# messages
# user-activity
# reactions
# notifications
```

### Test 3: Send a Message via API

```bash
# Terminal command
curl -X POST http://localhost:5001/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello Kafka World! 🚀",
    "channelId": "test-channel-123",
    "conversationId": null,
    "senderId": "user-456",
    "senderName": "John Developer",
    "senderAvatar": "https://example.com/avatar.jpg",
    "serverId": "server-789"
  }'
```

**Success Response:**
```json
{
  "_id": "63f4a2b1c5d6e7f8g9h0i1j2",
  "content": "Hello Kafka World! 🚀",
  "channelId": "test-channel-123",
  "senderId": "user-456",
  "senderName": "John Developer",
  "createdAt": "2026-01-22T03:50:00.000Z"
}
```

### Test 4: Verify Redis Cache

```bash
# Check if message was cached
redis-cli

# Inside Redis CLI
LRANGE messages:test-channel-123 0 -1
# Should show cached message ✅

# Check active users
SMEMBERS channel:test-channel-123:active
# Should show active users

exit
```

### Test 5: Monitor Kafka Consumer

```bash
# Check consumer group lag
docker exec kafka kafka-consumer-groups \
  --describe \
  --group messages-group \
  --bootstrap-server localhost:9092

# Output should show lag = 0 ✅
```

---

## 🎯 Full Data Flow Verification

```
1. Frontend sends message
   ↓
2. Backend receives at: localhost:5001/api/messages
   (Code: backend/controllers/messageController.js)
   ↓
3. Message saved to MongoDB
   ↓
4. Kafka Producer publishes to 'messages' topic
   (Code: backend/services/KafkaProducerService.js line ~50)
   ↓
5. Kafka Consumer picks up event
   (Code: backend/services/KafkaConsumerService.js line ~58)
   ↓
6. Redis caches message
   (Code: backend/services/RedisService.js line ~35)
   ✅ Verify: redis-cli LRANGE messages:CHANNEL_ID 0 -1
   ↓
7. WebSocket fanout to connected users
   (Code: backend/utils/fanoutManager.js line ~45)
```

---

## 📊 Monitoring Dashboard

### Redis Monitor (Real-time)
```bash
redis-cli MONITOR
# Shows every command in real-time
```

### Kafka Consumer Lag
```bash
docker exec kafka kafka-consumer-groups \
  --describe \
  --group messages-group \
  --bootstrap-server localhost:9092 \
  --members

# Watch: LAG column should be 0 or small
```

### Backend Logs
```bash
# Enable debug mode by adding to backend/index.js:
process.env.DEBUG = 'discord-backend:*'

# Tail logs
tail -f backend/logs/app.log
```

---

## 🔧 Troubleshooting

### Issue: "Redis connection refused"
```bash
# Solution: Check Redis is running
redis-cli ping
# If error, start Redis: redis-server
```

### Issue: "Kafka broker not available"
```bash
# Solution: Check Kafka is running
docker exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092

# If error, restart: docker-compose restart kafka
```

### Issue: "Consumer lag keeps increasing"
```bash
# Solution: Check consumer is running in backend logs
# Look for: "Messages consumer started"

# If not seen, check KafkaConsumerService initialization in index.js
```

### Issue: "Cache not being populated"
```bash
# Solution: Check Redis is accepting writes
redis-cli SET test "value"
redis-cli GET test
# Should return "value"

# If not, restart Redis
```

---

## 🚀 Performance Expectations

| Metric | Value |
|--------|-------|
| Message Latency | <50ms (end-to-end) |
| Redis Hit Rate | >80% |
| Kafka Consumer Lag | <100ms |
| Cache TTL | 3600s (1 hour) |
| Active Users Session | 300s (5 mins) |

---

## 📚 Team Explanation Checklist

✅ Show where Redis caching is done: `backend/services/RedisService.js`  
✅ Show where Kafka producer publishes: `backend/services/KafkaProducerService.js`  
✅ Show where Kafka consumers listen: `backend/services/KafkaConsumerService.js`  
✅ Show message flow in controller: `backend/controllers/messageController.js`  
✅ Show startup initialization: `backend/index.js` (lines 50-70)  
✅ Show WebSocket fanout: `backend/utils/fanoutManager.js`  

---

## 🎬 Shutdown Gracefully

```bash
# Press Ctrl+C in backend terminal
# Should see:
# ⏹️  Shutting down gracefully...
# ✅ All services disconnected

# Or shutdown services:
docker-compose down
```

---

**✅ Now your Discord app is fully scalable with Kafka + Redis! 🎉**
