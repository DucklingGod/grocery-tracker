# 🤖 AI Assistant Setup Guide

## Overview
The AI Assistant can help you with:
- 👨‍🍳 Recipe suggestions based on your pantry
- 🛒 Shopping list generation
- 📊 Food waste analysis
- ⏰ Items expiring soon
- 💡 Cooking and grocery advice

## Setup Instructions

### 1. Get a Free Groq API Key

1. Visit [Groq Console](https://console.groq.com/keys)
2. Sign up for a free account (no credit card required)
3. Click "Create API Key"
4. Copy your API key

### 2. Add API Key to App

1. Open the Grocery Tracker app
2. Go to "🤖 AI Assistant" tab
3. Paste your API key in the input field
4. Click "💾 Save Key"

Your API key is stored locally on your device and never shared.

## Features

### Recipe Suggestions
Ask: "What can I cook with my current pantry?"
- AI analyzes your available ingredients
- Suggests multiple recipes
- Considers expiration dates
- Thai and international cuisine

### Shopping List
Ask: "Create a shopping list for this week"
- Reviews your pantry inventory
- Suggests items to buy
- Considers your shopping patterns
- Low stock alerts

### Waste Analysis
Ask: "Analyze my food waste"
- Reviews waste patterns
- Suggests improvements
- Identifies problematic items
- Budget optimization tips

### Expiring Items
Ask: "What items are expiring soon?"
- Lists items by expiration date
- Recipe suggestions to use them
- Prevents waste

## Example Prompts

**Thai Cuisine:**
- "Suggest a Thai curry recipe with what I have"
- "What Thai dishes can I make?"
- "แนะนำเมนูอาหารไทยจากของที่มี"

**Quick Meals:**
- "Quick dinner ideas under 30 minutes"
- "Easy breakfast with my ingredients"
- "One-pot meal suggestions"

**Budget Friendly:**
- "Cheap meals for this week"
- "Use up items expiring soon"
- "Reduce my grocery spending"

**Specific Diets:**
- "Vegetarian recipes available"
- "Low-carb meal ideas"
- "Healthy dinner options"

## Technical Details

- **Model:** Llama 3.1 70B (via Groq)
- **Response Time:** ~1-2 seconds
- **Token Limit:** 1024 tokens per response
- **Context:** Last 6 messages + current data
- **Free Tier:** 30 requests/minute

## Privacy & Security

✅ API key stored locally only
✅ Data never leaves your device except API calls
✅ No conversation logging on servers
✅ Groq's privacy policy applies to API calls

## Troubleshooting

**"Please set your Groq API key"**
- Make sure you saved the API key
- Check Settings tab for saved key
- Refresh page after saving

**"API request failed"**
- Check internet connection
- Verify API key is valid
- Check Groq API status

**Slow responses**
- Normal for complex queries
- Large pantry = more processing
- Free tier has rate limits

**Inaccurate suggestions**
- AI works with available data
- Update pantry inventory regularly
- Provide detailed questions

## Limits & Usage

**Groq Free Tier:**
- 30 requests per minute
- 14,400 requests per day
- Sufficient for personal use

**Best Practices:**
- Ask specific questions
- Update pantry regularly
- Use quick prompt buttons
- Clear chat when done

## Updates & Improvements

**Planned Features:**
- Voice input
- Image recognition for ingredients
- Meal planning calendar
- Nutrition analysis
- Price comparison

## Support

For issues or suggestions:
- GitHub: DucklingGod/grocery-tracker
- Issues tab for bug reports

Enjoy your AI cooking assistant! 🎉
