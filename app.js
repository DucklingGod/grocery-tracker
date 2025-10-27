// Offline Grocery Tracker — IndexedDB + SPA
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// --- Toast Notifications ---
function showToast(message, type='info'){
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:1000;display:flex;flex-direction:column;gap:12px;pointer-events:none;';
    document.body.appendChild(toastContainer);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.style.cssText = 'pointer-events:auto;';
  
  toastContainer.appendChild(toast);
  
  setTimeout(()=>{ 
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      toast.remove();
      // Remove container if empty
      if (toastContainer.children.length === 0) {
        toastContainer.remove();
      }
    }, 300);
  }, 3000);
}

// --- Success Animations ---
function showSuccessAnimation(element) {
  if (!element) return;
  
  // Add success animation class
  element.classList.add('success-animation');
  
  // Remove after animation completes
  setTimeout(() => {
    element.classList.remove('success-animation');
  }, 400);
}

function showSuccessCheckmark() {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'success-overlay';
  
  // Create checkmark
  const checkmark = document.createElement('div');
  checkmark.className = 'success-checkmark';
  checkmark.innerHTML = `
    <svg viewBox="0 0 52 52">
      <path d="M14 27l7 7 17-17"/>
    </svg>
  `;
  
  overlay.appendChild(checkmark);
  document.body.appendChild(overlay);
  
  // Remove after animation
  setTimeout(() => {
    overlay.style.animation = 'fadeIn 0.2s ease-out reverse';
    setTimeout(() => overlay.remove(), 200);
  }, 800);
}

function addRippleEffect(button) {
  if (!button) return;
  button.classList.add('btn-ripple');
}

function addSuccessStateToInput(input) {
  if (!input) return;
  
  input.classList.add('input-success');
  
  setTimeout(() => {
    input.classList.remove('input-success');
  }, 600);
}

function animateFormSuccess(form) {
  if (!form) return;
  
  // Animate all inputs
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach((input, index) => {
    setTimeout(() => {
      addSuccessStateToInput(input);
    }, index * 50);
  });
  
  // Show checkmark
  showSuccessCheckmark();
  
  // Pulse the form
  form.classList.add('success-animation');
  setTimeout(() => {
    form.classList.remove('success-animation');
  }, 400);
}

// --- Keyboard Shortcuts ---
document.addEventListener('keydown', (e)=>{
  // Alt + 1-6 for quick navigation
  if(e.altKey && !e.ctrlKey && !e.shiftKey){
    const views = ['dashboard','quickadd','weeklog','pantry','waste','settings'];
    const num = parseInt(e.key);
    if(num >= 1 && num <= 6){
      e.preventDefault();
      const view = views[num-1];
      $$('.nav-btn').forEach(b=>{
        if(b.getAttribute('data-view')===view){
          b.click();
        }
      });
    }
  }
  // Ctrl + S to save form (when in Quick Add)
  if(e.ctrlKey && e.key === 's' && !e.shiftKey && !e.altKey){
    const quickForm = $('#quickForm');
    if(quickForm && !quickForm.classList.contains('hidden')){
      e.preventDefault();
      quickForm.requestSubmit();
    }
  }
});

// --- Hamburger Menu Toggle ---
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('open');
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('open') && 
        !navMenu.contains(e.target) && 
        !hamburger.contains(e.target)) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('open');
    }
  });
  
  // Close menu when clicking a nav button
  $$('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('open');
    });
  });
}

// --- SPA nav ---
$$('.nav-btn').forEach(btn=>btn.addEventListener('click',()=>{
  $$('.nav-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const v = btn.getAttribute('data-view');
  $$('.view').forEach(x=>x.classList.remove('active'));
  $('#view-'+v).classList.add('active');
  
  // Save current view to localStorage
  localStorage.setItem('lastActiveView', v);
  
  if(v==='dashboard') renderDashboard();
  if(v==='weeklog') renderWeekLog();
  if(v==='pantry') renderPantry();
  if(v==='waste') renderWaste();
  if(v==='ai') {
    // Show greeting if chat is empty
    const chatBox = document.getElementById('aiChatBox');
    if(chatBox && chatBox.children.length === 0 && typeof showGreeting === 'function'){
      showGreeting();
    }
  }
}));

// --- Conditional Form Fields ---
$('#qaAction').addEventListener('change', (e)=>{
  const action = e.target.value;
  // Hide all conditional fields
  ['buyFields','buyFields2','buyFields3','useFields','wasteFields'].forEach(id=>{
    const el = $('#'+id);
    if(el) el.classList.add('hidden');
  });
  // Show relevant fields
  if(action==='Buy'){
    $('#buyFields').classList.remove('hidden');
    $('#buyFields2').classList.remove('hidden');
    $('#buyFields3').classList.remove('hidden');
  } else if(action==='Use'){
    $('#useFields').classList.remove('hidden');
  } else if(action==='Waste'){
    $('#wasteFields').classList.remove('hidden');
  }
});

// --- Auto-calculate Price per Unit ---
function calculatePricePerUnit(){
  const qty = parseFloat($('#qaBought').value) || 0;
  const total = parseFloat($('#qaTotalPrice').value) || 0;
  if(qty > 0 && total > 0){
    const pricePerUnit = total / qty;
    $('#qaPrice').value = pricePerUnit.toFixed(2);
  } else {
    $('#qaPrice').value = '';
  }
}
$('#qaBought').addEventListener('input', calculatePricePerUnit);
$('#qaTotalPrice').addEventListener('input', calculatePricePerUnit);

// --- Item Autocomplete & Smart Defaults ---
let knownItems = {};
$('#qaItem').addEventListener('input', async (e)=>{
  const term = e.target.value.toLowerCase();
  if(term.length < 2) return;
  
  // Get all items from pantry and weeklog
  const pantry = await getAll('pantry');
  const weeklog = await getAll('weeklog');
  const allItems = [...new Set([...pantry.map(p=>p.item), ...weeklog.map(w=>w.item)])];
  
  // Update datalist
  const datalist = $('#itemSuggestions');
  datalist.innerHTML = allItems
    .filter(item => item && item.toLowerCase().includes(term))
    .slice(0, 10)
    .map(item => `<option value="${item}"></option>`)
    .join('');
});

// Auto-fill from pantry when item is selected
$('#qaItem').addEventListener('change', async (e)=>{
  const itemName = e.target.value.trim();
  if(!itemName) return;
  
  // Check if user manually changed the item name after scanning
  const lastScannedBarcode = sessionStorage.getItem('lastScannedBarcode');
  if (lastScannedBarcode) {
    // Check if the original name was generic (contained barcode)
    const wasGeneric = itemName.includes('สินค้า') || /^\d{8,}$/.test(itemName);
    
    // If user changed it to a real name, learn this mapping immediately
    if (!wasGeneric && !itemName.includes(lastScannedBarcode)) {
      const category = $('#qaCategory').value || null;
      const unit = $('#qaUnit').value || null;
      
      const savedProducts = JSON.parse(localStorage.getItem('scannedProducts') || '{}');
      savedProducts[lastScannedBarcode] = { name: itemName, category, unit };
      localStorage.setItem('scannedProducts', JSON.stringify(savedProducts));
      console.log('💡 Learned from item name change:', lastScannedBarcode, '→', itemName);
      
      // Clear the session storage
      sessionStorage.removeItem('lastScannedBarcode');
    }
  }
  
  const pantryItem = await getPantry(itemName);
  if(pantryItem){
    // Auto-fill unit if empty
    if(!$('#qaUnit').value && pantryItem.unit){
      $('#qaUnit').value = pantryItem.unit;
    }
    // Store for quick use
    knownItems[itemName] = pantryItem;
  }
});

// --- IndexedDB wrapper ---
const DB_NAME = 'groceryDB', DB_VER = 1;
let db;
function openDB(){
  return new Promise((resolve,reject)=>{
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = (e)=>{
      const db = e.target.result;
      if(!db.objectStoreNames.contains('weeklog')){
        const s = db.createObjectStore('weeklog',{keyPath:'id', autoIncrement:true});
        s.createIndex('item','item'); s.createIndex('purchaseDate','purchaseDate');
        s.createIndex('disposedDate','disposedDate'); s.createIndex('usedDate','usedDate');
      }
      if(!db.objectStoreNames.contains('pantry')){
        const p = db.createObjectStore('pantry',{keyPath:'item'});
        p.createIndex('nextBuy','nextBuy');
      }
    };
    req.onsuccess = ()=>{ db=req.result; resolve(db); };
    req.onerror = ()=>reject(req.error);
  });
}
function tx(store, mode='readonly'){ return db.transaction(store, mode).objectStore(store); }
async function addWeekLog(row){ return new Promise((res,rej)=>{ const r=tx('weeklog','readwrite').add(row); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error);});}
async function getAll(store){ 
  return new Promise((res,rej)=>{ 
    const r=tx(store).getAll(); 
    r.onsuccess=()=>{
      console.log(`📊 getAll('${store}') returned ${r.result.length} items`);
      res(r.result);
    }; 
    r.onerror=()=>rej(r.error); 
  });
}
async function putPantry(entry){ return new Promise((res,rej)=>{ const r=tx('pantry','readwrite').put(entry); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error);});}
async function getPantry(item){ return new Promise((res,rej)=>{ const r=tx('pantry').get(item); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error);});}
async function clearAll(){ return new Promise((res,rej)=>{ const stores=['weeklog','pantry']; let left=stores.length; stores.forEach(s=>{ const r=tx(s,'readwrite').clear(); r.onsuccess=()=>{ if(--left===0) res();}; r.onerror=()=>rej(r.error);});});}
async function deleteWeekLog(id){ return new Promise((res,rej)=>{ const r=tx('weeklog','readwrite').delete(id); r.onsuccess=()=>res(); r.onerror=()=>rej(r.error);});}

// --- Utilities ---
const fmtDate = d => d ? new Date(d).toISOString().slice(0,10) : '';
const daysToExpire = (exp) => exp? Math.ceil((new Date(exp)-new Date())/86400000) : '';

// --- Quick Add logic ---
$('#quickForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const action = $('#qaAction').value;
  
  // Calculate price per unit from total price if Buy action
  if(action === 'Buy'){
    calculatePricePerUnit();
  }
  
  const row = {
    category: $('#qaCategory').value || '',
    item: $('#qaItem').value || '',
    unit: $('#qaUnit').value || '',
    planned: Number($('#qaPlan').value)||0,
    purchaseDate: $('#qaPurchase').value || null,
    boughtQty: Number($('#qaBought').value)||0,
    pricePerUnit: Number($('#qaPrice').value)||0,
    totalPrice: Number($('#qaTotalPrice').value)||0,
    expirationDate: $('#qaExpire').value || null,
    usedQty: Number($('#qaUsed').value)||0,
    usedDate: $('#qaUsedDate').value || null,
    threshold: Number($('#qaThreshold').value)||0,
    wastedQty: Number($('#qaWasted').value)||0,
    disposedDate: $('#qaDisposed').value || null,
    wasteReason: $('#qaReason').value || '',
    actionType: action || ''
  };
  
  // For Use/Waste actions, get price from pantry if not provided
  if((action === 'Use' || action === 'Waste') && row.pricePerUnit === 0 && row.item){
    const pantryItem = await getPantry(row.item);
    if(pantryItem){
      // Get the most recent price from weeklog for this item
      const itemLogs = await getAll('weeklog');
      const buyLogs = itemLogs
        .filter(log => log.item === row.item && log.actionType === 'Buy' && log.pricePerUnit > 0)
        .sort((a,b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));
      
      if(buyLogs.length > 0){
        row.pricePerUnit = buyLogs[0].pricePerUnit;
        console.log(`📊 Using price from last purchase: ฿${row.pricePerUnit}/unit`);
      }
    }
  }

  // Basic requirements by action
  if(action==='Buy' && (!row.item || !row.purchaseDate || !row.boughtQty)){
    showToast('Buy action requires: Item, Purchase Date, and Bought Qty', 'error'); return;
  }
  if(action==='Use' && (!row.item || !row.usedQty)){
    showToast('Use action requires: Item and Used Qty', 'error'); return;
  }
  if(action==='Waste' && (!row.item || !row.wastedQty)){
    showToast('Waste action requires: Item and Wasted Qty', 'error'); return;
  }

  // Add to weeklog
  const id = await addWeekLog(row);
  
  // Notify household of new entry
  if(typeof notifyHouseholdUpdate !== 'undefined'){
    notifyHouseholdUpdate('add-weeklog', {...row, id});
  }

  // Update pantry on Buy/Use/Waste
  const p = await getPantry(row.item) || {item: row.item, unit: row.unit || '', onHand:0, threshold: row.threshold||0, oldestExpire:null, nextBuy:false, wastedTotal:0};
  if(action==='Buy'){
    p.onHand += row.boughtQty;
    p.unit = row.unit || p.unit;
    if(row.threshold) p.threshold = row.threshold;
    if(row.expirationDate && (!p.oldestExpire || new Date(row.expirationDate)<new Date(p.oldestExpire))) p.oldestExpire = row.expirationDate;
  }
  if(action==='Use'){ p.onHand -= row.usedQty; }
  if(action==='Waste'){ p.onHand -= row.wastedQty; p.wastedTotal=(p.wastedTotal||0)+row.wastedQty; }
  p.onHand = Math.max(0, Number(p.onHand.toFixed(3)));
  p.nextBuy = (p.threshold>0 && p.onHand<=p.threshold);
  await putPantry(p);
  
  // Notify household of pantry update
  if(typeof notifyHouseholdUpdate !== 'undefined'){
    notifyHouseholdUpdate('update-pantry', p);
  }

  // Show success animations
  animateFormSuccess(e.target);
  
  e.target.reset();
  $('#qaPurchase').value = new Date().toISOString().slice(0,10);
  $('#qaAction').value = '';
  $('#qaPrice').value = '';
  ['buyFields','buyFields2','buyFields3','useFields','wasteFields'].forEach(id=>$('#'+id).classList.add('hidden'));
  
  // Learn from barcode if item name contains barcode pattern
  learnBarcodeFromFormSubmission(row.item, row.category, row.unit);
  
  renderDashboard(); renderWeekLog(); renderPantry(); renderWaste();
  showToast('✓ บันทึกสำเร็จ!', 'success');
});
$('#btnClear').addEventListener('click', ()=> { 
  $('#quickForm').reset(); 
  $('#qaAction').value = '';
  $('#qaPrice').value = '';
  ['buyFields','buyFields2','buyFields3','useFields','wasteFields'].forEach(id=>$('#'+id).classList.add('hidden'));
  showToast('Form cleared', 'info');
});

// Duplicate last entry
$('#btnDuplicateLast').addEventListener('click', async ()=>{
  const logs = await getAll('weeklog');
  if(logs.length === 0){
    showToast('No previous entries to duplicate', 'info');
    return;
  }
  
  // Get the most recent entry
  logs.sort((a,b)=>(b.purchaseDate||b.usedDate||b.disposedDate||'')>(a.purchaseDate||a.usedDate||a.disposedDate||'')?1:-1);
  const last = logs[0];
  
  // Fill form with last entry data
  $('#qaAction').value = last.actionType || '';
  $('#qaAction').dispatchEvent(new Event('change'));
  
  setTimeout(()=>{
    $('#qaCategory').value = last.category || '';
    $('#qaItem').value = last.item || '';
    $('#qaUnit').value = last.unit || '';
    $('#qaPlan').value = last.planned || '';
    $('#qaBought').value = last.boughtQty || '';
    $('#qaTotalPrice').value = last.totalPrice || '';
    $('#qaThreshold').value = last.threshold || '';
    $('#qaUsed').value = last.usedQty || '';
    $('#qaWasted').value = last.wastedQty || '';
    $('#qaReason').value = last.wasteReason || '';
    
    // Update dates to today
    const today = new Date().toISOString().slice(0,10);
    if(last.actionType === 'Buy'){
      $('#qaPurchase').value = today;
      if(last.expirationDate){
        const origExp = new Date(last.expirationDate);
        const origPurch = new Date(last.purchaseDate);
        const daysDiff = Math.round((origExp - origPurch) / 86400000);
        const newExp = new Date();
        newExp.setDate(newExp.getDate() + daysDiff);
        $('#qaExpire').value = newExp.toISOString().slice(0,10);
      }
    } else if(last.actionType === 'Use'){
      $('#qaUsedDate').value = today;
    } else if(last.actionType === 'Waste'){
      $('#qaDisposed').value = today;
    }
    
    calculatePricePerUnit();
    showToast('✓ Last entry duplicated. Adjust as needed.', 'success');
  }, 100);
});

// --- Tables with Search ---
let currentTableData = { weeklog:[], pantry:[], waste:[] };

function table(el, rows, columns, emptyMsg='No data available'){
  if(rows.length===0){
    el.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📭</div><div>${emptyMsg}</div></div>`;
    return;
  }
  const html = [`<table><thead><tr>${columns.map(c=>`<th class="sortable">${c.label}</th>`).join('')}</tr></thead><tbody>`];
  rows.forEach(r=>{
    html.push('<tr>');
    columns.forEach(c=> {
      const value = c.render ? c.render(r[c.key], r) : (r[c.key] ?? '');
      html.push(`<td>${value}</td>`);
    });
    html.push('</tr>');
  });
  html.push('</tbody></table>');
  el.innerHTML = html.join('');
}

// Search functionality
function setupSearch(inputId, dataKey, renderFn){
  const input = $(inputId);
  if(input){
    input.addEventListener('input', (e)=>{
      const term = e.target.value.toLowerCase();
      const filtered = currentTableData[dataKey].filter(row=>{
        return Object.values(row).some(v=> String(v).toLowerCase().includes(term));
      });
      renderFn(filtered);
    });
  }
}

// --- Renders ---
async function renderWeekLog(filtered=null){
  const list = filtered || await getAll('weeklog');
  console.log('🔍 renderWeekLog called:', {
    filtered: filtered ? 'yes' : 'no',
    listLength: list.length,
    firstItem: list[0],
    tableElement: $('#weekLogTable')
  });
  if(!filtered) currentTableData.weeklog = list;
  list.sort((a,b)=>(b.purchaseDate||b.usedDate||b.disposedDate||'')>(a.purchaseDate||a.usedDate||a.disposedDate||'')?1:-1);
  table($('#weekLogTable'), list, [
    {key:'actionType', label:'Action', render:v=>v?`<span class="badge info">${v}</span>`:'-'},
    {key:'category', label:'Category'},
    {key:'item', label:'Item'},
    {key:'unit', label:'Unit'},
    {key:'purchaseDate', label:'Purchase', render:v=>fmtDate(v)},
    {key:'boughtQty', label:'Bought Qty'},
    {key:'totalPrice', label:'Total (฿)', render:v=>v?Number(v).toFixed(2):'-'},
    {key:'pricePerUnit', label:'Price/Unit', render:v=>v?Number(v).toFixed(2):'-'},
    {key:'usedQty', label:'Used'},
    {key:'usedDate', label:'Used Date', render:v=>fmtDate(v)},
    {key:'wastedQty', label:'Wasted'},
    {key:'disposedDate', label:'Disposed', render:v=>fmtDate(v)},
    {key:'expirationDate', label:'Expire', render:v=>fmtDate(v)},
    {key:'threshold', label:'Threshold'},
    {key:'id', label:'Actions', render:(v)=>`<button class="small danger" onclick="deleteLogEntry(${v})">✕ Remove</button>`}
  ], 'No transactions yet. Start by adding entries in Quick Add!');
}

// Delete log entry
window.deleteLogEntry = async function(id){
  if(!confirm('Are you sure you want to delete this entry?')) return;
  
  try {
    // Get the entry first to reverse pantry changes
    const logs = await getAll('weeklog');
    const entry = logs.find(r => r.id === id);
    
    if(entry && entry.item){
      // Get pantry item
      const pantryItem = await getPantry(entry.item);
      
      if(pantryItem){
        // Reverse the pantry changes based on action type
        if(entry.actionType === 'Buy'){
          // Remove bought quantity from pantry
          pantryItem.onHand -= (entry.boughtQty || 0);
        } else if(entry.actionType === 'Use'){
          // Add back used quantity to pantry
          pantryItem.onHand += (entry.usedQty || 0);
        } else if(entry.actionType === 'Waste'){
          // Add back wasted quantity to pantry
          pantryItem.onHand += (entry.wastedQty || 0);
          pantryItem.wastedTotal = Math.max(0, (pantryItem.wastedTotal || 0) - (entry.wastedQty || 0));
        }
        
        // Ensure non-negative and update
        pantryItem.onHand = Math.max(0, Number(pantryItem.onHand.toFixed(3)));
        pantryItem.nextBuy = (pantryItem.threshold > 0 && pantryItem.onHand <= pantryItem.threshold);
        
        await putPantry(pantryItem);
      }
    }
    
    // Delete the log entry
    await deleteWeekLog(id);
    
    // Notify household of deletion
    if(typeof notifyHouseholdUpdate !== 'undefined'){
      notifyHouseholdUpdate('delete-weeklog', {id});
    }
    
    showToast('✓ Entry deleted and pantry updated', 'success');
    renderWeekLog();
    renderPantry();
    renderWaste();
    renderDashboard();
  } catch(err) {
    showToast('❌ Failed to delete entry', 'error');
    console.error(err);
  }
};

async function renderPantry(filtered=null){
  const pan = filtered || await getAll('pantry');
  if(!filtered) currentTableData.pantry = pan;
  pan.sort((a,b)=>a.item.localeCompare(b.item));
  
  // Build table manually to ensure buttons work
  if(pan.length === 0){
    $('#pantryTable').innerHTML = `<div class="empty-state"><div class="empty-state-icon">📭</div><div>Your pantry is empty. Add items via Quick Add!</div></div>`;
    return;
  }
  
  let html = '<table><thead><tr>';
  html += '<th class="sortable">Item</th>';
  html += '<th class="sortable">Unit</th>';
  html += '<th class="sortable">On Hand</th>';
  html += '<th class="sortable">Threshold</th>';
  html += '<th class="sortable">Resupply</th>';
  html += '<th class="sortable">Oldest Expire</th>';
  html += '<th class="sortable">Wasted Total</th>';
  html += '<th class="sortable">Actions</th>';
  html += '</tr></thead><tbody>';
  
  pan.forEach(row => {
    html += '<tr>';
    html += `<td>${row.item || ''}</td>`;
    html += `<td>${row.unit || ''}</td>`;
    html += `<td>${Number(row.onHand || 0).toFixed(2)}</td>`;
    html += `<td>${row.threshold || ''}</td>`;
    html += `<td>${row.nextBuy ? '<span class="badge yes">Yes</span>' : '<span class="badge success">Ok</span>'}</td>`;
    
    // Expiration
    let expHtml = '-';
    if(row.oldestExpire){
      const days = daysToExpire(row.oldestExpire);
      if(days <= 0) expHtml = `<span class="badge expired">${fmtDate(row.oldestExpire)}</span>`;
      else if(days <= 3) expHtml = `<span class="badge soon">${fmtDate(row.oldestExpire)}</span>`;
      else expHtml = fmtDate(row.oldestExpire);
    }
    html += `<td>${expHtml}</td>`;
    
    html += `<td>${Number(row.wastedTotal || 0).toFixed(2)}</td>`;
    
    // Action buttons
    const itemEscaped = (row.item || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const unitEscaped = (row.unit || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
    html += `<td>
      <button class="small secondary" onclick="quickUseItem('${itemEscaped}', '${unitEscaped}')" title="Use this item">Use</button>
      <button class="small secondary" onclick="adjustPantryQty('${itemEscaped}', ${row.onHand})" title="Adjust quantity">Adjust</button>
      <button class="small danger" onclick="removePantryItem('${itemEscaped}')" title="Remove from pantry">Remove</button>
    </td>`;
    
    html += '</tr>';
  });
  
  html += '</tbody></table>';
  $('#pantryTable').innerHTML = html;
}

// Quick use item from pantry
window.quickUseItem = function(itemName, unit){
  // Switch to Quick Add view
  $$('.nav-btn').forEach(b=>{
    if(b.getAttribute('data-view')==='quickadd'){
      b.click();
    }
  });
  
  // Pre-fill form
  setTimeout(()=>{
    $('#qaAction').value = 'Use';
    $('#qaAction').dispatchEvent(new Event('change'));
    $('#qaItem').value = itemName;
    $('#qaUnit').value = unit;
    $('#qaUsedDate').value = new Date().toISOString().slice(0,10);
    $('#qaUsed').focus();
    showToast(`Quick use: ${itemName}`, 'info');
  }, 100);
};

// Adjust pantry quantity
window.adjustPantryQty = async function(itemName, currentQty){
  const newQty = prompt(`Adjust quantity for "${itemName}"\nCurrent: ${currentQty}`, currentQty);
  
  if(newQty === null) return; // User cancelled
  
  const qty = parseFloat(newQty);
  if(isNaN(qty) || qty < 0){
    showToast('❌ Invalid quantity', 'error');
    return;
  }
  
  try {
    const pantryItem = await getPantry(itemName);
    if(pantryItem){
      pantryItem.onHand = Number(qty.toFixed(3));
      pantryItem.nextBuy = (pantryItem.threshold > 0 && pantryItem.onHand <= pantryItem.threshold);
      await putPantry(pantryItem);
      showToast(`✓ Quantity updated: ${itemName} → ${qty}`, 'success');
      renderPantry();
      renderDashboard();
    }
  } catch(err){
    showToast('❌ Failed to update quantity', 'error');
    console.error(err);
  }
};

// Remove item from pantry
window.removePantryItem = async function(itemName){
  if(!confirm(`Are you sure you want to remove "${itemName}" from your pantry?\n\nThis will not delete transaction history.`)) return;
  
  try {
    const store = tx('pantry', 'readwrite');
    await new Promise((res,rej)=>{
      const req = store.delete(itemName);
      req.onsuccess = ()=>res();
      req.onerror = ()=>rej(req.error);
    });
    
    showToast(`✓ Removed "${itemName}" from pantry`, 'success');
    renderPantry();
    renderDashboard();
  } catch(err){
    showToast('❌ Failed to remove item', 'error');
    console.error(err);
  }
};

async function renderWaste(filtered=null){
  const all = filtered || (await getAll('weeklog')).filter(r=>(r.wastedQty && r.wastedQty > 0) || (r.disposedDate && r.wasteReason));
  if(!filtered) currentTableData.waste = all;
  all.sort((a,b)=>(b.disposedDate||'')>(a.disposedDate||'')?1:-1);
  table($('#wasteTable'), all, [
    {key:'disposedDate', label:'Disposed', render:v=>fmtDate(v)},
    {key:'item', label:'Item'},
    {key:'wastedQty', label:'Wasted Qty'},
    {key:'unit', label:'Unit'},
    {key:'wasteReason', label:'Reason'},
    {key:'purchaseDate', label:'Purchase', render:v=>fmtDate(v)},
    {key:'expirationDate', label:'Expire', render:v=>fmtDate(v)},
    {key:'id', label:'Actions', render:(v)=>`<button class="small danger" onclick="deleteLogEntry(${v})">✕ Remove</button>`}
  ], 'No waste entries. Great job managing your groceries!');
}

async function renderDashboard(){
  const wl = await getAll('weeklog');
  const last7 = Date.now() - 6*86400000;
  const last28 = Date.now() - 27*86400000;
  const cookDaily = {};  // Daily cooking cost (Use actions)
  const shopWeekly = {}; // Weekly shopping cost (Buy actions)
  const categorySpend = {}; // Spending by category
  let totalSpend = 0, totalCookCost = 0, wasteQty=0, wasteCost=0, wasteEntries=0, resupply=0, expSoon=0;

  // Pantry metrics
  const pan = await getAll('pantry');
  resupply = pan.filter(p=>p.nextBuy).length;
  const expiringSoon = pan.filter(p=> p.oldestExpire && daysToExpire(p.oldestExpire) <=3 );
  expSoon = expiringSoon.length;

  wl.forEach(r=>{
    // Daily cooking cost by use date (Use actions)
    if(r.usedDate && r.actionType === 'Use'){
      const d = new Date(r.usedDate); 
      const dkey = d.toISOString().slice(0,10);
      if(!cookDaily[dkey]) cookDaily[dkey]=0;
      const useCost = (r.usedQty||0) * (r.pricePerUnit||0);
      cookDaily[dkey] += useCost;
      totalCookCost += useCost;
    }
    
    // Weekly shopping cost by purchase date (Buy actions)
    if(r.purchaseDate && r.actionType === 'Buy'){
      // Parse date in local timezone to avoid UTC issues
      const [year, month, day] = r.purchaseDate.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      
      // Get Monday of this week
      const dayOfWeek = d.getDay();
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const weekStart = new Date(year, month - 1, day + daysToMonday);
      
      const wkey = weekStart.toISOString().slice(0,10);
      console.log(`Processing Buy: purchaseDate=${r.purchaseDate}, dayOfWeek=${dayOfWeek}, weekStart=${wkey}`);
      
      if(!shopWeekly[wkey]) shopWeekly[wkey]=0;
      const cost = (r.totalPrice || ((r.boughtQty||0) * (r.pricePerUnit||0)));
      shopWeekly[wkey] += cost;
      totalSpend += cost;
      
      // Category spending
      if(r.category){
        if(!categorySpend[r.category]) categorySpend[r.category] = 0;
        categorySpend[r.category] += cost;
      }
    }
    
    // Last 7d waste (must match Waste Log filter)
    if(new Date(r.disposedDate || '').getTime() >= last7){
      // Only count if it's actual waste: has wastedQty > 0 OR (disposedDate AND wasteReason)
      if((r.wastedQty && r.wastedQty > 0) || (r.disposedDate && r.wasteReason)){
        wasteEntries++;
        wasteQty += (r.wastedQty||0);
        wasteCost += (r.wastedQty||0) * (r.pricePerUnit||0);
      }
    }
  });
  
  const wasteRatio = totalSpend > 0 ? (wasteCost / totalSpend * 100) : 0;
  
  // Charts
  const pie = document.getElementById('pieSpendWaste');
  drawPie(pie, [totalSpend, wasteCost], ['Spend','Waste Cost'], ['#60a5fa','#f87171']);
  
  // Bar chart for daily cooking cost (last 7 days)
  const barCook = document.getElementById('barDailyCook');
  const cookLabels=[], cookVals=[];
  for(let i=6;i>=0;i--){
    const d = new Date(Date.now() - i*86400000).toISOString().slice(0,10);
    cookLabels.push(d.slice(5));
    cookVals.push(cookDaily[d]||0);
  }
  drawBar(barCook, cookLabels, cookVals);
  
  // Bar chart for weekly shopping cost (last 4 weeks)
  const barShop = document.getElementById('barWeeklyShopping');
  const shopLabels=[], shopVals=[];
  for(let i=3;i>=0;i--){
    // Use local timezone dates
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i*7);
    
    // Get Monday of this week
    const dayOfWeek = d.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(d.getFullYear(), d.getMonth(), d.getDate() + daysToMonday);
    
    const wkey = weekStart.toISOString().slice(0,10);
    shopLabels.push('Week '+wkey.slice(5,10));
    shopVals.push(shopWeekly[wkey]||0);
    console.log(`Week ${i}: d=${d.toISOString().slice(0,10)}, weekStart=${wkey}, value=${shopWeekly[wkey]||0}`);
  }
  console.log('📊 Weekly shopping chart data:', { shopLabels, shopVals, shopWeekly });
  drawBar(barShop, shopLabels, shopVals);
  
  // KPIs with trends
  $('#kpiResupply').textContent = resupply;
  $('#kpiExpSoon').textContent = expSoon;
  $('#kpiCookCost').textContent = totalCookCost.toFixed(2);
  $('#kpiShoppingTotal').textContent = totalSpend.toFixed(2);
  $('#kpiWasteEntries').textContent = wasteEntries;
  $('#kpiWasteCost').textContent = wasteCost.toFixed(2);
  $('#kpiWasteRatio').textContent = wasteRatio.toFixed(1) + '%';
  $('#kpiPantryCount').textContent = pan.length;
  
  // Calculate trends (compare with previous period)
  const prev7Start = Date.now() - 13*86400000;
  const prev7End = last7 - 86400000;
  let prevWasteCost = 0, prevCookCost = 0;
  wl.forEach(r=>{
    const dispTime = new Date(r.disposedDate || '').getTime();
    if(dispTime >= prev7Start && dispTime <= prev7End){
      if((r.wastedQty && r.wastedQty > 0) || (r.disposedDate && r.wasteReason)){
        prevWasteCost += (r.wastedQty||0) * (r.pricePerUnit||0);
      }
    }
    const useTime = new Date(r.usedDate || '').getTime();
    if(useTime >= prev7Start && useTime <= prev7End && r.actionType === 'Use'){
      prevCookCost += (r.usedQty||0) * (r.pricePerUnit||0);
    }
  });
  
  const wasteTrend = prevWasteCost > 0 ? ((wasteCost - prevWasteCost) / prevWasteCost * 100) : 0;
  const cookTrend = prevCookCost > 0 ? ((totalCookCost - prevCookCost) / prevCookCost * 100) : 0;
  
  $('#trendWasteCost').textContent = wasteTrend >= 0 ? `↑ ${wasteTrend.toFixed(1)}%` : `↓ ${Math.abs(wasteTrend).toFixed(1)}%`;
  $('#trendWasteCost').style.color = wasteTrend >= 0 ? '#f87171' : '#6ee7b7';
  $('#trendCookCost').textContent = cookTrend >= 0 ? `↑ ${cookTrend.toFixed(1)}%` : `↓ ${Math.abs(cookTrend).toFixed(1)}%`;
  
  // Chart summaries
  const cookAvg = cookVals.length > 0 ? cookVals.reduce((a,b)=>a+b,0) / cookVals.length : 0;
  const cookMax = cookVals.length > 0 ? Math.max(...cookVals) : 0;
  $('#cookSummary').innerHTML = `7-day avg: <strong>฿${cookAvg.toFixed(2)}</strong> | Peak: <strong>฿${cookMax.toFixed(2)}</strong> | Total: <strong>฿${totalCookCost.toFixed(2)}</strong>`;
  
  const shopTotal = shopVals.reduce((a,b)=>a+b,0);
  const shopAvg = shopVals.length > 0 ? shopTotal / shopVals.length : 0;
  $('#shopSummary').innerHTML = `4-week avg: <strong>฿${shopAvg.toFixed(2)}</strong> | Total: <strong>฿${shopTotal.toFixed(2)}</strong>`;
  
  // Top categories
  const sortedCats = Object.entries(categorySpend).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxCatSpend = sortedCats.length > 0 ? sortedCats[0][1] : 1;
  let catHtml = '';
  sortedCats.forEach(([cat, amt])=>{
    const pct = (amt / totalSpend * 100).toFixed(1);
    const barWidth = (amt / maxCatSpend * 100).toFixed(1);
    catHtml += `<div class="category-item">
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="category-name">${cat}</span>
          <span class="category-amount">฿${amt.toFixed(2)} (${pct}%)</span>
        </div>
        <div class="category-bar">
          <div class="category-bar-fill" style="width:${barWidth}%"></div>
        </div>
      </div>
    </div>`;
  });
  $('#topCategories').innerHTML = catHtml || '<div style="text-align:center;color:#6b7280;padding:20px">No data yet</div>';
  
  // Recent activity (last 10 transactions)
  const recentWl = [...wl].sort((a,b)=>{
    const aDate = a.purchaseDate || a.usedDate || a.disposedDate || '';
    const bDate = b.purchaseDate || b.usedDate || b.disposedDate || '';
    return bDate.localeCompare(aDate);
  }).slice(0, 10);
  
  let actHtml = '';
  recentWl.forEach(r=>{
    const actType = r.actionType || 'Unknown';
    const actClass = actType.toLowerCase();
    const actIcon = actType === 'Buy' ? '🛒' : actType === 'Use' ? '🍳' : '🗑️';
    const actDate = r.purchaseDate || r.usedDate || r.disposedDate || '';
    const timeAgo = actDate ? formatTimeAgo(new Date(actDate)) : '';
    const qty = r.boughtQty || r.usedQty || r.wastedQty || 0;
    const unit = r.unit || '';
    
    actHtml += `<div class="activity-item">
      <div class="activity-icon ${actClass}">${actIcon}</div>
      <div class="activity-content">
        <div class="activity-title">${r.item || 'Unknown'}</div>
        <div class="activity-desc">${actType} ${qty} ${unit} · ${r.category || 'No category'}</div>
      </div>
      <div class="activity-time">${timeAgo}</div>
    </div>`;
  });
  $('#recentActivity').innerHTML = actHtml || '<div style="text-align:center;color:#6b7280;padding:20px">No recent activity</div>';
  
  // Quick action buttons
  $('#btnViewExpiring').onclick = ()=>{
    $$('.nav-btn').forEach(b=>{ if(b.getAttribute('data-view')==='pantry') b.click(); });
    setTimeout(()=>{
      const items = expiringSoon.map(p=>p.item).join('|');
      if(items){
        $('#searchPantry').value = '';
        const filtered = currentTableData.pantry.filter(p=>expiringSoon.some(e=>e.item===p.item));
        renderPantry(filtered);
        showToast(`Showing ${expSoon} expiring items`, 'info');
      } else {
        showToast('No items expiring soon!', 'success');
      }
    }, 100);
  };
  
  $('#btnViewResupply').onclick = ()=>{
    $$('.nav-btn').forEach(b=>{ if(b.getAttribute('data-view')==='pantry') b.click(); });
    setTimeout(()=>{
      const items = pan.filter(p=>p.nextBuy);
      if(items.length){
        $('#searchPantry').value = '';
        renderPantry(items);
        showToast(`Showing ${resupply} items to resupply`, 'info');
      } else {
        showToast('No items need resupply!', 'success');
      }
    }, 100);
  };
}

// Helper function for time ago formatting
function formatTimeAgo(date){
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if(diffMins < 1) return 'Just now';
  if(diffMins < 60) return `${diffMins}m ago`;
  if(diffHours < 24) return `${diffHours}h ago`;
  if(diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// --- Export/Import/Wipe ---
$('#btnExport').addEventListener('click', async ()=>{
  const data = { weeklog: await getAll('weeklog'), pantry: await getAll('pantry') };
  const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download='grocery-backup-'+new Date().toISOString().slice(0,10)+'.json'; a.click();
  setTimeout(()=> URL.revokeObjectURL(url), 1000);
  showToast('✓ Backup exported successfully!', 'success');
});
$('#btnImport').addEventListener('click', async ()=>{
  const f = document.getElementById('fileImport').files[0];
  if(!f){ showToast('Please select a JSON file first', 'error'); return; }
  try {
    const text = await f.text(); const data = JSON.parse(text);
    await clearAll();
    const wg = data.weeklog || [];
    for(const r of wg){ delete r.id; await addWeekLog(r); }
    const p = data.pantry || [];
    for(const e of p){ await putPantry(e); }
    renderDashboard(); renderWeekLog(); renderPantry(); renderWaste();
    showToast('✓ Data imported successfully!', 'success');
  } catch(err) {
    showToast('❌ Import failed: Invalid file format', 'error');
  }
});
$('#btnWipe').addEventListener('click', async ()=>{
  if(confirm('⚠️ Are you sure? This will permanently erase all local data!')){ 
    await clearAll(); 
    renderDashboard(); renderWeekLog(); renderPantry(); renderWaste(); 
    showToast('All data has been erased', 'info');
  }
});

// Init
openDB().then(async ()=>{
  // Restore last active view
  const lastView = localStorage.getItem('lastActiveView') || 'dashboard';
  const lastViewBtn = document.querySelector(`.nav-btn[data-view="${lastView}"]`);
  if(lastViewBtn){
    // Remove default active states
    $$('.nav-btn').forEach(b=>b.classList.remove('active'));
    $$('.view').forEach(x=>x.classList.remove('active'));
    
    // Set saved view as active
    lastViewBtn.classList.add('active');
    $('#view-'+lastView).classList.add('active');
  }
  
  // default today date in Quick Add
  $('#qaPurchase').value = new Date().toISOString().slice(0,10);
  $('#qaUsedDate').value = new Date().toISOString().slice(0,10);
  $('#qaDisposed').value = new Date().toISOString().slice(0,10);
  
  // Setup search
  setupSearch('#searchWeekLog', 'weeklog', renderWeekLog);
  setupSearch('#searchPantry', 'pantry', renderPantry);
  setupSearch('#searchWaste', 'waste', renderWaste);
  
  renderDashboard(); renderWeekLog(); renderPantry(); renderWaste();
  showToast('✓ App ready! All data stored locally', 'success');
  
  // Initialize household sync
  if(typeof initHouseholdSync !== 'undefined'){
    await initHouseholdSync();
  }
});

// Handle window resize for responsive charts
let resizeTimer;
window.addEventListener('resize', ()=>{
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(()=>{
    // Redraw charts on current view
    const activeView = $('.view.active');
    if(activeView && activeView.id === 'view-dashboard'){
      renderDashboard();
    }
  }, 250);
});

// Language Selection Handler
document.getElementById('languageSelect')?.addEventListener('change', (e) => {
  const selectedLang = e.target.value;
  setLanguage(selectedLang);
  showToast(t('languageChanged'), 'success');
  
  // Re-render current view to update translations
  const activeView = $('.view.active');
  if(activeView) {
    if(activeView.id === 'view-dashboard') renderDashboard();
    if(activeView.id === 'view-weeklog') renderWeekLog();
    if(activeView.id === 'view-pantry') renderPantry();
    if(activeView.id === 'view-waste') renderWaste();
  }
});

// Initialize language on page load
window.addEventListener('load', () => {
  const currentLang = getCurrentLanguage();
  const langSelect = document.getElementById('languageSelect');
  if(langSelect) {
    langSelect.value = currentLang;
  }
  updateUI();
});

// Learn barcode from form submission
// This function saves barcode-to-product mapping when user manually edits and saves
function learnBarcodeFromFormSubmission(itemName, category, unit) {
  if (!itemName) return;
  
  // Check if item name contains a barcode pattern (8+ digits)
  const barcodeMatch = itemName.match(/\b(\d{8,})\b/);
  if (!barcodeMatch) return;
  
  const barcode = barcodeMatch[1];
  console.log('Learning barcode from form submission:', barcode);
  
  // Get the last scanned barcode (stored temporarily)
  const lastScannedBarcode = sessionStorage.getItem('lastScannedBarcode');
  
  // If we have a recently scanned barcode, learn from this submission
  if (lastScannedBarcode && lastScannedBarcode === barcode) {
    // User kept the barcode in the name, probably wants to replace it
    console.log('User kept barcode in name, not learning');
    sessionStorage.removeItem('lastScannedBarcode');
    return;
  }
  
  // If barcode is in the name and we have valid product info, learn it
  if (barcode.length >= 8) {
    // Check if this is a real product name or just "สินค้า [barcode]"
    const isGenericName = itemName.includes('สินค้า') && itemName.includes(barcode);
    
    if (!isGenericName) {
      // Save this barcode mapping for future scans
      const savedProducts = JSON.parse(localStorage.getItem('scannedProducts') || '{}');
      savedProducts[barcode] = { 
        name: itemName, 
        category: category || null, 
        unit: unit || null 
      };
      localStorage.setItem('scannedProducts', JSON.stringify(savedProducts));
      console.log('Learned barcode mapping:', barcode, '→', itemName);
    }
  }
  
  // Clear the last scanned barcode
  sessionStorage.removeItem('lastScannedBarcode');
}

// Service Worker Update Handler
if ('serviceWorker' in navigator) {
  // Prevent reload loops - only allow one reload per session
  const RELOAD_KEY = 'sw-reload-time';
  const lastReload = sessionStorage.getItem(RELOAD_KEY);
  const now = Date.now();
  
  // If reloaded less than 5 seconds ago, don't reload again
  if (lastReload && (now - parseInt(lastReload)) < 5000) {
    console.log('Skipping reload - too soon after last reload');
  }
  
  navigator.serviceWorker.register('service-worker.js').then(reg => {
    console.log('Service Worker registered');
    
    // Check for updates every 30 seconds (not too aggressive)
    setInterval(() => {
      reg.update();
    }, 30000);
    
    // Listen for new service worker
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      console.log('New Service Worker found!');
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('New version available! Reloading...');
          
          // Check if we recently reloaded
          const lastReload = sessionStorage.getItem(RELOAD_KEY);
          const now = Date.now();
          
          if (!lastReload || (now - parseInt(lastReload)) > 5000) {
            // Show toast notification
            showToast('🔄 อัพเดทแอปเวอร์ชั่นใหม่...', 'info');
            
            // Mark reload time
            sessionStorage.setItem(RELOAD_KEY, now.toString());
            
            // Reload after 2 seconds
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else {
            console.log('Skipping reload - too soon after last reload');
          }
        }
      });
    });
  }).catch(err => {
    console.error('Service Worker registration failed:', err);
  });
}

// --- Initialize Success Animations ---
document.addEventListener('DOMContentLoaded', () => {
  // Add ripple effect to all buttons
  const buttons = document.querySelectorAll('button, .btn, .nav-btn, .kpi-clickable');
  buttons.forEach(button => {
    addRippleEffect(button);
  });
  
  // Add success animation to submit buttons
  const submitButtons = document.querySelectorAll('button[type="submit"]');
  submitButtons.forEach(button => {
    button.addEventListener('click', () => {
      showSuccessAnimation(button);
    });
  });
});
