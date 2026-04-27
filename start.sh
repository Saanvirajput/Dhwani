#!/bin/bash

# Dhwani (ध्वनि) — Unified Startup Script
# Starts Backend (FastAPI) and Frontend (Vite) simultaneously.

# Colors for better logging
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "  _____  _                              _ "
echo " |  __ \| |                            (_)"
echo " | |  | | |__ __      __ __ _ _ __  _  "
echo " | |  | | '_ \\ \ /\ / // _\` | '_ \| | "
echo " | |__| | | | |\ V  V /| (_| | | | | | "
echo " |_____/|_| |_| \_/\_/  \__,_|_| |_|_| "
echo -e "         Premium Sovereign AI Assistant${NC}\n"

# 1. Setup Virtual Environment
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}[System] Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# 2. Install Dependencies (Backend)
echo -e "${YELLOW}[System] Verifying backend dependencies...${NC}"
./venv/bin/pip install -q -r backend/requirements.txt gTTS sentence-transformers

# 3. Check/Prepare Data
if [ ! -f "backend/data/schemes.json" ]; then
    echo -e "${YELLOW}[Data] Schemes database not found. Loading minimal test data...${NC}"
    ./venv/bin/python scripts/minimal_setup.py
fi

if [ ! -f "backend/data/scheme_embeddings.npy" ]; then
    echo -e "${YELLOW}[Data] Precomputing embeddings...${NC}"
    ./venv/bin/python scripts/precompute_embeddings.py
fi

# 4. Start Backend
echo -e "${GREEN}[Backend] Starting FastAPI server on port 8000...${NC}"
./venv/bin/python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# 5. Start Frontend
echo -e "${GREEN}[Frontend] Starting Vite development server...${NC}"
cd frontend
npm install -q
npm run dev &
FRONTEND_PID=$!

# Handle shutdown
trap "echo -e '\n${RED}[System] Shutting down...${NC}'; kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM

echo -e "\n${CYAN}--------------------------------------------------${NC}"
echo -e "${GREEN}SUCCESS:${NC} Dhwani is now running!"
echo -e "  - Backend:  ${CYAN}http://localhost:8000${NC}"
echo -e "  - Frontend: ${CYAN}http://localhost:5173${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both servers.${NC}"
echo -e "${CYAN}--------------------------------------------------${NC}\n"

# Keep script alive to see logs
wait
