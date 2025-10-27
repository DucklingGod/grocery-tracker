// Onboarding Tutorial for First-Time Users

class OnboardingTutorial {
  constructor() {
    this.currentStep = 0;
    this.steps = [
      {
        target: '.brand',
        title: '👋 Welcome to Grocery Tracker!',
        content: 'Track your groceries, reduce waste, and manage your pantry efficiently. Let\'s take a quick tour!',
        position: 'bottom',
        highlightNav: false
      },
      {
        target: '[data-view="dashboard"]',
        title: '📊 Dashboard',
        content: 'See your spending, cooking costs, and waste metrics at a glance. Your grocery insights in one place!',
        position: 'bottom',
        highlightNav: true
      },
      {
        target: '[data-view="quickadd"]',
        title: '⚡ Quick Add',
        content: 'The fastest way to log groceries! Buy, Use, or mark items as Waste. You can also scan barcodes!',
        position: 'bottom',
        highlightNav: true
      },
      {
        target: '[data-view="pantry"]',
        title: '🏪 Pantry',
        content: 'View all items you have on hand, check expiration dates, and manage inventory levels.',
        position: 'bottom',
        highlightNav: true
      },
      {
        target: '[data-view="weeklog"]',
        title: '📝 Week Log',
        content: 'Complete history of all your grocery activities - purchases, usage, and waste.',
        position: 'bottom',
        highlightNav: true
      },
      {
        target: '[data-view="waste"]',
        title: '🗑️ Waste Tracker',
        content: 'Monitor what you\'re wasting and why. Get insights to reduce food waste over time.',
        position: 'bottom',
        highlightNav: true
      },
      {
        target: '#qaItem',
        title: '🛒 Let\'s Add Your First Item',
        content: 'Start by entering an item name (e.g., "Milk" or "Chicken Breast"). Try the barcode scanner button for quick input!',
        position: 'bottom',
        highlightNav: false,
        beforeShow: () => {
          // Switch to Quick Add view
          const quickAddBtn = document.querySelector('[data-view="quickadd"]');
          if (quickAddBtn) quickAddBtn.click();
        }
      },
      {
        target: '#qaAction',
        title: '📦 Choose an Action',
        content: 'Select "Buy" when purchasing groceries, "Use" when consuming them, or "Waste" if discarding.',
        position: 'bottom',
        highlightNav: false
      },
      {
        target: 'button[type="submit"]',
        title: '✅ Save Your Entry',
        content: 'Click Save to record your grocery activity. You\'ll see a satisfying checkmark animation!',
        position: 'top',
        highlightNav: false
      },
      {
        target: '.hamburger',
        title: '📱 Mobile Navigation',
        content: 'On mobile? Tap the hamburger menu (☰) to access all sections quickly.',
        position: 'bottom',
        highlightNav: false,
        mobileOnly: true
      },
      {
        target: '.topbar',
        title: '🎉 You\'re All Set!',
        content: 'Start tracking your groceries now! Use keyboard shortcuts (Alt+1-6) for quick navigation. Enjoy!',
        position: 'bottom',
        highlightNav: false,
        isLast: true
      }
    ];
    this.overlay = null;
    this.tooltip = null;
  }

  start() {
    // Check if user has seen the tutorial
    if (localStorage.getItem('onboardingCompleted') === 'true') {
      return;
    }

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
        this.nextStep();
        return;
      }

      // Highlight the target element
      this.highlightElement(target, step.highlightNav);

      // Position and show tooltip
      this.positionTooltip(target, step);
      this.updateTooltipContent(step);

      // Show overlay and tooltip
      this.overlay.classList.add('active');
      this.tooltip.classList.add('active');
    }, step.beforeShow ? 300 : 0);
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
    
    // Remove highlights
    document.querySelectorAll('.onboarding-highlight').forEach(el => {
      el.classList.remove('onboarding-highlight');
    });

    // Fade out and remove
    this.overlay.classList.remove('active');
    this.tooltip.classList.remove('active');

    setTimeout(() => {
      if (this.overlay) this.overlay.remove();
      if (this.tooltip) this.tooltip.remove();
    }, 300);

    // Show success message
    if (typeof showToast !== 'undefined') {
      showToast('🎉 Tutorial completed! Happy tracking!', 'success');
    }
  }

  restart() {
    localStorage.removeItem('onboardingCompleted');
    this.start();
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
