#!/bin/bash
set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

TEMP_DIR=$(mktemp -d)
CURRENT_DIR=$(pwd)
CLEANUP_PLAYWRIGHT=false

# Cleanup function
cleanup() {
  echo -e "\n${YELLOW}Cleaning up...${NC}"
  
  if [ -d "$TEMP_DIR" ]; then
    echo "Removing temporary directory $TEMP_DIR..."
    
    if [ -f "$TEMP_DIR/docker-compose.yml" ] && command -v docker &> /dev/null; then
          echo "Stopping Docker containers..."
          (cd "$TEMP_DIR" && docker compose down -v || true)
    fi

    rm -rf "$TEMP_DIR"
    echo -e "${GREEN}Cleanup complete.${NC}"
  fi

  if [ "$CLEANUP_PLAYWRIGHT" = "true" ]; then
    echo -e "${YELLOW}Removing globally installed Playwright...${NC}"
    npm uninstall -g playwright
    echo -e "${GREEN}Global Playwright removed.${NC}"
  fi
}

trap cleanup EXIT INT TERM

echo -e "${CYAN}=======================================${NC}"
echo -e "${CYAN}      Servisbot Runner Script          ${NC}"
echo -e "${CYAN}=======================================${NC}"

# Check for Node.js and npm
if ! command -v node &> /dev/null; then
  echo -e "${RED}Error: Node.js is not installed.${NC}"
  exit 1
fi

if ! command -v npm &> /dev/null; then
  echo -e "${RED}Error: npm is not installed.${NC}"
  exit 1
fi

# Check for Playwright
if ! command -v playwright &> /dev/null; then
  echo -e "${YELLOW}Playwright not found globally. Installing...${NC}"
  npm install -g playwright
  CLEANUP_PLAYWRIGHT=true
else
  echo -e "${GREEN}Playwright is already installed globally.${NC}"
fi

# 1. Checkout Code
echo -e "\n${YELLOW}[1/5] Checking out code...${NC}"
echo "Creating temporary workspace: $TEMP_DIR"

# Clone the repository
git clone https://github.com/ronniery/servisbot-coding-challenge.git "$TEMP_DIR"

cd "$TEMP_DIR"
echo -e "${GREEN}✓ Code checked out to $TEMP_DIR${NC}"

# Install dependencies
echo -e "\n${YELLOW}[Setup] Installing dependencies...${NC}"

# Install root dependencies
npm install

# Run the project-specific install script
npm run npm:install

# Build the shared package
echo -e "\n${YELLOW}[Setup] Building shared package...${NC}"
npm run build --prefix packages/shared

echo -e "${GREEN}✓ Dependencies installed and shared package built${NC}"

# 2. Linters
echo -e "\n${YELLOW}[2/5] Running Linters...${NC}"

echo ">> Checking Backend Lint..."
if npm run lint --prefix apps/backend; then
    echo -e "${GREEN}✓ Backend Lint Passed${NC}"
else
    echo -e "${RED}✗ Backend Lint Failed${NC}"
    exit 1
fi

echo ">> Checking Frontend Lint..."
if npm run lint --prefix apps/frontend; then
    echo -e "${GREEN}✓ Frontend Lint Passed${NC}"
else
    echo -e "${RED}✗ Frontend Lint Failed${NC}"
    exit 1
fi

# 3. Unit Tests
echo -e "\n${YELLOW}[3/5] Running Unit Tests...${NC}"

echo ">> Backend Unit Tests..."
if npm run test:unit --prefix apps/backend; then
    echo -e "${GREEN}✓ Backend Unit Tests Passed${NC}"
else
    echo -e "${RED}✗ Backend Unit Tests Failed${NC}"
    exit 1
fi

echo ">> Frontend Unit Tests..."
if npm run test:unit --prefix apps/frontend; then
    echo -e "${GREEN}✓ Frontend Unit Tests Passed${NC}"
else
    echo -e "${RED}✗ Frontend Unit Tests Failed${NC}"
    exit 1
fi

# 4. Integration Tests
echo -e "\n${YELLOW}[4/5] Running Integration Tests...${NC}"

echo ">> Backend Integration Tests..."
if npm run test:integration --prefix apps/backend; then
    echo -e "${GREEN}✓ Backend Integration Tests Passed${NC}"
else
    echo -e "${RED}✗ Backend Integration Tests Failed${NC}"
    exit 1
fi

echo ">> Frontend E2E Tests (Integration)..."
# Ensure Playwright browsers are installed
echo "Ensuring Playwright browsers are installed..."
playwright install

if npm run test:e2e --prefix apps/frontend; then
    echo -e "${GREEN}✓ Frontend E2E Tests Passed${NC}"
else
    echo -e "${RED}✗ Frontend E2E Tests Failed${NC}"
    exit 1
fi

# 5. Execution (Docker or Local)
echo -e "\n${YELLOW}[5/5] Execution...${NC}"

if command -v docker &> /dev/null; then
    echo -e "${GREEN}Docker found. Running via Docker Compose...${NC}"
    echo "Building and starting containers..."
    echo "Press Ctrl+C to stop and cleanup."
    npm run docker:up
else
    echo -e "${YELLOW}Docker not found. Falling back to local development server...${NC}"
    echo "Starting local dev server..."
    echo "Press Ctrl+C to stop and cleanup."
    npm run start:dev
fi

exit 0
