@echo off
REM Discord App with Kafka + Redis Startup Script (Windows)
REM Usage: startup.bat

echo.
echo 🚀 Discord Application Startup Script (Windows)
echo ================================================
echo.

REM Check if Docker is installed
echo [1/4] Checking Docker...
docker --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Docker is not installed!
    echo Please install Docker Desktop from: https://www.docker.com/
    pause
    exit /b 1
)
echo ✅ Docker found

REM Check if Docker Compose is available
echo [2/4] Checking Docker Compose...
docker-compose --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Docker Compose is not available!
    echo Please update Docker Desktop
    pause
    exit /b 1
)
echo ✅ Docker Compose found

REM Start services
echo.
echo [3/4] Starting Kafka + Redis containers...
docker-compose up -d
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to start containers
    pause
    exit /b 1
)
echo ✅ Containers started

REM Wait for services
echo.
echo [4/4] Waiting for services to be ready...
timeout /t 5 /nobreak
echo ✅ Services ready

echo.
echo ================================================
echo ✅ ALL SERVICES STARTED
echo ================================================
echo.
echo 📍 Next Steps:
echo    1. Open NEW terminal window
echo    2. Navigate to 'backend' folder
echo    3. Run: npm run dev
echo    4. Backend will connect to Kafka + Redis automatically
echo.
echo 📊 Monitoring Commands (in CMD):
echo    - Redis: redis-cli
echo    - List Kafka topics: docker exec kafka kafka-topics --list --bootstrap-server localhost:9092
echo    - Check consumer lag: docker exec kafka kafka-consumer-groups --describe --group messages-group --bootstrap-server localhost:9092
echo.
echo 🛑 To Stop Services:
echo    Run: docker-compose down
echo.
echo 📚 For detailed setup, read: RUN_AND_DEPLOYMENT_GUIDE.md
echo.
pause
