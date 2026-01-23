/**
 * Main JavaScript for Nordhealth Nora Landing Page
 * Handles:
 * - Load animations (fade in + translateY)
 * - Scroll-based background transition
 */

(function () {
  "use strict";

  // ============================================
  // Load Animations (GitHub-style)
  // ============================================

  /**
   * Initialize fade-in-up animations on page load
   * Animates elements with opacity: 0 → 1 and translateY(24px → 0)
   */
  function initLoadAnimations() {
    const animatedElements = document.querySelectorAll(".fade-in-up");

    // Function to animate an element
    function animateElement(element, delay = 0) {
      setTimeout(() => {
        element.classList.add("animate");
      }, delay);
    }

    // Animate each element with its specified delay
    animatedElements.forEach((element) => {
      const delayAttr = element.getAttribute("data-animation-delay");
      const delay = delayAttr ? parseFloat(delayAttr) * 1000 : 0;
      animateElement(element, delay);
    });
  }

  // ============================================
  // Scroll-Based Background Transition
  // ============================================

  /**
   * Smoothly transition background color when scrolling past the END of sections
   * Reference: https://abergmedia.com/ footer animation behavior
   *
   * Handles two transitions:
   * 1. Hero section: dark gradient → light background
   * 2. Reflective Space section: light background → dark gradient (for stats section)
   */
  function initBackgroundTransition() {
    const heroSection = document.getElementById("hero-section");
    const reflectiveSpaceSection = document.getElementById(
      "reflective-space-section",
    );
    const body = document.body;

    if (!heroSection) return;

    /**
     * Check scroll position for both hero and reflective space sections
     * Updates body background based on which sections have been scrolled past
     *
     * Background states:
     * - Initial: Dark (matching hero section)
     * - After hero scrolled past: Light (#F3F5FC)
     * - After reflective space scrolled past: Dark (matching stats section)
     */
    function checkScrollPosition() {
      // Check hero section
      const heroRect = heroSection.getBoundingClientRect();
      const heroBottom = heroRect.bottom;

      // Check reflective space section
      let reflectiveSpaceBottom = Infinity;
      if (reflectiveSpaceSection) {
        const reflectiveSpaceRect =
          reflectiveSpaceSection.getBoundingClientRect();
        reflectiveSpaceBottom = reflectiveSpaceRect.bottom;
      }

      // Determine background state based on scroll position
      // Logic: Check reflective space first (it's further down), then hero
      if (reflectiveSpaceSection && reflectiveSpaceBottom <= 0) {
        // Reflective Space section's END has been scrolled past - transition to dark background
        if (!body.classList.contains("reflective-space-exited")) {
          body.classList.add("reflective-space-exited");
          body.classList.remove("hero-exited"); // Remove light background state
          // console.log(
            "Reflective Space section scrolled past - background transitioning to dark",
          );
        }
      } else if (heroBottom <= 0) {
        // Hero section's END has been scrolled past (but reflective space not yet) - transition to light background
        if (!body.classList.contains("hero-exited")) {
          body.classList.add("hero-exited");
          body.classList.remove("reflective-space-exited"); // Ensure dark state is removed
          // console.log(
            "Hero section scrolled past - background transitioning to light",
          );
        }
      } else {
        // Both sections still visible - keep initial dark background
        if (
          body.classList.contains("hero-exited") ||
          body.classList.contains("reflective-space-exited")
        ) {
          body.classList.remove("hero-exited");
          body.classList.remove("reflective-space-exited");
          // console.log("Sections visible - background back to initial dark");
        }
      }
    }

    // Throttle scroll events for better performance
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkScrollPosition();
          ticking = false;
        });
        ticking = true;
      }
    }

    // Listen to scroll events
    window.addEventListener("scroll", onScroll, { passive: true });

    // Initial check in case page loads with sections already scrolled past
    checkScrollPosition();
  }

  // ============================================
  // Footer Takeover Animation (Abergmedia-style)
  // ============================================

  /**
   * Premium footer reveal animation when entering viewport
   * Reference: https://abergmedia.com/ footer animation behavior
   *
   * Creates a smooth "takeover" effect where the footer content
   * fades in and slides up with premium timing (1.5s duration, 100ms delay)
   *
   * Technical specs:
   * - Initial state: opacity 0, translateY(12px)
   * - Trigger: 10-20% of footer visible
   * - Duration: 1500ms with 100ms delay
   * - Easing: ease-in-out
   */
  function initFooterAnimation() {
    const footer = document.getElementById("footer-section");

    if (!footer) return;

    const footerContainer = footer.querySelector(".footer-container");

    if (!footerContainer) return;

    // Create intersection observer to detect when footer enters viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
            // Footer is entering viewport (10%+ visible) - trigger reveal
            footerContainer.classList.add("footer-revealed");
            // console.log("Footer takeover animation triggered");
          }
        });
      },
      {
        // Trigger when footer is 10-20% visible for early, smooth reveal
        threshold: [0.1, 0.2],
        // Start observing slightly before footer enters viewport
        rootMargin: "0px 0px -50px 0px",
      },
    );

    observer.observe(footer);
  }

  // ============================================
  // Role Tab Interaction
  // ============================================

  /**
   * Handle role tab clicks
   */
  function initRoleTabs() {
    const roleTabs = document.querySelectorAll(".role-tab");

    roleTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        // Remove active class from all tabs
        roleTabs.forEach((t) => t.classList.remove("active"));
        // Add active class to clicked tab
        tab.classList.add("active");
      });
    });
  }

  // ============================================
  // Feature Slider (GitHub-style)
  // ============================================

  /**
   * Initialize feature slider with click-to-change functionality
   * Similar to GitHub's interactive sections where clicking changes displayed content
   */
  function initFeatureSlider() {
    const featureCards = document.querySelectorAll(".feature-card-clickable");
    const featureImages = document.querySelectorAll(".feature-display-image");
    const featureContents = document.querySelectorAll(
      ".feature-display-content",
    );

    if (featureCards.length === 0) return;

    /**
     * Switch to a specific feature index
     * @param {number} index - The feature index to display
     */
    function switchFeature(index) {
      // Remove active class from all elements
      featureCards.forEach((card) => card.classList.remove("active"));
      featureImages.forEach((img) => img.classList.remove("active"));
      featureContents.forEach((content) => content.classList.remove("active"));

      // Add active class to selected elements
      const selectedCard = document.querySelector(
        `[data-feature-index="${index}"]`,
      );
      const selectedImage = document.querySelector(
        `.feature-display-image[data-feature-index="${index}"]`,
      );
      const selectedContent = document.querySelector(
        `.feature-display-content[data-feature-index="${index}"]`,
      );

      if (selectedCard) selectedCard.classList.add("active");
      if (selectedImage) selectedImage.classList.add("active");
      if (selectedContent) selectedContent.classList.add("active");
    }

    // Add click event listeners to feature cards
    featureCards.forEach((card) => {
      card.addEventListener("click", () => {
        const index = parseInt(card.getAttribute("data-feature-index"), 10);
        if (!isNaN(index)) {
          switchFeature(index);
        }
      });
    });

    // Initialize with first feature active
    switchFeature(0);
  }

  // ============================================
  // Smooth Scroll for Anchor Links
  // ============================================

  /**
   * Handle smooth scrolling for anchor links
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  }

  // ============================================
  // Performance Optimization
  // ============================================

  /**
   * Throttle function for scroll events
   */
  function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ============================================
  // Initialize on DOM Ready
  // ============================================

  /**
   * Initialize all functionality when DOM is ready
   */
  function init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
      return;
    }

    // Initialize animations and interactions
    initLoadAnimations();
    initBackgroundTransition();
    initFooterAnimation();
    initRoleTabs();
    initFeatureSlider();
    initSmoothScroll();

    // Log initialization (can be removed in production)
    // console.log("Nordhealth Nora landing page initialized");
  }

  // Start initialization
  init();
})();

// Hero Image Slider Logic
const tabs = document.querySelectorAll(".role-tab");
const indicator = document.querySelector(".active-indicator");
const heroImg = document.querySelector(".hero-img");

// Detect base path from current URL (handles /nordhealth.ai_launchable/ prefix)
const pathMatch = window.location.pathname.match(/^(\/[^\/]+)?\/nora\//);
const basePath = pathMatch ? (pathMatch[1] || '') : '';

const images = [
  basePath + "/images/Nora_hero_asset_1_General_Practice_FI.png",
  basePath + "/images/Nora_hero_asset_1_Psychotherapists_FI.png",
  basePath + "/images/Nora_hero_asset_1_Speech%20therapists_FI.png",
  basePath + "/images/Nora_hero_asset_1_Physiotherapists_FI.png",
  basePath + "/images/Nora_hero_asset_1_General_Practice_FI.png",
];

// Preload images for smoother transitions
images.forEach(src => {
  const img = new Image();
  img.src = src;
});

let activeTab = document.querySelector(".role-tab.active");

function moveIndicator(tab, animate = true) {
  if (!tab) return;

  indicator.style.transition = animate
    ? "opacity 0.2s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), width 0.35s ease"
    : "none";

  indicator.style.width = `${tab.offsetWidth}px`;
  indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    if (tab === activeTab) return;

    activeTab?.classList.remove("active");
    tab.classList.add("active");
    activeTab = tab;

    indicator.style.opacity = "1";

    moveIndicator(tab);

    if (heroImg && images[index]) {
      heroImg.classList.add("fade-out");
      setTimeout(() => {
        heroImg.src = images[index];
        heroImg.classList.remove("fade-out");
      }, 220);
    }

    // Switch tab content text
    const tabContentItems = document.querySelectorAll(".tab-content-item");
    tabContentItems.forEach((item) => item.classList.remove("active"));
    const targetContent = document.querySelector(`.tab-content-item[data-tab="${index}"]`);
    if (targetContent) {
      targetContent.classList.add("active");
    }
  });
});

window.addEventListener("load", () => {
  moveIndicator(activeTab, false);
  indicator.style.opacity = activeTab ? "1" : "0";
});

window.addEventListener("resize", () => {
  moveIndicator(activeTab, false);
});

const footer = document.getElementById("footer");
const footerContainer = document.querySelector(".footer-container");
const body = document.body;

window.addEventListener("scroll", () => {
  const footerTop = footer.getBoundingClientRect().top;
  const windowHeight = window.innerHeight;
  const footerHeight = footer.offsetHeight;
  
  const transitionStart = windowHeight; 
  const transitionEnd = -footerHeight; 
  const transitionRange = transitionStart - transitionEnd;
  
  let scrollProgress = 0;
  
  if (footerTop < transitionStart && footerTop > transitionEnd) {
    scrollProgress = 1 - (footerTop - transitionEnd) / transitionRange;
    scrollProgress = Math.max(0, Math.min(1, scrollProgress));
  } else if (footerTop <= transitionEnd) {
    scrollProgress = 1;
  }
  
  if (scrollProgress > 0) {
    footer.style.setProperty("--scroll-progress", scrollProgress);
    footerContainer.classList.add("footer-revealed");
    body.classList.add("dark-mode");
    footer.classList.add("scroll-active");
  } else {
    footer.style.setProperty("--scroll-progress", "0");
    footerContainer.classList.remove("footer-revealed");
    body.classList.remove("dark-mode");
    footer.classList.remove("scroll-active");
  }
});

// Mobile Menu Toggle
const navBurger = document.querySelector(".nav-burger");
const navActions = document.querySelector(".nav-actions");

if (navBurger && navActions) {
  navBurger.addEventListener("click", () => {
    const isActive = navActions.classList.contains("active");
    navBurger.classList.toggle("active");
    navActions.classList.toggle("active");
    // Lock/unlock body scroll when menu opens/closes
    document.body.style.overflow = isActive ? "" : "hidden";
  });

  // Close menu when clicking a link (except demo buttons)
  navActions.querySelectorAll("a").forEach((item) => {
    item.addEventListener("click", () => {
      navBurger.classList.remove("active");
      navActions.classList.remove("active");
      document.body.style.overflow = "";
    });
  });
}

// Demo Modal with Lazy-loaded HubSpot Form
const demoModal = document.getElementById("demoModal");
const demoButtons = document.querySelectorAll(".btn-secondary, .btn-demo-trigger");
const modalClose = document.querySelector(".modal-close");
let hsScriptLoaded = false;

function loadHubSpotScript() {
  if (hsScriptLoaded) return;

  const script = document.createElement("script");
  script.src = "https://js-eu1.hsforms.net/forms/embed/144062425.js";
  script.defer = true;
  document.head.appendChild(script);
  hsScriptLoaded = true;
}

function openDemoModal() {
  loadHubSpotScript();
  demoModal.classList.add("active");
  document.body.style.overflow = "hidden";

  // Close mobile menu if open
  if (navBurger && navActions) {
    navBurger.classList.remove("active");
    navActions.classList.remove("active");
  }
}

function closeDemoModal() {
  demoModal.classList.remove("active");
  document.body.style.overflow = "";
}

// Attach click handlers to all "Book a demo" buttons
demoButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    openDemoModal();
  });
});

// Close modal handlers
if (modalClose) {
  modalClose.addEventListener("click", closeDemoModal);
}

if (demoModal) {
  demoModal.addEventListener("click", (e) => {
    if (e.target === demoModal) {
      closeDemoModal();
    }
  });
}

// Close on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && demoModal.classList.contains("active")) {
    closeDemoModal();
  }
});
