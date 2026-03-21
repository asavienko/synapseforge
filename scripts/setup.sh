#!/bin/bash
# Quick Setup Script for SynapseForge
# Usage: ./scripts/setup.sh

set -e

echo "🚀 SynapseForge Quick Setup"
echo "============================"
echo ""

# Check Node.js version
echo "📦 Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Found: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
cd web
npm install

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check for .env.local
echo ""
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found!"
    echo "   Creating from .env.example..."
    cp .env.example .env.local
    echo ""
    echo "📝 Please edit .env.local with your values:"
    echo "   - DATABASE_URL (required)"
    echo "   - NEXTAUTH_SECRET (required)"
    echo "   - NEXTAUTH_URL (required)"
    echo "   - ENCRYPTION_KEY (required)"
    echo "   - RESEND_API_KEY (required)"
    echo ""
    echo "   Then run: npm run dev"
else
    echo "✅ .env.local exists"
    
    # Check if required vars are set
    if grep -q "your-database-url" .env.local || grep -q "your-nextauth-secret" .env.local; then
        echo ""
        echo "⚠️  .env.local contains placeholder values!"
        echo "   Please edit .env.local and replace placeholders."
    else
        echo ""
        echo "🎉 Setup complete! Starting development server..."
        echo ""
        npm run dev
    fi
fi

echo ""
echo "📚 Next steps:"
echo "   1. Edit web/.env.local with your values"
echo "   2. Run: cd web && npx prisma migrate dev"
echo "   3. Run: npm run dev"
echo "   4. Open http://localhost:3000"