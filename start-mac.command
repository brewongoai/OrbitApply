#!/bin/bash

# Change to the folder where this script lives
cd "$(dirname "$0")"

echo ""
echo " ====================================================="
echo "   OrbitApply — AI Job Search Assistant"
echo " ====================================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo " [ERROR] Node.js is not installed."
    echo ""
    echo " Please download and install Node.js from:"
    echo " https://nodejs.org"
    echo ""
    echo " After installing, double-click this file again."
    echo ""
    read -p " Press Enter to close..."
    exit 1
fi

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo " [ERROR] pnpm is not installed."
    echo ""
    echo " Open Terminal and run:"
    echo " npm install -g pnpm"
    echo ""
    echo " Then double-click this file again."
    echo ""
    read -p " Press Enter to close..."
    exit 1
fi

# Check .env
if [ ! -f ".env" ]; then
    echo " [ERROR] .env file not found."
    echo ""
    echo " You need to create a .env file with your API keys."
    echo " Please follow the setup guide: OrbitApplySetup.md"
    echo ""
    read -p " Press Enter to close..."
    exit 1
fi

# Install dependencies if missing
if [ ! -d "node_modules" ]; then
    echo " Installing app components for the first time..."
    echo " This may take 1-3 minutes. Please wait."
    echo ""
    pnpm install
    echo ""
fi

echo " Starting OrbitApply..."
echo " Opening your browser in 4 seconds..."
echo ""
echo " To stop the app: close this window or press Ctrl+C"
echo ""

# Open browser after 4 second delay
(sleep 4 && open http://localhost:3000) &

node index.js

echo ""
echo " OrbitApply has stopped."
read -p " Press Enter to close..."
