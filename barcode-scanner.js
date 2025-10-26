// Barcode Scanner
let barcodeScanner = null;
let scanning = false;
let stream = null;

// Product database mapping (you can expand this)
const productDatabase = {
  // Thai products - common grocery items
  '8850123456789': { name: 'นมสด', category: 'Dairy & Eggs' },
  '8851234567890': { name: 'ข้าวหอมมะลิ', category: 'Grains & Bread' },
  '8859114905525': { name: 'ธัญพืชไดมอนด์เกรนส์ (Diamond Grains)', category: 'Grains & Bread' },
  // You can add more products as you scan them
  // Format: 'barcode': { name: 'Product Name', category: 'Category' }
};

// Open barcode scanner modal
function openBarcodeScanner() {
  const modal = document.getElementById('barcodeModal');
  const video = document.getElementById('barcodeVideo');
  const resultDiv = document.getElementById('barcodeResult');
  
  if (!modal || !video) return;
  
  modal.style.display = 'flex';
  resultDiv.classList.remove('show');
  resultDiv.textContent = '';
  scanning = true;
  
  console.log('Opening barcode scanner...');
  
  // Request camera access
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment', // Use back camera on mobile
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      } 
    })
    .then(videoStream => {
      stream = videoStream;
      video.srcObject = stream;
      video.setAttribute('playsinline', true);
      video.play();
      
      console.log('Camera started successfully');
      showToast('✓ Camera ready. Point at barcode...', 'info');
      
      // Wait for video to be ready
      video.addEventListener('loadedmetadata', () => {
        console.log('Video metadata loaded, starting detection...');
        startBarcodeDetection(video);
      });
    })
    .catch(err => {
      console.error('Camera access error:', err);
      showToast('❌ Camera access denied. Please allow camera permissions.', 'error');
      closeBarcodeScanner();
    });
  } else {
    console.error('getUserMedia not supported');
    showToast('❌ Camera not supported on this device', 'error');
    closeBarcodeScanner();
  }
}

// Close barcode scanner modal
function closeBarcodeScanner() {
  const modal = document.getElementById('barcodeModal');
  const video = document.getElementById('barcodeVideo');
  
  scanning = false;
  
  console.log('Closing barcode scanner...');
  
  // Stop video stream
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
      console.log('Stopped camera track');
    });
    stream = null;
  }
  
  if (video) {
    video.srcObject = null;
  }
  
  if (modal) {
    modal.style.display = 'none';
  }
}

// Barcode detection using multiple methods
async function startBarcodeDetection(video) {
  console.log('Starting barcode detection...');
  
  // Method 1: Try native BarcodeDetector first (Chrome, Edge)
  if ('BarcodeDetector' in window) {
    console.log('Using native BarcodeDetector API');
    try {
      const barcodeDetector = new BarcodeDetector({ 
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'code_93', 'itf', 'codabar'] 
      });
      
      let detectCount = 0;
      const detectBarcode = async () => {
        if (!scanning) {
          console.log('Scanning stopped');
          return;
        }
        
        detectCount++;
        if (detectCount % 10 === 0) {
          console.log(`Detection attempt ${detectCount}...`);
        }
        
        try {
          const barcodes = await barcodeDetector.detect(video);
          
          if (barcodes.length > 0) {
            const barcode = barcodes[0].rawValue;
            console.log('Barcode detected:', barcode);
            handleBarcodeDetected(barcode);
            return;
          }
        } catch (err) {
          console.error('Detection error:', err);
        }
        
        // Continue scanning
        if (scanning) {
          requestAnimationFrame(detectBarcode);
        }
      };
      
      detectBarcode();
      return;
    } catch (err) {
      console.error('BarcodeDetector setup error:', err);
    }
  }
  
  // Method 2: Use Quagga.js library as fallback
  console.log('BarcodeDetector not available, loading Quagga.js...');
  loadQuaggaScanner(video);
}

// Load and initialize Quagga.js library
function loadQuaggaScanner(video) {
  if (typeof Quagga !== 'undefined') {
    console.log('Quagga already loaded');
    initQuaggaScanner(video);
    return;
  }
  
  console.log('Loading Quagga.js library...');
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@ericblade/quagga2@1.8.4/dist/quagga.min.js';
  script.onload = () => {
    console.log('Quagga.js loaded successfully');
    initQuaggaScanner(video);
  };
  script.onerror = () => {
    console.error('Failed to load Quagga.js');
    showToast('❌ Failed to load barcode scanner. Please check internet connection.', 'error');
    closeBarcodeScanner();
  };
  document.head.appendChild(script);
}

// Initialize Quagga scanner
function initQuaggaScanner(video) {
  console.log('Initializing Quagga scanner...');
  
  const config = {
    inputStream: {
      type: 'LiveStream',
      target: video,
      constraints: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    },
    decoder: {
      readers: [
        'ean_reader',
        'ean_8_reader',
        'upc_reader',
        'upc_e_reader',
        'code_128_reader',
        'code_39_reader',
        'code_93_reader',
        'i2of5_reader',
        'codabar_reader'
      ],
      multiple: false
    },
    locator: {
      patchSize: 'medium',
      halfSample: true
    },
    numOfWorkers: 2,
    frequency: 10,
    locate: true
  };
  
  Quagga.init(config, (err) => {
    if (err) {
      console.error('Quagga initialization error:', err);
      showToast('❌ Failed to initialize scanner', 'error');
      closeBarcodeScanner();
      return;
    }
    
    console.log('Quagga initialized successfully');
    Quagga.start();
    
    Quagga.onDetected((result) => {
      if (scanning && result && result.codeResult && result.codeResult.code) {
        const barcode = result.codeResult.code;
        const format = result.codeResult.format;
        
        console.log('Quagga detected:', {
          barcode: barcode,
          format: format,
          confidence: result.codeResult.decodedCodes
        });
        
        // Validate barcode (must be at least 8 digits for EAN/UPC)
        if (barcode.length >= 8) {
          // Stop Quagga
          Quagga.stop();
          handleBarcodeDetected(barcode);
        } else {
          console.log('Barcode too short, continuing scan...');
        }
      }
    });
    
    // Also log when barcode is being processed
    Quagga.onProcessed((result) => {
      if (result && result.codeResult) {
        console.log('Processing barcode attempt:', result.codeResult.code);
      }
    });
  });
}

// Handle detected barcode
async function handleBarcodeDetected(barcode) {
  if (!barcode || barcode.length < 8) {
    console.log('Barcode too short, ignoring:', barcode);
    return; // Ignore partial/invalid barcodes
  }
  
  scanning = false;
  
  console.log('Valid barcode detected:', barcode);
  
  const resultDiv = document.getElementById('barcodeResult');
  resultDiv.textContent = `✓ Barcode: ${barcode}`;
  resultDiv.classList.add('show');
  
  // Show loading state
  showToast('🔍 กำลังค้นหาสินค้า...', 'info');
  
  // 1. Check local product database first
  let product = productDatabase[barcode];
  
  // 2. Check localStorage for previously scanned items
  if (!product) {
    const savedProducts = JSON.parse(localStorage.getItem('scannedProducts') || '{}');
    product = savedProducts[barcode];
  }
  
  // 3. If not found locally, try Open Food Facts API
  if (!product) {
    console.log('Product not in local database, querying Open Food Facts...');
    product = await fetchProductFromOpenFoodFacts(barcode);
  }
  
  if (product) {
    // Auto-fill form with product info
    console.log('Product found:', product);
    document.getElementById('qaItem').value = product.name;
    if (product.category) {
      document.getElementById('qaCategory').value = product.category;
    }
    showToast(`✓ พบสินค้า: ${product.name}`, 'success');
    
    // Save to localStorage for faster future access
    saveScannedProduct(barcode, product.name, product.category);
  } else {
    // Product not found anywhere
    console.log('Product not found in any database');
    const itemName = `สินค้า ${barcode}`;
    document.getElementById('qaItem').value = itemName;
    showToast(`✓ สแกนบาร์โค้ด: ${barcode}. กรุณากรอกชื่อสินค้า`, 'info');
    
    // Save to localStorage for future use
    saveScannedProduct(barcode, itemName);
  }
  
  // Close scanner after 2 seconds (extra time for API call)
  setTimeout(() => {
    closeBarcodeScanner();
  }, 2000);
}

// Save scanned product to localStorage
function saveScannedProduct(barcode, name, category = null) {
  const savedProducts = JSON.parse(localStorage.getItem('scannedProducts') || '{}');
  savedProducts[barcode] = { name, category };
  localStorage.setItem('scannedProducts', JSON.stringify(savedProducts));
  console.log('Saved product to localStorage:', barcode, name);
}

// Fetch product information from Open Food Facts API
async function fetchProductFromOpenFoodFacts(barcode) {
  try {
    console.log('Fetching from Open Food Facts API...');
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    
    if (!response.ok) {
      console.log('API request failed:', response.status);
      return null;
    }
    
    const data = await response.json();
    console.log('Open Food Facts response:', data);
    
    if (data.status === 1 && data.product) {
      const product = data.product;
      
      // Get product name (prefer Thai, fallback to English, then generic)
      let name = product.product_name_th || 
                 product.product_name_en || 
                 product.product_name || 
                 product.generic_name ||
                 `สินค้า ${barcode}`;
      
      // Try to map Open Food Facts categories to our categories
      const category = mapOpenFoodFactsCategory(product);
      
      console.log('Product found on Open Food Facts:', { name, category });
      
      return { name, category };
    } else {
      console.log('Product not found in Open Food Facts database');
      return null;
    }
  } catch (error) {
    console.error('Error fetching from Open Food Facts:', error);
    return null;
  }
}

// Map Open Food Facts categories to our app categories
function mapOpenFoodFactsCategory(product) {
  const categories = product.categories_tags || product.categories || '';
  const categoryStr = categories.toString().toLowerCase();
  
  // Map to our categories
  if (categoryStr.includes('meat') || categoryStr.includes('poultry') || categoryStr.includes('chicken') || categoryStr.includes('pork') || categoryStr.includes('beef')) {
    return 'Meat & Poultry';
  }
  if (categoryStr.includes('fish') || categoryStr.includes('seafood') || categoryStr.includes('shrimp')) {
    return 'Seafood';
  }
  if (categoryStr.includes('vegetable') || categoryStr.includes('greens')) {
    return 'Vegetables';
  }
  if (categoryStr.includes('fruit')) {
    return 'Fruits';
  }
  if (categoryStr.includes('dairy') || categoryStr.includes('milk') || categoryStr.includes('cheese') || categoryStr.includes('yogurt') || categoryStr.includes('egg')) {
    return 'Dairy & Eggs';
  }
  if (categoryStr.includes('bread') || categoryStr.includes('cereal') || categoryStr.includes('grain') || categoryStr.includes('rice') || categoryStr.includes('pasta')) {
    return 'Grains & Bread';
  }
  if (categoryStr.includes('herb') || categoryStr.includes('spice') || categoryStr.includes('seasoning')) {
    return 'Herbs & Spices';
  }
  if (categoryStr.includes('sauce') || categoryStr.includes('condiment') || categoryStr.includes('dressing')) {
    return 'Condiments & Sauces';
  }
  if (categoryStr.includes('oil') || categoryStr.includes('fat') || categoryStr.includes('butter')) {
    return 'Oils & Fats';
  }
  if (categoryStr.includes('canned') || categoryStr.includes('preserved')) {
    return 'Canned & Jarred';
  }
  if (categoryStr.includes('frozen')) {
    return 'Frozen Foods';
  }
  if (categoryStr.includes('snack') || categoryStr.includes('chip') || categoryStr.includes('cookie')) {
    return 'Snacks';
  }
  if (categoryStr.includes('beverage') || categoryStr.includes('drink') || categoryStr.includes('juice') || categoryStr.includes('soda')) {
    return 'Beverages';
  }
  if (categoryStr.includes('baking') || categoryStr.includes('flour') || categoryStr.includes('sugar')) {
    return 'Baking Supplies';
  }
  
  // Default category
  return 'Other';
}

// Initialize barcode scanner button
document.addEventListener('DOMContentLoaded', () => {
  const scanBtn = document.getElementById('btnScanBarcode');
  const closeBtn = document.getElementById('closeBarcodeModal');
  const modal = document.getElementById('barcodeModal');
  
  if (scanBtn) {
    scanBtn.addEventListener('click', openBarcodeScanner);
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeBarcodeScanner);
  }
  
  // Close modal when clicking outside
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeBarcodeScanner();
      }
    });
  }
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
      closeBarcodeScanner();
    }
  });
});
