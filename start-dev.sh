#!/usr/bin/env bash
set -e

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=====================================================${NC}"
echo -e "${BLUE}    MeetSphere Unified Local Dev Environment        ${NC}"
echo -e "${BLUE}=====================================================${NC}"

# Step 1: Check Docker Availability
echo -e "\n${YELLOW}[1/4] Checking Docker daemon status...${NC}"
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}ERROR: Docker daemon is not running or accessible!${NC}"
  echo -e "Please start Docker Desktop and try running this script again."
  exit 1
fi
echo -e "${GREEN}[OK] Docker daemon is active and responding.${NC}"

# Step 2: Environment File Verification
echo -e "\n${YELLOW}[2/4] Verifying environment configuration...${NC}"
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    echo -e "${YELLOW}Creating .env file from .env.example template...${NC}"
    cp .env.example .env
    echo -e "${GREEN}[OK] Created .env file.${NC}"
  else
    echo -e "${RED}ERROR: Neither .env nor .env.example found!${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}[OK] Using existing .env file.${NC}"
fi

# Step 3: Determine Docker Compose Command
echo -e "\n${YELLOW}[3/4] Launching container services via Docker Compose...${NC}"
if docker compose version > /dev/null 2>&1; then
  DOCKER_COMPOSE_CMD="docker compose"
elif command -v docker-compose > /dev/null 2>&1; then
  DOCKER_COMPOSE_CMD="docker-compose"
else
  echo -e "${RED}ERROR: Neither 'docker compose' nor 'docker-compose' plugin found!${NC}"
  exit 1
fi

echo -e "Running: ${BLUE}$DOCKER_COMPOSE_CMD up -d --build${NC}"
$DOCKER_COMPOSE_CMD up -d --build

# Step 4: Monitor Container Health
echo -e "\n${YELLOW}[4/4] Monitoring service health status...${NC}"
SERVICES=("meetsphere-mongodb" "meetsphere-redis" "meetsphere-livekit" "meetsphere-backend" "meetsphere-frontend")
MAX_WAIT_SECONDS=60

check_health() {
  local container=$1
  local status
  status=$(docker inspect --format='{{json .State.Health.Status}}' "$container" 2>/dev/null || echo "\"unknown\"")
  status=$(echo "$status" | tr -d '"')

  if [ "$status" = "healthy" ]; then
    return 0
  elif [ "$status" = "none" ] || [ "$status" = "unknown" ]; then
    local running
    running=$(docker inspect --format='{{.State.Running}}' "$container" 2>/dev/null || echo "false")
    if [ "$running" = "true" ]; then
      return 0
    fi
  fi
  return 1
}

echo -e "Waiting for services to become healthy (timeout ${MAX_WAIT_SECONDS}s)..."
for service in "${SERVICES[@]}"; do
  echo -n -e " - ${service}: "
  ELAPSED=0
  until check_health "$service"; do
    sleep 2
    ELAPSED=$((ELAPSED + 2))
    if [ $ELAPSED -ge $MAX_WAIT_SECONDS ]; then
      echo -e "${RED}TIMEOUT waiting for $service${NC}"
      echo -e "${YELLOW}Container logs for $service:${NC}"
      docker logs --tail 20 "$service"
      exit 1
    fi
    echo -n "."
  done
  echo -e " ${GREEN}HEALTHY${NC}"
done

echo -e "\n${GREEN}=====================================================${NC}"
echo -e "${GREEN}[OK] All MeetSphere services are running and healthy!${NC}"
echo -e "${GREEN}=====================================================${NC}"
echo -e "  Frontend UI:    ${BLUE}http://localhost:3000${NC}"
echo -e "  Backend API:   ${BLUE}http://localhost:5000${NC}"
echo -e "  Health Check:  ${BLUE}http://localhost:5000/health${NC}"
echo -e "  LiveKit WebRTC:${BLUE}http://localhost:7880${NC}"
echo -e "  MongoDB:       ${BLUE}mongodb://localhost:27017${NC}"
echo -e "  Redis:         ${BLUE}redis://localhost:6379${NC}"
echo -e "${GREEN}=====================================================${NC}"
