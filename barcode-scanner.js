// Barcode Scanner using HTML5-QRCode library
let barcodeScanner = null;
let scanning = false;

// Product database mapping (you can expand this)
const productDatabase = {
  // Thai products - common grocery items
  '8850123456789': { name: 'นมสด', category: 'Dairy & Eggs' },
  '8851234567890': { name: 'ข้าวหอมมะลิ', category: 'Grains & Bread' },
  // Add more as needed
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
  
  // Request camera access
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment', // Use back camera on mobile
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    })
    .then(stream => {
      video.srcObject = stream;
      video.play();
      scanning = true;
      startBarcodeDetection(video);
    })
    .catch(err => {
      console.error('Camera access denied:', err);
      showToast('❌ Camera access denied. Please allow camera permissions.', 'error');
      closeBarcodeScanner();
    });
  } else {
    showToast('❌ Camera not supported on this device', 'error');
    closeBarcodeScanner();
  }
}

// Close barcode scanner modal
function closeBarcodeScanner() {
  const modal = document.getElementById('barcodeModal');
  const video = document.getElementById('barcodeVideo');
  
  scanning = false;
  
  // Stop video stream
  if (video && video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
  
  if (modal) {
    modal.style.display = 'none';
  }
}

// Barcode detection using BarcodeDetector API or fallback
async function startBarcodeDetection(video) {
  // Check if BarcodeDetector is supported
  if ('BarcodeDetector' in window) {
    try {
      const barcodeDetector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'] });
      
      const detectBarcode = async () => {
        if (!scanning) return;
        
        try {
          const barcodes = await barcodeDetector.detect(video);
          
          if (barcodes.length > 0) {
            const barcode = barcodes[0].rawValue;
            handleBarcodeDetected(barcode);
            return;
          }
        } catch (err) {
          console.error('Barcode detection error:', err);
        }
        
        // Continue scanning
        requestAnimationFrame(detectBarcode);
      };
      
      detectBarcode();
    } catch (err) {
      console.error('BarcodeDetector error:', err);
      showToast('⚠️ Barcode detection not fully supported. Using fallback method.', 'info');
      useZXingFallback(video);
    }
  } else {
    // Fallback: Use ZXing library
    useZXingFallback(video);
  }
}

// Fallback using ZXing browser library
function useZXingFallback(video) {
  // Dynamically load ZXing library
  if (typeof ZXing === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@zxing/library@latest';
    script.onload = () => {
      initZXingScanner(video);
    };
    script.onerror = () => {
      showToast('❌ Failed to load barcode scanner. Please check internet connection.', 'error');
      closeBarcodeScanner();
    };
    document.head.appendChild(script);
  } else {
    initZXingScanner(video);
  }
}

// Initialize ZXing scanner
function initZXingScanner(video) {
  const codeReader = new ZXing.BrowserMultiFormatReader();
  
  codeReader.decodeFromVideoElement(video, (result, err) => {
    if (result && scanning) {
      handleBarcodeDetected(result.text);
    }
    // Continue scanning even if error
  });
}

// Handle detected barcode
function handleBarcodeDetected(barcode) {
  scanning = false;
  
  const resultDiv = document.getElementById('barcodeResult');
  resultDiv.textContent = `✓ Barcode detected: ${barcode}`;
  resultDiv.classList.add('show');
  
  // Look up product in database
  const product = productDatabase[barcode];
  
  if (product) {
    // Auto-fill form with product info
    document.getElementById('qaItem').value = product.name;
    document.getElementById('qaCategory').value = product.category;
    showToast(`✓ Product found: ${product.name}`, 'success');
  } else {
    // Just fill in the barcode as item name
    document.getElementById('qaItem').value = `Product ${barcode.slice(-6)}`;
    showToast(`✓ Barcode scanned. Please enter product details.`, 'info');
  }
  
  // Close scanner after 1.5 seconds
  setTimeout(() => {
    closeBarcodeScanner();
  }, 1500);
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
