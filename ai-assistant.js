// AI Assistant for Grocery Tracker
// Uses OpenAI GPT-4o-mini API

class GroceryAI {
  constructor() {
    // Try to get API key from config first, then localStorage, then empty
    this.apiKey = (window.APP_CONFIG && window.APP_CONFIG.OPENAI_API_KEY) 
                  || localStorage.getItem('openaiApiKey') 
                  || '';
    this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-4o-mini'; // Using real GPT-4o-mini model
    this.conversationHistory = [];
  }

  setApiKey(key) {
    this.apiKey = key;
    localStorage.setItem('openaiApiKey', key);
  }

  async getContextData() {
    // Get all relevant data from IndexedDB
    const weeklog = await getAll('weeklog');
    const pantry = await getAll('pantry');
    
    // Filter and summarize data
    const pantryItems = pantry.map(p => ({
      item: p.item,
      quantity: p.onHand,
      unit: p.unit,
      category: p.category,
      expiration: p.expirationDate,
      threshold: p.threshold
    }));
    
    const recentPurchases = weeklog
      .filter(w => w.actionType === 'Buy')
      .slice(-20)
      .map(w => ({
        item: w.item,
        date: w.purchaseDate,
        quantity: w.boughtQty,
        price: w.totalPrice
      }));
    
    const wasteItems = weeklog
      .filter(w => w.actionType === 'Waste' && w.wastedQty > 0)
      .slice(-20)
      .map(w => ({
        item: w.item,
        quantity: w.wastedQty,
        reason: w.wasteReason,
        date: w.disposedDate
      }));
    
    return {
      pantry: pantryItems,
      recentPurchases,
      waste: wasteItems,
      currentDate: new Date().toISOString().slice(0, 10)
    };
  }

  async chat(userMessage) {
    if (!this.apiKey) {
      throw new Error('API key is not set');
    }

    // Get current grocery data
    const context = await this.getContextData();
    
    // Build system prompt with context
    const systemPrompt = `You are a helpful grocery and cooking assistant for a Thai household. You have access to the user's:

CURRENT PANTRY INVENTORY:
${JSON.stringify(context.pantry, null, 2)}

RECENT PURCHASES (last 20):
${JSON.stringify(context.recentPurchases, null, 2)}

RECENT WASTE (last 20):
${JSON.stringify(context.waste, null, 2)}

Current Date: ${context.currentDate}

You can help with:
- Suggesting recipes based on available ingredients
- Creating shopping lists
- Analyzing waste patterns and suggesting improvements
- Answering questions about their grocery data
- Recommending dishes using items close to expiration
- Thai and international cuisine suggestions

Be helpful, concise, and practical. Use Thai ingredient names when appropriate. When suggesting recipes, format them nicely with ingredients and steps.`;

    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    // Keep only last 6 messages (3 exchanges) to avoid token limits
    if (this.conversationHistory.length > 6) {
      this.conversationHistory = this.conversationHistory.slice(-6);
    }

    try {
      console.log('🤖 Sending request to OpenAI...', {
        endpoint: this.apiEndpoint,
        model: this.model,
        hasApiKey: !!this.apiKey,
        apiKeyStart: this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'none'
      });

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...this.conversationHistory
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ API Error:', error);
        throw new Error(error.error?.message || 'API request failed');
      }

      const data = await response.json();
      console.log('✅ API Response:', data);
      const assistantMessage = data.choices[0].message.content;

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      });

      return assistantMessage;

    } catch (error) {
      console.error('AI Chat Error:', error);
      throw error;
    }
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

// Global instance
let groceryAI = null;

// Initialize AI assistant
function initAI() {
  groceryAI = new GroceryAI();
  console.log('🤖 AI Assistant initialized');
}

// UI Handlers
async function sendAIMessage() {
  const input = document.getElementById('aiInput');
  const chatBox = document.getElementById('aiChatBox');
  const sendBtn = document.getElementById('aiSendBtn');
  
  const message = input.value.trim();
  if (!message) return;

  // Disable input during request
  input.disabled = true;
  sendBtn.disabled = true;
  
  // Add user message to chat
  appendAIMessage('user', message);
  input.value = '';

  try {
    // Show typing indicator
    const typingId = appendAIMessage('assistant', '⏳ Thinking...');
    
    // Get AI response
    const response = await groceryAI.chat(message);
    
    // Remove typing indicator and add real response
    document.getElementById(typingId).remove();
    appendAIMessage('assistant', response);

  } catch (error) {
    appendAIMessage('error', '❌ Error: ' + error.message);
  } finally {
    // Re-enable input
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
  }
}

function appendAIMessage(type, content) {
  const chatBox = document.getElementById('aiChatBox');
  const messageId = 'msg-' + Date.now();
  
  const bgColor = type === 'user' ? '#2563eb' : type === 'error' ? '#dc2626' : '#374151';
  const align = type === 'user' ? 'flex-end' : 'flex-start';
  
  const messageEl = document.createElement('div');
  messageEl.id = messageId;
  messageEl.style.cssText = `display:flex;justify-content:${align};margin-bottom:12px;animation:slideIn 0.3s ease`;
  
  messageEl.innerHTML = `
    <div style="max-width:80%;background:${bgColor};padding:12px 16px;border-radius:12px;color:#fff;font-size:14px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word">
      ${content.replace(/\n/g, '<br>')}
    </div>
  `;
  
  chatBox.appendChild(messageEl);
  chatBox.scrollTop = chatBox.scrollHeight;
  
  return messageId;
}

function clearAIChat() {
  if (confirm('Clear chat history?')) {
    document.getElementById('aiChatBox').innerHTML = '';
    groceryAI.clearHistory();
    showToast('✓ Chat cleared', 'info');
  }
}

function saveGroqApiKey() {
  const input = document.getElementById('groqApiKeyInput');
  const key = input.value.trim();
  
  if (!key) {
    showToast('❌ Please enter an API key', 'error');
    return;
  }
  
  groceryAI.setApiKey(key);
  showToast('✓ OpenAI API key saved', 'success');
  
  // Hide setup, show chat
  document.getElementById('aiSetup').style.display = 'none';
  document.getElementById('aiChatInterface').style.display = 'block';
}

// Initialize on app load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure config.js is fully loaded
    setTimeout(() => {
      initAI();
      
      // Check if API key is available from config or localStorage
      const hasKey = (window.APP_CONFIG && window.APP_CONFIG.OPENAI_API_KEY) 
                     || localStorage.getItem('openaiApiKey');
      
      console.log('🔑 API Key check:', {
        hasConfig: !!(window.APP_CONFIG && window.APP_CONFIG.OPENAI_API_KEY),
        hasLocalStorage: !!localStorage.getItem('openaiApiKey'),
        hasKey: hasKey
      });
      
      if (hasKey) {
        document.getElementById('aiSetup').style.display = 'none';
        document.getElementById('aiChatInterface').style.display = 'block';
      } else {
        document.getElementById('aiSetup').style.display = 'block';
        document.getElementById('aiChatInterface').style.display = 'none';
      }
    }, 100);
  });
}
