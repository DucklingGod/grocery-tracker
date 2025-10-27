// Onboarding Tutorial for First-Time Users

class OnboardingTutorial {
  constructor() {
    this.currentStep = 0;
    this.steps = [
      {
        target: '.brand',
        title: '👋 Welcome to Grocery Tracker!',
        content: 'Track your groceries, reduce waste, and manage your pantry efficiently. Let\'s take a quick tour of all features!',
        position: 'bottom',
        highlightNav: false,
        beforeShow: () => {
          // Navigate to dashboard first
          const dashboardBtn = document.querySelector('[data-view="dashboard"]');
          if (dashboardBtn) dashboardBtn.click();
        }
      },
      {
        target: '.kpis',
        title: '📊 Key Metrics Dashboard',
        content: 'At a glance: Total spending, cooking costs, waste amounts, and inventory alerts. Click any KPI for details!',
        position: 'bottom',
        highlightNav: false,
        beforeShow: () => {
          const dashboardBtn = document.querySelector('[data-view="dashboard"]');
          if (dashboardBtn) dashboardBtn.click();
        }
      },
      {
        target: '.grid',
        title: '📈 Dashboard Charts',
        content: 'Visual insights into your grocery habits: Daily cooking costs, weekly shopping trends, and category breakdowns. Charts update automatically as you add data!',
        position: 'top',
        highlightNav: false
      },
      {
        target: '#recentActivity',
        title: '📝 Recent Activity',
        content: 'Your latest grocery actions at a glance. Quick overview of recent purchases, usage, and waste.',
        position: 'top',
        highlightNav: false,
        beforeShow: () => {
          // If recentActivity doesn't exist, create a placeholder
          if (!document.querySelector('#recentActivity')) {
            const card = document.querySelector('.card:last-child');
            if (card) card.id = 'recentActivity';
          }
        }
      },
      {
        target: '[data-view="quickadd"]',
        title: '⚡ Quick Add - Your Main Tool',
        content: 'The heart of the app! Log all your grocery activities here: Buy new items, Use them, or mark as Waste.',
        position: 'bottom',
        highlightNav: true,
        beforeShow: () => {
          const quickAddBtn = document.querySelector('[data-view="quickadd"]');
          if (quickAddBtn) quickAddBtn.click();
        }
      },
      {
        target: '#qaItem',
        title: '🛒 Item Name',
        content: 'Enter what you bought (e.g., "Milk", "Chicken"). See the 📷 barcode button? Scan products instantly!',
        position: 'bottom',
        highlightNav: false
      },
      {
        target: '#scanBarcodeBtn',
        title: '📷 Barcode Scanner',
        content: 'Scan product barcodes to auto-fill names and details from a database of 3+ million products!',
        position: 'bottom',
        highlightNav: false
      },
      {
        target: '#qaCategory',
        title: '🏷️ Categories',
        content: 'Organize items by category: Meat, Vegetables, Dairy, Snacks, etc. Makes tracking easier!',
        position: 'bottom',
        highlightNav: false
      },
      {
        target: '#qaAction',
        title: '📦 Action Type',
        content: 'Choose what you\'re doing: "Buy" = purchasing, "Use" = consuming, "Waste" = throwing away.',
        position: 'bottom',
        highlightNav: false
      },
      {
        target: '#buyFields',
        title: '💰 Purchase Details',
        content: 'When buying: Enter quantity, price, unit (kg, pack, bottle). The app calculates price per unit automatically!',
        position: 'top',
        highlightNav: false,
        beforeShow: () => {
          const actionSelect = document.querySelector('#qaAction');
          if (actionSelect) {
            actionSelect.value = 'Buy';
            actionSelect.dispatchEvent(new Event('change'));
          }
        }
      },
      {
        target: 'button[type="submit"]',
        title: '✅ Save Your Entry',
        content: 'Click Save to record. Watch for the satisfying checkmark animation! All data is saved locally.',
        position: 'top',
        highlightNav: false
      },
      {
        target: '[data-view="pantry"]',
        title: '🏪 Pantry - Your Inventory',
        content: 'See everything you have on hand. Check quantities, expiration dates, and resupply alerts.',
        position: 'bottom',
        highlightNav: true,
        beforeShow: () => {
          const pantryBtn = document.querySelector('[data-view="pantry"]');
          if (pantryBtn) pantryBtn.click();
        }
      },
      {
        target: '#searchPantry',
        title: '🔍 Smart Search',
        content: 'Find items instantly! Search by name, filter by category. Works on all tables throughout the app.',
        position: 'bottom',
        highlightNav: false
      },
      {
        target: '.table',
        title: '📋 Pantry Actions',
        content: 'For each item: "Use" to consume, "Adjust" to fix quantities, "Remove" to delete. Easy inventory management!',
        position: 'top',
        highlightNav: false
      },
      {
        target: '[data-view="weeklog"]',
        title: '📝 Week Log - Full History',
        content: 'Complete record of ALL activities. See every purchase, usage, and waste event with dates and prices.',
        position: 'bottom',
        highlightNav: true,
        beforeShow: () => {
          const weeklogBtn = document.querySelector('[data-view="weeklog"]');
          if (weeklogBtn) weeklogBtn.click();
        }
      },
      {
        target: '[data-view="waste"]',
        title: '🗑️ Waste Tracker',
        content: 'Monitor food waste. See what you\'re throwing away, why, and how much it costs. Reduce waste over time!',
        position: 'bottom',
        highlightNav: true,
        beforeShow: () => {
          const wasteBtn = document.querySelector('[data-view="waste"]');
          if (wasteBtn) wasteBtn.click();
        }
      },
      {
        target: '[data-view="ai"]',
        title: '🤖 AI Assistant (Optional)',
        content: 'Chat with AI about your grocery data! Get insights, recipe suggestions, and shopping tips.',
        position: 'bottom',
        highlightNav: true,
        beforeShow: () => {
          const aiBtn = document.querySelector('[data-view="ai"]');
          if (aiBtn) aiBtn.click();
        }
      },
      {
        target: '[data-view="settings"]',
        title: '⚙️ Settings & Sync',
        content: 'Export data, sync with household members, change language, or restart this tutorial anytime!',
        position: 'bottom',
        highlightNav: true,
        beforeShow: () => {
          const settingsBtn = document.querySelector('[data-view="settings"]');
          if (settingsBtn) settingsBtn.click();
        }
      },
      {
        target: '.hamburger',
        title: '📱 Mobile Navigation',
        content: 'On mobile? Tap the hamburger menu (☰) to access all sections. Swipe-friendly interface!',
        position: 'bottom',
        highlightNav: false,
        mobileOnly: true,
        beforeShow: () => {
          const dashboardBtn = document.querySelector('[data-view="dashboard"]');
          if (dashboardBtn) dashboardBtn.click();
        }
      },
      {
        target: '.topbar',
        title: '🎉 You\'re Ready to Go!',
        content: 'You\'ve seen all features! Pro tip: Use Alt+1-6 for quick navigation. Start tracking and reduce waste! 🌱',
        position: 'bottom',
        highlightNav: false,
        isLast: true,
        beforeShow: () => {
          const dashboardBtn = document.querySelector('[data-view="dashboard"]');
          if (dashboardBtn) dashboardBtn.click();
        }
      }
    ];
    this.overlay = null;
    this.tooltip = null;
    this.currentTarget = null;
    this.scrollHandler = null;
  }

  start() {
    // Always start fresh, even if completed before (for restart)
    // Check only if not manually restarting
    if (localStorage.getItem('onboardingCompleted') === 'true' && !this.isRestarting) {
      return;
    }
    this.isRestarting = false;

    this.currentStep = 0;
    this.createOverlay();
    this.showStep(0);
  }

  createOverlay() {
    // Create dark overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'onboarding-overlay';
    document.body.appendChild(this.overlay);

    // Create tooltip
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'onboarding-tooltip';
    document.body.appendChild(this.tooltip);
  }

  showStep(stepIndex) {
    const step = this.steps[stepIndex];
    
    // Check if mobile-only and skip if not mobile
    if (step.mobileOnly && window.innerWidth > 768) {
      this.nextStep();
      return;
    }

    // Run beforeShow callback if exists
    if (step.beforeShow) {
      step.beforeShow();
    }

    // Wait a bit for view changes
    setTimeout(() => {
      const target = document.querySelector(step.target);
      
      if (!target) {
        console.warn('Onboarding target not found:', step.target);
        // Don't skip, try again with longer delay
        setTimeout(() => {
          const retryTarget = document.querySelector(step.target);
          if (!retryTarget) {
            console.error('Target still not found, skipping:', step.target);
            this.nextStep();
            return;
          }
          this.continueShowStep(retryTarget, step);
        }, 500);
        return;
      }

      this.continueShowStep(target, step);
    }, step.beforeShow ? 400 : 100);
  }

  continueShowStep(target, step) {
    // Store current target for repositioning
    this.currentTarget = target;
    
    // Scroll target into view smoothly
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });

    // Wait for scroll to complete
    setTimeout(() => {
      // Highlight the target element
      this.highlightElement(target, step.highlightNav);

      // Position and show tooltip
      this.positionTooltip(target, step);
      this.updateTooltipContent(step);

      // Ensure overlay and tooltip are visible
      if (!this.overlay || !this.tooltip) {
        console.error('Overlay or tooltip missing, recreating...');
        this.createOverlay();
      }

      // Show overlay and tooltip
      this.overlay.classList.add('active');
      this.tooltip.classList.add('active');

      // Force reflow to ensure visibility
      void this.tooltip.offsetWidth;
      
      // Setup scroll listener to reposition tooltip
      this.setupScrollListener(target, step);
    }, 300);
  }

  setupScrollListener(target, step) {
    // Remove previous scroll listener if any
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler, true);
    }

    // Create new scroll handler
    this.scrollHandler = () => {
      if (this.tooltip && this.tooltip.classList.contains('active')) {
        this.positionTooltip(target, step);
      }
    };

    // Add scroll listener (with capture to catch all scroll events)
    window.addEventListener('scroll', this.scrollHandler, true);
  }

  highlightElement(element, highlightNav) {
    // Remove previous highlights
    document.querySelectorAll('.onboarding-highlight').forEach(el => {
      el.classList.remove('onboarding-highlight');
    });

    // Add highlight to target
    element.classList.add('onboarding-highlight');

    // If it's a nav button, highlight the entire nav bar
    if (highlightNav) {
      const nav = document.querySelector('.nav');
      if (nav) nav.classList.add('onboarding-highlight');
    }
  }

  positionTooltip(target, step) {
    const rect = target.getBoundingClientRect();
    const tooltip = this.tooltip;
    const tooltipRect = tooltip.getBoundingClientRect();

    let top, left;

    // Position based on step.position
    switch (step.position) {
      case 'bottom':
        top = rect.bottom + 20;
        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'top':
        top = rect.top - tooltipRect.height - 20;
        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
        left = rect.left - tooltipRect.width - 20;
        break;
      case 'right':
        top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
        left = rect.right + 20;
        break;
      default:
        top = rect.bottom + 20;
        left = rect.left;
    }

    // Ensure tooltip stays within viewport
    const padding = 20;
    if (left < padding) left = padding;
    if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding;
    }
    if (top < padding) top = rect.bottom + 20;
    if (top + tooltipRect.height > window.innerHeight - padding) {
      top = rect.top - tooltipRect.height - 20;
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }

  updateTooltipContent(step) {
    const progressText = `${this.currentStep + 1}/${this.steps.length}`;
    const isLast = step.isLast || this.currentStep === this.steps.length - 1;

    this.tooltip.innerHTML = `
      <div class="onboarding-tooltip-header">
        <div class="onboarding-tooltip-title">${step.title}</div>
        <button class="onboarding-close" onclick="onboarding.skip()">✕</button>
      </div>
      <div class="onboarding-tooltip-content">${step.content}</div>
      <div class="onboarding-tooltip-footer">
        <div class="onboarding-progress">${progressText}</div>
        <div class="onboarding-buttons">
          ${this.currentStep > 0 ? '<button class="onboarding-btn secondary" onclick="onboarding.prevStep()">← Back</button>' : ''}
          ${isLast 
            ? '<button class="onboarding-btn primary" onclick="onboarding.finish()">🎉 Start Using</button>'
            : '<button class="onboarding-btn primary" onclick="onboarding.nextStep()">Next →</button>'
          }
        </div>
      </div>
    `;
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.showStep(this.currentStep);
    } else {
      this.finish();
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.showStep(this.currentStep);
    }
  }

  skip() {
    if (confirm('Are you sure you want to skip the tutorial? You can restart it from Settings.')) {
      this.finish();
    }
  }

  finish() {
    localStorage.setItem('onboardingCompleted', 'true');
    
    // Remove scroll listener
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler, true);
      this.scrollHandler = null;
    }
    
    // Remove highlights
    document.querySelectorAll('.onboarding-highlight').forEach(el => {
      el.classList.remove('onboarding-highlight');
    });

    // Fade out and remove
    if (this.overlay) this.overlay.classList.remove('active');
    if (this.tooltip) this.tooltip.classList.remove('active');

    setTimeout(() => {
      if (this.overlay) {
        this.overlay.remove();
        this.overlay = null;
      }
      if (this.tooltip) {
        this.tooltip.remove();
        this.tooltip = null;
      }
      this.currentTarget = null;
    }, 300);

    // Show success message
    if (typeof showToast !== 'undefined') {
      showToast('🎉 Tutorial completed! Happy tracking!', 'success');
    }
  }

  restart() {
    // Clean up existing tutorial if running
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
    
    // Remove all highlights
    document.querySelectorAll('.onboarding-highlight').forEach(el => {
      el.classList.remove('onboarding-highlight');
    });
    
    // Reset state
    localStorage.removeItem('onboardingCompleted');
    this.currentStep = 0;
    this.isRestarting = true;
    
    // Navigate to dashboard first
    const dashboardBtn = document.querySelector('[data-view="dashboard"]');
    if (dashboardBtn) dashboardBtn.click();
    
    // Start tutorial after navigation
    setTimeout(() => {
      this.start();
    }, 300);
  }
}

// Create global instance
const onboarding = new OnboardingTutorial();

// Auto-start on first visit
window.addEventListener('load', () => {
  // Small delay to ensure everything is loaded
  setTimeout(() => {
    onboarding.start();
  }, 500);
});
