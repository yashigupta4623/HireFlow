#!/bin/bash

echo "🚀 Setting up TalentVoice..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo "✅ npm found: $(npm --version)"
echo ""

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your API keys."
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
echo "This may take a few minutes..."
echo ""

npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend dependencies installation failed"
    exit 1
fi

cd client
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend dependencies installation failed"
    exit 1
fi

cd ..

echo ""
echo "✅ All dependencies installed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Edit .env file with your API keys:"
echo "   - AGORA_APP_ID (get from agora.io)"
echo "   - AGORA_APP_CERTIFICATE (get from agora.io)"
echo "   - OPENAI_API_KEY (optional, get from platform.openai.com)"
echo ""
echo "2. Run the application:"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 Documentation:"
echo "   - QUICK_START.md - Quick setup guide"
echo "   - README.md - Full documentation"
echo "   - HACKATHON_DOCS.md - Technical details"
echo ""
echo "🎉 Setup complete! Happy recruiting!"
