#!/bin/bash

echo "========================================"
echo "  AI Code Platform Frontend Launcher"
echo "========================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js version:"
node --version

echo
echo "Checking if dependencies are installed..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies"
        exit 1
    fi
else
    echo "Dependencies already installed."
fi

echo
echo "Starting the development server..."
echo
echo "The application will open at: http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo

npm start