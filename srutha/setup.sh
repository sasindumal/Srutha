#!/bin/bash

# Srutha React Native - Installation Script
# This script helps set up the React Native Expo project

echo "🚀 Srutha React Native Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please add your YouTube API key to the .env file"
else
    echo "✅ .env file already exists"
fi

# Create assets directory if it doesn't exist
if [ ! -d assets ]; then
    echo ""
    echo "📁 Creating assets directory..."
    mkdir -p assets
    echo "✅ Assets directory created"
fi

# Check for Expo CLI
echo ""
echo "🔍 Checking for Expo CLI..."
if ! command -v expo &> /dev/null; then
    echo "⚠️  Expo CLI not found globally"
    echo "You can install it with: npm install -g expo-cli"
    echo "Or use npx: npx expo start"
else
    echo "✅ Expo CLI detected"
fi

echo ""
echo "================================"
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Add your YouTube API key to .env file"
echo "2. Update src/services/YouTubeService.ts with API calls"
echo "3. Run 'npm start' to begin development"
echo ""
echo "Commands:"
echo "  npm start      - Start development server"
echo "  npm run ios    - Run on iOS simulator"
echo "  npm run android - Run on Android emulator"
echo "  npm run web    - Run in web browser"
echo ""
echo "For more information, see SETUP_REACT_NATIVE.md"
echo "================================"
