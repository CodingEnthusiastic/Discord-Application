#!/bin/bash

# Discord App with Kafka + Redis Startup Script
# Usage: ./startup.sh

echo "🚀 Discord Application Startup Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is running
echo "${BLUE}[1/5]${NC} Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "${RED}❌ Docker is not installed!${NC}"
    echo "Please install Docker from: https://www.docker.com/"
    exit 1
fi
echo "${GREEN}✅ Docker found${NC}"

# Check if docker-compose exists
echo "${BLUE}[2/5]${NC} Checking Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "${RED}❌ Docker Compose is not installed!${NC}"
    echo "Please install Docker Compose"
    exit 1
fi
echo "${GREEN}✅ Docker Compose found${NC}"

# Start Docker containers
echo ""
echo "${BLUE}[3/5]${NC} Starting Kafka + Redis containers..."
docker-compose up -d
if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Containers started${NC}"
else
    echo "${RED}❌ Failed to start containers${NC}"
    exit 1
fi

# Wait for services to be ready
echo ""
echo "${BLUE}[4/5]${NC} Waiting for services to be ready..."
sleep 5
echo "${GREEN}✅ Services ready${NC}"

# Check connections
echo ""
echo "${BLUE}[5/5]${NC} Verifying connections..."

# Check Redis
if redis-cli ping > /dev/null 2>&1; then
    echo "${GREEN}✅ Redis connected (localhost:6379)${NC}"
else
    echo "${YELLOW}⚠️  Redis check failed (might still be starting)${NC}"
fi

# Check Kafka
if docker exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092 > /dev/null 2>&1; then
    echo "${GREEN}✅ Kafka broker ready (localhost:9092)${NC}"
else
    echo "${YELLOW}⚠️  Kafka check failed (might still be starting)${NC}"
fi

echo ""
echo "======================================"
echo "${GREEN}✅ ALL SERVICES STARTED${NC}"
echo "======================================"
echo ""
echo "📍 Next Steps:"
echo "   1. In another terminal, navigate to 'backend' folder"
echo "   2. Run: ${YELLOW}npm run dev${NC}"
echo "   3. Backend will connect to Kafka + Redis automatically"
echo ""
echo "📊 Monitoring Commands:"
echo "   - Redis: ${YELLOW}redis-cli${NC}"
echo "   - Kafka topics: ${YELLOW}docker exec kafka kafka-topics --list --bootstrap-server localhost:9092${NC}"
echo "   - Consumer lag: ${YELLOW}docker exec kafka kafka-consumer-groups --describe --group messages-group --bootstrap-server localhost:9092${NC}"
echo ""
echo "🛑 To Stop Services:"
echo "   Run: ${YELLOW}docker-compose down${NC}"
echo ""
