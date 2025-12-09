#!/bin/bash

# Deployment Script for CISSP Exam Prep
# This script prepares your code for deployment

echo "🚀 CISSP Exam Prep - Deployment Preparation"
echo "=========================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
    echo "✅ Git initialized"
    echo ""
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Staging all files..."
    git add .
    echo "✅ Files staged"
    echo ""
    
    echo "💾 Creating commit..."
    git commit -m "Initial commit - CISSP Exam Prep MVP"
    echo "✅ Commit created"
    echo ""
else
    echo "✅ All changes already committed"
    echo ""
fi

echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Create a GitHub repository:"
echo "   - Go to https://github.com/new"
echo "   - Name it: cissp-exam-prep (or any name)"
echo "   - Don't initialize with README"
echo "   - Click 'Create repository'"
echo ""
echo "2. Connect and push to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
echo "   git push -u origin main"
echo ""
echo "3. Deploy to Vercel:"
echo "   - Go to https://vercel.com/new"
echo "   - Import your GitHub repository"
echo "   - Add environment variables from VERCEL_ENV_VARS.txt"
echo "   - Click 'Deploy'"
echo ""
echo "4. After deployment:"
echo "   - Update NEXT_PUBLIC_APP_URL in Vercel with your Vercel URL"
echo "   - Configure Supabase redirect URLs (see DEPLOY_NOW.md)"
echo "   - Set up Stripe webhook (see DEPLOY_NOW.md)"
echo ""
echo "📖 See DEPLOY_NOW.md for detailed instructions"
echo ""

