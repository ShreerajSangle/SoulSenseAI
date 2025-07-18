#!/bin/bash

# SoulSense AI - Local Setup Verification Script
# This script tests that everything is working correctly

echo "🔍 SoulSense AI - Setup Verification"
echo "===================================="
echo

# Function to check if URL is accessible
check_url() {
    local url=$1
    local name=$2
    
    if curl -s --max-time 5 "$url" > /dev/null; then
        echo "✅ $name: $url"
        return 0
    else
        echo "❌ $name: $url (not accessible)"
        return 1
    fi
}

# Function to check if API returns expected data
check_api() {
    local url=$1
    local expected=$2
    local name=$3
    
    response=$(curl -s --max-time 5 "$url" 2>/dev/null)
    if [[ $response == *"$expected"* ]]; then
        echo "✅ $name API: Working"
        return 0
    else
        echo "❌ $name API: Not working"
        return 1
    fi
}

echo "Testing local SoulSense AI setup..."
echo

# Test 1: Check if main application is running
if check_url "http://localhost:5000" "Main Application"; then
    
    # Test 2: Check API endpoints
    check_api "http://localhost:5000/api/personas" "sarah" "Personas"
    
    # Test 3: Check if frontend is serving
    check_url "http://localhost:5000/static/" "Static Assets"
    
    echo
    echo "🎯 Setup Verification Summary:"
    echo "================================"
    
    # Test frontend content
    if curl -s http://localhost:5000 | grep -q "SoulSense"; then
        echo "✅ Homepage loads correctly"
    else
        echo "❌ Homepage content issue"
    fi
    
    # Test personas API
    personas_response=$(curl -s http://localhost:5000/api/personas 2>/dev/null)
    persona_count=$(echo "$personas_response" | grep -o '"id"' | wc -l)
    
    if [ "$persona_count" -eq 4 ]; then
        echo "✅ All 4 personas available (Sarah, Alex, Marcus, Maya)"
    else
        echo "❌ Personas not properly configured ($persona_count found)"
    fi
    
    # Check .env configuration
    if [ -f ".env" ]; then
        if grep -q "OPENROUTER_API_KEY=your_openrouter_api_key_here" .env; then
            echo "⚠️  OpenRouter API key not configured (AI chat won't work)"
        else
            echo "✅ Environment configuration looks good"
        fi
    else
        echo "❌ .env file missing"
    fi
    
    echo
    echo "🚀 Next Steps:"
    echo "1. Visit http://localhost:5000 to see the homepage"
    echo "2. Click on a persona card to test chat"
    echo "3. Configure OpenRouter API key in .env for AI responses"
    
else
    echo
    echo "❌ SoulSense AI is not running on http://localhost:5000"
    echo
    echo "To start the application:"
    echo "1. Run: npm run dev"
    echo "2. Or run: ./run_local.sh"
    echo "3. Or run: python3 start_local.py"
fi

echo