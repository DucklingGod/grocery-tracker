// Language Translations
const translations = {
  en: {
    // Header & Navigation
    appTitle: "🛒 Grocery Tracker",
    navDashboard: "📊 Dashboard",
    navQuickAdd: "➕ Quick Add",
    navWeekLog: "📋 Week Log",
    navPantry: "🥫 Pantry",
    navWaste: "🗑 Waste Log",
    navAI: "🤖 AI Assistant",
    navSettings: "⚙️ Settings",
    
    // Dashboard
    quickActions: "🎯 Quick Actions",
    addNewItem: "Add New Item",
    viewPantry: "View Pantry",
    viewExpiring: "View Expiring Items",
    viewResupply: "View Resupply Needs",
    
    // Dashboard - additional
    keyMetrics: "📊 Key Metrics (Last 7 days)",
    toResupply: "🔄 To Resupply",
    lowStockItems: "Low stock items",
    expiringSoonLabel: "⚠️ Expiring Soon",
    daysRemaining: "≤3 days remaining",
    cookingCost: "🍳 Cooking Cost",
    thisWeek: "฿ this week",
    shoppingTotal: "🛒 Shopping Total",
    wasteValue: "🗑 Waste Value",
    viewResupplyItems: "View Items to Resupply",
    
    // Messages & Actions
    clickToView: "Click to view items",
    
    // KPIs - complete translations
    totalItems: "Total Items",
    lowStock: "Low Stock",
    expiringSoon: "Expiring Soon",
    totalValue: "Total Value",
    thisWeekSpent: "This Week Spent",
    wasteThisWeek: "Waste This Week",
    items: "items",
    
    // Charts & Sections
    spendingByCategory: "Spending by Category",
    recentActivity: "Recent Activity",
    expiringItems: "Expiring Items",
    resupplyNeeded: "Resupply Needed",
    wasteByCategory: "Waste by Category",
    
    // Actions
    buy: "Buy",
    use: "Use",
    waste: "Waste",
    adjust: "Adjust",
    
    // Quick Add Form
    quickAddTitle: "Quick Add Transaction",
    action: "Action",
    selectAction: "Select action...",
    item: "Item",
    itemPlaceholder: "e.g., Milk, Eggs, Rice...",
    category: "Category",
    selectCategory: "Select category...",
    quantity: "Quantity",
    unit: "Unit",
    price: "Price",
    optional: "optional",
    purchaseDate: "Purchase Date",
    expirationDate: "Expiration Date",
    usedQuantity: "Used Quantity",
    wastedQuantity: "Wasted Quantity",
    wasteReason: "Waste Reason",
    wasteReasonPlaceholder: "e.g., Spoiled, Expired...",
    disposedDate: "Disposed Date",
    adjustmentReason: "Adjustment Reason",
    adjustmentPlaceholder: "e.g., Found extra, Miscounted...",
    submitButton: "Submit",
    
    // Categories
    vegetables: "Vegetables",
    fruits: "Fruits",
    meat: "Meat",
    dairy: "Dairy",
    grains: "Grains",
    snacks: "Snacks",
    beverages: "Beverages",
    condiments: "Condiments",
    other: "Other",
    
    // Units
    kg: "kg",
    g: "g",
    l: "L",
    ml: "ml",
    pcs: "pcs",
    pack: "pack",
    bottle: "bottle",
    can: "can",
    
    // Week Log
    weekLogTitle: "Week Log",
    filterByAction: "Filter by action:",
    all: "All",
    searchPlaceholder: "Search items...",
    noTransactions: "No transactions found",
    totalSpent: "Total Spent",
    totalWaste: "Total Waste",
    
    // Pantry
    pantryTitle: "Pantry Inventory",
    onHand: "On Hand",
    threshold: "Threshold",
    expires: "Expires",
    noPantryItems: "No pantry items found",
    
    // Waste Log
    wasteLogTitle: "Waste Log",
    reason: "Reason",
    disposed: "Disposed",
    noWasteRecords: "No waste records found",
    
    // AI Assistant
    aiTitle: "AI Assistant",
    aiSetupTitle: "Setup OpenAI API Key",
    apiKeyLabel: "OpenAI API Key",
    apiKeyPlaceholder: "Enter your OpenAI API key...",
    saveApiKey: "Save API Key",
    aiGreeting: `👋 **Hello! I'm your Grocery Assistant**

I can help you with:
- **Recipe Ideas** - Suggest dishes based on your pantry items
- **Shopping Lists** - Create lists from your inventory needs
- **Meal Planning** - Plan meals for the week
- **Reduce Waste** - Tips on using items before they expire
- **Answer Questions** - About your pantry, purchases, or waste log

Just type your question or use the quick prompts below! 🍳`,
    typePlaceholder: "Type your message...",
    send: "Send",
    clearChat: "Clear Chat",
    quickPrompts: "Quick Prompts:",
    recipeIdeas: "Recipe Ideas",
    shoppingList: "Shopping List",
    mealPlan: "Meal Plan",
    reduceWaste: "Reduce Waste",
    expiringTips: "Expiring Tips",
    
    // Barcode Scanner
    scanBarcode: "Scan Barcode",
    pointCamera: "📱 Point camera at barcode",
    barcodeDetected: "✓ Barcode detected",
    productFound: "✓ Product found",
    cameraAccessDenied: "❌ Camera access denied. Please allow camera permissions.",
    cameraNotSupported: "❌ Camera not supported on this device",
    barcodeScanned: "✓ Barcode scanned. Please enter product details.",
    
    // Settings
    settingsTitle: "Settings",
    languageSection: "Language / ภาษา",
    languageLabel: "App Language",
    selectLanguage: "Select language...",
    english: "English",
    thai: "ไทย Thai",
    firebaseSection: "Firebase Sync",
    householdCode: "Household Code",
    householdPlaceholder: "Enter your household code...",
    saveHousehold: "Save Household Code",
    dataSection: "Data Management",
    exportData: "Export Data",
    importData: "Import Data",
    clearAllData: "Clear All Data",
    
    // Messages
    success: "Success",
    error: "Error",
    confirmClear: "Are you sure you want to clear all data? This cannot be undone!",
    confirmClearChat: "Clear chat history?",
    chatCleared: "✓ Chat cleared",
    apiKeySaved: "✓ OpenAI API key saved",
    householdSaved: "✓ Household code saved",
    languageChanged: "✓ Language changed",
    dataExported: "✓ Data exported",
    dataImported: "✓ Data imported",
    allDataCleared: "✓ All data cleared",
  },
  
  th: {
    // Header & Navigation
    appTitle: "🛒 ติดตามของชำ",
    navDashboard: "📊 แดชบอร์ด",
    navQuickAdd: "➕ เพิ่มรายการ",
    navWeekLog: "📋 บันทึกสัปดาห์",
    navPantry: "🥫 คลังสินค้า",
    navWaste: "🗑 บันทึกของเสีย",
    navAI: "🤖 ผู้ช่วย AI",
    navSettings: "⚙️ ตั้งค่า",
    
    // Dashboard
    quickActions: "🎯 เมนูด่วน",
    addNewItem: "เพิ่มรายการใหม่",
    viewPantry: "ดูคลังสินค้า",
    viewExpiring: "ดูของใกล้หมดอายุ",
    viewResupply: "ดูของที่ต้องเติม",
    
    // Dashboard - additional
    keyMetrics: "📊 ตัวชี้วัดหลัก (7 วันที่ผ่านมา)",
    toResupply: "🔄 ต้องเติมสินค้า",
    lowStockItems: "รายการสต็อกต่ำ",
    expiringSoonLabel: "⚠️ ใกล้หมดอายุ",
    daysRemaining: "≤3 วันที่เหลือ",
    cookingCost: "🍳 ค่าทำอาหาร",
    thisWeek: "฿ สัปดาห์นี้",
    shoppingTotal: "🛒 ยอดช้อปปิ้ง",
    wasteValue: "🗑 มูลค่าของเสีย",
    viewResupplyItems: "ดูรายการที่ต้องเติม",
    
    // Messages & Actions
    clickToView: "คลิกเพื่อดูรายการ",
    
    // KPIs
    totalItems: "รายการทั้งหมด",
    lowStock: "สต็อกต่ำ",
    expiringSoon: "ใกล้หมดอายุ",
    totalValue: "มูลค่ารวม",
    thisWeekSpent: "ค่าใช้จ่ายสัปดาห์นี้",
    wasteThisWeek: "ของเสียสัปดาห์นี้",
    items: "รายการ",
    
    // Charts & Sections
    spendingByCategory: "ค่าใช้จ่ายแยกตามหมวดหมู่",
    recentActivity: "กิจกรรมล่าสุด",
    expiringItems: "ของใกล้หมดอายุ",
    resupplyNeeded: "ต้องเติมสินค้า",
    wasteByCategory: "ของเสียแยกตามหมวดหมู่",
    
    // Actions
    buy: "ซื้อ",
    use: "ใช้",
    waste: "ทิ้ง",
    adjust: "ปรับปรุง",
    
    // Quick Add Form
    quickAddTitle: "เพิ่มรายการอย่างรวดเร็ว",
    action: "การกระทำ",
    selectAction: "เลือกการกระทำ...",
    item: "รายการ",
    itemPlaceholder: "เช่น นม ไข่ ข้าว...",
    category: "หมวดหมู่",
    selectCategory: "เลือกหมวดหมู่...",
    quantity: "จำนวน",
    unit: "หน่วย",
    price: "ราคา",
    optional: "ไม่บังคับ",
    purchaseDate: "วันที่ซื้อ",
    expirationDate: "วันหมดอายุ",
    usedQuantity: "จำนวนที่ใช้",
    wastedQuantity: "จำนวนที่ทิ้ง",
    wasteReason: "เหตุผลที่ทิ้ง",
    wasteReasonPlaceholder: "เช่น เน่าเสีย หมดอายุ...",
    disposedDate: "วันที่ทิ้ง",
    adjustmentReason: "เหตุผลที่ปรับปรุง",
    adjustmentPlaceholder: "เช่น เจอของเพิ่ม นับผิด...",
    submitButton: "บันทึก",
    
    // Categories
    vegetables: "ผัก",
    fruits: "ผลไม้",
    meat: "เนื้อสัตว์",
    dairy: "นมและผลิตภัณฑ์",
    grains: "ธัญพืช",
    snacks: "ขนม",
    beverages: "เครื่องดื่ม",
    condiments: "เครื่องปรุง",
    other: "อื่นๆ",
    
    // Units
    kg: "กก.",
    g: "กรัม",
    l: "ลิตร",
    ml: "มล.",
    pcs: "ชิ้น",
    pack: "แพ็ค",
    bottle: "ขวด",
    can: "กระป๋อง",
    
    // Week Log
    weekLogTitle: "บันทึกสัปดาห์",
    filterByAction: "กรองตามการกระทำ:",
    all: "ทั้งหมด",
    searchPlaceholder: "ค้นหารายการ...",
    noTransactions: "ไม่พบรายการ",
    totalSpent: "ค่าใช้จ่ายรวม",
    totalWaste: "ของเสียรวม",
    
    // Pantry
    pantryTitle: "คลังสินค้า",
    onHand: "คงเหลือ",
    threshold: "เกณฑ์ขั้นต่ำ",
    expires: "หมดอายุ",
    noPantryItems: "ไม่มีรายการในคลัง",
    
    // Waste Log
    wasteLogTitle: "บันทึกของเสีย",
    reason: "เหตุผล",
    disposed: "ทิ้งเมื่อ",
    noWasteRecords: "ไม่มีบันทึกของเสีย",
    
    // AI Assistant
    aiTitle: "ผู้ช่วย AI",
    aiSetupTitle: "ตั้งค่า OpenAI API Key",
    apiKeyLabel: "OpenAI API Key",
    apiKeyPlaceholder: "ใส่ OpenAI API key ของคุณ...",
    saveApiKey: "บันทึก API Key",
    aiGreeting: `👋 **สวัสดีค่ะ! ฉันคือผู้ช่วยของชำของคุณ**

ฉันสามารถช่วยคุณได้ใน:
- **ไอเดียเมนูอาหาร** - แนะนำเมนูจากวัตถุดิบในคลังของคุณ
- **รายการช้อปปิ้ง** - สร้างรายการซื้อของจากสต็อกที่ต้องเติม
- **วางแผนมื้ออาหาร** - วางแผนเมนูสำหรับสัปดาห์
- **ลดของเสีย** - คำแนะนำในการใช้ของก่อนหมดอายุ
- **ตอบคำถาม** - เกี่ยวกับคลัง การซื้อ หรือของเสียของคุณ

พิมพ์คำถามของคุณ หรือใช้ปุ่มด่วนด้านล่าง! 🍳`,
    typePlaceholder: "พิมพ์ข้อความของคุณ...",
    send: "ส่ง",
    clearChat: "ล้างแชท",
    quickPrompts: "คำถามด่วน:",
    recipeIdeas: "ไอเดียเมนู",
    shoppingList: "รายการซื้อ",
    mealPlan: "แผนมื้ออาหาร",
    reduceWaste: "ลดของเสีย",
    expiringTips: "ของใกล้หมดอายุ",
    
    // Barcode Scanner
    scanBarcode: "สแกนบาร์โค้ด",
    pointCamera: "📱 ชี้กล้องไปที่บาร์โค้ด",
    barcodeDetected: "✓ ตรวจพบบาร์โค้ด",
    productFound: "✓ พบสินค้า",
    cameraAccessDenied: "❌ ไม่อนุญาตให้เข้าถึงกล้อง กรุณาอนุญาตการเข้าถึงกล้อง",
    cameraNotSupported: "❌ อุปกรณ์นี้ไม่รองรับกล้อง",
    barcodeScanned: "✓ สแกนบาร์โค้ดแล้ว กรุณากรอกรายละเอียดสินค้า",
    
    // Settings
    settingsTitle: "ตั้งค่า",
    languageSection: "Language / ภาษา",
    languageLabel: "ภาษาแอป",
    selectLanguage: "เลือกภาษา...",
    english: "English อังกฤษ",
    thai: "ไทย Thai",
    firebaseSection: "ซิงค์ข้อมูล Firebase",
    householdCode: "รหัสครัวเรือน",
    householdPlaceholder: "ใส่รหัสครัวเรือนของคุณ...",
    saveHousehold: "บันทึกรหัสครัวเรือน",
    dataSection: "จัดการข้อมูล",
    exportData: "ส่งออกข้อมูล",
    importData: "นำเข้าข้อมูล",
    clearAllData: "ล้างข้อมูลทั้งหมด",
    
    // Messages
    success: "สำเร็จ",
    error: "ผิดพลาด",
    confirmClear: "คุณแน่ใจหรือว่าต้องการล้างข้อมูลทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้!",
    confirmClearChat: "ล้างประวัติการแชท?",
    chatCleared: "✓ ล้างแชทแล้ว",
    apiKeySaved: "✓ บันทึก API key แล้ว",
    householdSaved: "✓ บันทึกรหัสครัวเรือนแล้ว",
    languageChanged: "✓ เปลี่ยนภาษาแล้ว",
    dataExported: "✓ ส่งออกข้อมูลแล้ว",
    dataImported: "✓ นำเข้าข้อมูลแล้ว",
    allDataCleared: "✓ ล้างข้อมูลทั้งหมดแล้ว",
  }
};

// Get current language from localStorage or default to English
function getCurrentLanguage() {
  return localStorage.getItem('appLanguage') || 'en';
}

// Set language
function setLanguage(lang) {
  localStorage.setItem('appLanguage', lang);
  updateUI();
}

// Get translation
function t(key) {
  const lang = getCurrentLanguage();
  return translations[lang][key] || translations.en[key] || key;
}

// Update all UI text with current language
function updateUI() {
  const lang = getCurrentLanguage();
  
  // Update document language attribute
  document.documentElement.lang = lang;
  
  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = translations[lang][key];
    if (translation) {
      // Check if it's a placeholder
      if (el.placeholder !== undefined) {
        el.placeholder = translation;
      } else {
        el.textContent = translation;
      }
    }
  });
  
  // Update select options
  document.querySelectorAll('[data-i18n-options]').forEach(select => {
    Array.from(select.options).forEach(option => {
      const key = option.getAttribute('data-i18n');
      if (key) {
        option.textContent = translations[lang][key];
      }
    });
  });
  
  // Update KPI labels dynamically
  const kpiTranslations = {
    '🔄 To Resupply': t('toResupply'),
    '⚠️ Expiring Soon': t('expiringSoonLabel'),
    '🍳 Cooking Cost': t('cookingCost'),
    '🛒 Shopping Total': t('shoppingTotal'),
    '🗑️ Waste Items': t('wasteValue'),
    'Low stock items': t('lowStockItems'),
    '≤3 days remaining': t('daysRemaining'),
    '฿ this week': t('thisWeek'),
    'entries': lang === 'th' ? 'รายการ' : 'entries',
    'items': t('items'),
    'Click to view items': t('clickToView'),
    '📊 Key Metrics (Last 7 days)': t('keyMetrics'),
    'Spending by Category': t('spendingByCategory'),
    'Recent Activity': t('recentActivity'),
    'Expiring Items': t('expiringItems'),
    'Resupply Needed': t('resupplyNeeded'),
    'Waste by Category': t('wasteByCategory')
  };
  
  // Apply KPI translations
  document.querySelectorAll('.kpi-label, .kpi-trend, h3').forEach(el => {
    const text = el.textContent.trim();
    if (kpiTranslations[text]) {
      el.textContent = kpiTranslations[text];
    }
  });
  
  // Update title attributes
  document.querySelectorAll('[title]').forEach(el => {
    const title = el.getAttribute('title');
    if (kpiTranslations[title]) {
      el.setAttribute('title', kpiTranslations[title]);
    }
  });
}
