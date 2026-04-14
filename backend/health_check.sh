#!/bin/bash
# Ada2AI Health Check Script
# Run this to verify all services are healthy

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Ada2AI YOLO Backend - Health Check"
echo "=========================================="
echo ""

# Check Docker
echo -n "Docker: "
if docker --version > /dev/null 2>&1; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAIL${NC}"
    exit 1
fi

# Check Docker Compose
echo -n "Docker Compose: "
if docker-compose --version > /dev/null 2>&1; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAIL${NC}"
    exit 1
fi

# Check services via nginx load balancer
echo ""
echo "=========================================="
echo "Service Health Checks (via Load Balancer)"
echo "=========================================="

BASE_URL=${1:-http://localhost:80}

# Health endpoint
echo -n "/health: "
HEALTH=$(curl -s -f "$BASE_URL/health" 2>/dev/null || echo "FAIL")
if [ "$HEALTH" != "FAIL" ]; then
    echo -e "${GREEN}OK${NC} - $HEALTH"
else
    echo -e "${RED}FAIL${NC}"
fi

# Individual instances (direct)
echo ""
echo "Individual YOLO Instances:"
for port in 5001 5002 5003; do
    echo -n "  YOLO-$((port-5000)) (:$port): "
    HEALTH=$(curl -s -f "http://localhost:$port/health" 2>/dev/null || echo "FAIL")
    if [ "$HEALTH" != "FAIL" ]; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${RED}FAIL${NC}"
    fi
done

# Redis
echo -n "Redis (:6379): "
REDIS_HEALTH=$(docker exec ada2ai-redis redis-cli ping 2>/dev/null || echo "FAIL")
if [ "$REDIS_HEALTH" == "PONG" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAIL${NC}"
fi

# Nginx
echo -n "Nginx (:80): "
NGINX_HEALTH=$(curl -s -f "$BASE_URL/" 2>/dev/null || echo "FAIL")
if [ "$NGINX_HEALTH" != "FAIL" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAIL${NC}"
fi

echo ""
echo "=========================================="
echo "Load Balancer Status"
echo "=========================================="
curl -s "$BASE_URL/upstream_conf" 2>/dev/null | grep -E "server|upstream" || echo "No upstream info available"

echo ""
echo "=========================================="
echo "Quick Test - Frame Detection"
echo "=========================================="
if [ -f test_frame.jpg ]; then
    RESPONSE=$(curl -s -X POST "$BASE_URL/detect/frame" \
        -F "file=@test_frame.jpg" 2>/dev/null)
    echo "Response: $RESPONSE"
else
    echo "No test image found"
fi

echo ""
echo "=========================================="
echo "Health check complete!"
echo "=========================================="
