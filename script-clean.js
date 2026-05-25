// Portfolio website animations and interactions

function initPortfolio() {
  // Share navbar height for layout calculations (e.g., about page fixed panel height)
  function updateNavbarHeightVar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    const height = navbar.offsetHeight || 0;
    document.documentElement.style.setProperty(
      '--navbar-height',
      `${height}px`,
    );
  }

  updateNavbarHeightVar();
  window.addEventListener('resize', updateNavbarHeightVar);

  // Detect if this is a SPA re-init (navbar is preserved, don't re-animate it)
  const isSpaTransition = window.__spaTransition || false;
  window.__spaTransition = false;

  // Sequential spring blur animation system
  const elementsToAnimate = [
    { selector: '.navbar', delay: 300 },
    // About page: animate the panel with the same system (no effect on home)
    { selector: '.about-panel', delay: 500 },
    { selector: '.hero', delay: 500 },
    { selector: '.case-studies', delay: 700 },
    { selector: '.articles-section', delay: 700 },
    { selector: '.my-products-section', delay: 900 },
    { selector: '.work-experience-section', delay: 1100 },
    { selector: '.testimonials-section', delay: 1300 },
    { selector: '.footer-section', delay: 1500 },
    // Case study specific selectors
    { selector: '.case-study-header', delay: 500 },
    { selector: '.case-study-app-card', delay: 700 },
    { selector: '.case-study-page-content .case-study-text-container > .case-study-featured-image', delay: 800 },
    { selector: '.case-study-achievements', delay: 900 },
    { selector: '.case-study-sections', delay: 1000 },
    { selector: '.case-study-description', delay: 1100 },
    // About page specific selectors (for SPA navigation to about.html)
    { selector: '.about-modal-left', delay: 500 },
    { selector: '.about-title', delay: 600 },
    { selector: '.about-modal-nav', delay: 700 },
    { selector: '.about-modal-body-stack', delay: 800 }
  ];

  // Start sequential animations
  elementsToAnimate.forEach(({ selector, delay }) => {
    // Skip navbar animation during SPA transitions (it's already visible)
    if (isSpaTransition && selector === '.navbar') return;

    const element = document.querySelector(selector);
    if (element) {
      element.classList.add('fade-blur-up');
      setTimeout(() => {
        element.classList.add('animate');
      }, delay);
    }
  });
  // Navbar remains static at top of page; no scroll background behavior

  // Re-define navLinks for mobile menu logic to maintain original behavior
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  // Helper usable outside the mobile-menu init block (so other handlers can close menu safely)
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
  function closeMobileMenuIfPresent() {
    if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
    if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
    document.body.classList.remove('mobile-menu-open');
  }

  // Guard: only attach navbar listeners once (SPA transitions preserve the navbar)
  const navbarEl = document.querySelector('.navbar');
  if (navbarEl && !navbarEl.__navInitialized) {
    navbarEl.__navInitialized = true;

    // Logo click handler for home navigation
    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
      logoLink.addEventListener('click', function (e) {
        const href = this.getAttribute('href') || '';
        const isHome =
          window.location.pathname.endsWith('/') ||
          window.location.pathname.endsWith('/index.html') ||
          window.location.pathname.endsWith('index.html');

        // If we're already on home, keep the existing smooth scroll-to-top behavior.
        if (
          isHome &&
          (href === 'index.html' || href === './index.html' || href === '/')
        ) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    // Navigation links functionality
    const allScrollLinks = document.querySelectorAll(
      '.nav-link, .highlight-text',
    );
    allScrollLinks.forEach((link) => {
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href') || '';
        const isHome =
          window.location.pathname.endsWith('/') ||
          window.location.pathname.endsWith('/index.html') ||
          window.location.pathname.endsWith('index.html');

        // If we're already on home, prevent reload and smooth scroll to top when clicking home links
        if (
          isHome &&
          (href === 'index.html' || href === './index.html' || href === '/')
        ) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        // Smooth-scroll for in-page anchor navigation
        if (href.startsWith('#') && href.length > 1) {
          const targetId = href.slice(1);
          const targetEl = document.getElementById(targetId);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } else if (href === '#' || href === '') {
          // Keep previous behavior for placeholder links
          e.preventDefault();
        }

        // Handle active state only for navbar links
        if (this.classList.contains('nav-link')) {
          const desktopNavLinks = document.querySelectorAll('.nav-link');
          desktopNavLinks.forEach((l) => l.classList.remove('active'));
          this.classList.add('active');
        }
      });
    });

    if (mobileMenuToggle && mobileMenuOverlay) {
      // Toggle mobile menu
      mobileMenuToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        const isActive = mobileMenuToggle.classList.contains('active');

        if (isActive) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });

      // Close menu when clicking outside
      document.addEventListener('click', function (e) {
        if (
          mobileMenuOverlay.classList.contains('active') &&
          !mobileMenuOverlay.contains(e.target) &&
          !mobileMenuToggle.contains(e.target)
        ) {
          closeMobileMenu();
        }
      });

      // Handle mobile nav link clicks
      mobileNavLinks.forEach((link) => {
        link.addEventListener('click', function (e) {
          const href = this.getAttribute('href') || '';

          if (href.startsWith('#') && href.length > 1) {
            const targetId = href.slice(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
              e.preventDefault();
              targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          } else if (href === '#' || href === '') {
            e.preventDefault();
          }

          // Remove active class from all mobile links
          mobileNavLinks.forEach((l) => l.classList.remove('active'));
          // Remove active class from desktop links too
          navLinks.forEach((l) => l.classList.remove('active'));

          // Add active class to clicked mobile link
          this.classList.add('active');

          // Add active class to corresponding desktop link
          const linkText = this.textContent;
          const correspondingDesktopLink = Array.from(navLinks).find(
            (link) => link.textContent === linkText,
          );
          if (correspondingDesktopLink) {
            correspondingDesktopLink.classList.add('active');
          }

          // Close mobile menu after selection
          closeMobileMenu();
        });
      });

      function openMobileMenu() {
        mobileMenuToggle.classList.add('active');
        mobileMenuOverlay.classList.add('active');
        document.body.classList.add('mobile-menu-open');
      }

      function closeMobileMenu() {
        mobileMenuToggle.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        document.body.classList.remove('mobile-menu-open');
      }
    }
  } // end navbar init guard

  // About Modal Functionality (reuses the same modal CSS classes as case studies)
  const aboutModal = document.getElementById('about-modal');
  const aboutModalOverlay = aboutModal
    ? aboutModal.querySelector('.case-study-modal-overlay')
    : null;
  const aboutModalClose = aboutModal
    ? aboutModal.querySelector('.case-study-modal-close')
    : null;
  const aboutModalContainer = aboutModal
    ? aboutModal.querySelector('.case-study-modal-container')
    : null;

  // --- About Nav Tab Interaction ---
  const aboutNav = aboutModal
    ? aboutModal.querySelector('.about-modal-nav')
    : null;
  const aboutNavSlider = aboutNav
    ? aboutNav.querySelector('.about-nav-slider')
    : null;
  const aboutNavItems = aboutNav
    ? aboutNav.querySelectorAll('.about-modal-nav-item')
    : [];
  const aboutBodies = aboutModal
    ? aboutModal.querySelectorAll('.about-modal-body[data-tab]')
    : [];
  const aboutBodyStack = aboutModal
    ? aboutModal.querySelector('.about-modal-body-stack')
    : null;
  let activeAboutBody = Array.from(aboutBodies).find(function (body) {
    return body.classList.contains('is-active');
  });
  if (!activeAboutBody && aboutBodies.length) {
    activeAboutBody = aboutBodies[0];
    activeAboutBody.classList.add('is-visible', 'is-active');
  }

  function setAboutBodyStackHeight(body) {
    if (!aboutBodyStack || !body) return;
    const targetHeight = body.scrollHeight;
    aboutBodyStack.style.height = targetHeight + 'px';
  }

  function clearAboutBodyAnimation(body, phase) {
    if (!body) return;
    const handlerKey =
      phase === 'enter' ? '__aboutEnterHandler' : '__aboutExitHandler';
    const timeoutKey =
      phase === 'enter' ? '__aboutEnterTimeout' : '__aboutExitTimeout';
    const handler = body[handlerKey];
    if (handler) {
      body.removeEventListener('animationend', handler);
      body[handlerKey] = null;
    }
    const timeoutId = body[timeoutKey];
    if (timeoutId !== undefined && timeoutId !== null) {
      clearTimeout(timeoutId);
      body[timeoutKey] = null;
    }
  }

  function activateAboutBody(body) {
    if (!body) return;
    clearAboutBodyAnimation(body, 'exit');
    clearAboutBodyAnimation(body, 'enter');
    body.classList.remove('is-leaving');
    body.classList.add('is-visible');
    requestAnimationFrame(function () {
      body.classList.add('is-active');
      body.classList.add('is-entering');
      const handleEnterEnd = function (event) {
        if (
          event.target !== body ||
          event.animationName !== 'aboutModalBodyFadeIn'
        ) {
          return;
        }
        body.classList.remove('is-entering');
        if (body.__aboutEnterHandler === handleEnterEnd) {
          body.__aboutEnterHandler = null;
        }
        body.removeEventListener('animationend', handleEnterEnd);
      };
      body.__aboutEnterHandler = handleEnterEnd;
      body.addEventListener('animationend', handleEnterEnd);
      if (aboutModal && aboutModal.style.display !== 'none') {
        setAboutBodyStackHeight(body);
      }
    });
  }

  function deactivateAboutBody(body) {
    if (!body) {
      return;
    }

    clearAboutBodyAnimation(body, 'enter');

    const isCurrentlyActive = body.classList.contains('is-active');
    if (!isCurrentlyActive) {
      body.classList.remove('is-visible');
      return;
    }

    body.classList.remove('is-entering');
    clearAboutBodyAnimation(body, 'exit');
    body.classList.add('is-leaving');

    function finalize() {
      clearAboutBodyAnimation(body, 'exit');
      body.classList.remove('is-leaving');
      body.classList.remove('is-visible');
    }

    const handleExitEnd = function (event) {
      if (
        event.target !== body ||
        event.animationName !== 'aboutModalBodyFadeOut'
      ) {
        return;
      }
      finalize();
    };
    body.__aboutExitHandler = handleExitEnd;
    body.addEventListener('animationend', handleExitEnd);

    const fallbackTimeout = setTimeout(finalize, 800);
    body.__aboutExitTimeout = fallbackTimeout;

    requestAnimationFrame(function () {
      body.classList.remove('is-active');
    });
  }

  function switchAboutBody(tabKey) {
    if (!aboutModal) return;
    const nextBody = aboutModal.querySelector(
      '.about-modal-body[data-tab="' + tabKey + '"]',
    );

    if (!nextBody || nextBody === activeAboutBody) {
      return;
    }

    const previousBody = activeAboutBody;
    activeAboutBody = nextBody;
    activateAboutBody(nextBody);
    deactivateAboutBody(previousBody);
  }

  function ensureAboutBodyStackMeasured() {
    if (aboutModal && aboutModal.style.display !== 'none' && activeAboutBody) {
      setAboutBodyStackHeight(activeAboutBody);
    }
  }

  function setModalHash(hash) {
    if (!hash || window.location.hash === hash) return;

    history.pushState(
      '',
      document.title,
      window.location.pathname + window.location.search + hash,
    );
  }

  function positionAboutNavSlider(animate) {
    if (!aboutNav || !aboutNavSlider) return;
    const activeItem = aboutNav.querySelector(
      '.about-modal-nav-item.is-active',
    );
    if (!activeItem) return;

    const navRect = aboutNav.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    const offsetLeft = itemRect.left - navRect.left + aboutNav.scrollLeft - 4; // subtract nav padding, add scrollLeft for horizontal scroll

    if (!animate) {
      aboutNavSlider.style.transition = 'none';
    }
    aboutNavSlider.style.width = itemRect.width + 'px';
    aboutNavSlider.style.transform = 'translateX(' + offsetLeft + 'px)';

    if (!animate) {
      // Force reflow then re-enable transitions
      void aboutNavSlider.offsetWidth;
      aboutNavSlider.style.transition = '';
    }
  }

  if (aboutNavItems.length) {
    aboutNavItems.forEach(function (item) {
      item.addEventListener('click', function () {
        if (item.classList.contains('is-active')) return;

        // Move active state
        aboutNavItems.forEach(function (btn) {
          btn.classList.remove('is-active');
          btn.removeAttribute('aria-current');
        });
        item.classList.add('is-active');
        item.setAttribute('aria-current', 'page');

        // Animate slider
        positionAboutNavSlider(true);

        // Switch content based on tab
        const tabName = item.textContent.toLowerCase().trim();
        const tabMap = {
          intro: 'intro',
          philosophy: 'philosophy',
          photography: 'photography',
          'movie log': 'movie-log',
        };
        const tabKey = tabMap[tabName];
        if (tabKey) {
          switchAboutBody(tabKey);
        }
      });
    });

    // Reposition slider on resize so it stays aligned
    window.addEventListener('resize', function () {
      if (aboutModal && aboutModal.style.display !== 'none') {
        positionAboutNavSlider(false);
        ensureAboutBodyStackMeasured();
      }
    });

    // Initialize on page load since it's now a dedicated page
    if (aboutModal) {
      const initAboutLayout = function() {
        positionAboutNavSlider(false);
        ensureAboutBodyStackMeasured();
      };
      
      requestAnimationFrame(initAboutLayout);
      // Fallbacks to ensure it measures correctly after fonts/layout settle
      setTimeout(initAboutLayout, 100);
      setTimeout(initAboutLayout, 500);
      window.addEventListener('load', initAboutLayout);
      if (document.fonts) {
        document.fonts.ready.then(initAboutLayout);
      }
    }
  }

  function openAboutModal() {
    if (!aboutModal) return;

    setModalHash('#about');



    aboutModal.style.display = 'flex';
    ensureAboutBodyStackMeasured();
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Reset scroll position to top
    if (aboutModalContainer) {
      aboutModalContainer.scrollTop = 0;
    }

    // Position the nav slider without animation on open (needs a frame for layout)
    requestAnimationFrame(function () {
      positionAboutNavSlider(false);
      ensureAboutBodyStackMeasured();
    });

    // Trigger animation replay for desktop
    if (window.innerWidth >= 768) {
      // Remove class if it exists (cleanup)
      aboutModal.classList.remove('opening');
      aboutModal.classList.remove('animation-complete');

      // Force Reflow
      void aboutModal.offsetWidth;

      // Add class to trigger animation
      aboutModal.classList.add('opening');

      // Cleanup to ensure crisp text after animation
      setTimeout(() => {
        if (aboutModal.classList.contains('opening')) {
          aboutModal.classList.add('animation-complete');
        }
      }, 1400); // 0.8s duration + 0.5s max delay + buffer
    }

    // Mobile-only: mirror the case study modal's "scroll anywhere -> scroll popup" behavior.
    // IMPORTANT: On desktop Chrome, any non-passive wheel listener can force main-thread scrolling
    // and cause scroll jank even if the handler returns early.
    if (window.innerWidth < 768) {
      const isEventFromScrollableContainer = function (e) {
        if (!aboutModalContainer) return false;
        let target = e.target;
        while (target && target !== document.body) {
          if (
            target === aboutModalContainer ||
            aboutModalContainer.contains(target)
          ) {
            return true;
          }
          target = target.parentElement;
        }
        return false;
      };

      const forwardScrollToPopupWheel = function (e) {
        if (isEventFromScrollableContainer(e)) return;
        if (!aboutModalContainer) return;

        e.preventDefault();
        e.stopPropagation();

        const scrollAmount = e.deltaY;
        const currentScroll = aboutModalContainer.scrollTop;
        const maxScroll =
          aboutModalContainer.scrollHeight - aboutModalContainer.clientHeight;
        const isAtTop = currentScroll === 0;
        const isAtBottom = currentScroll >= maxScroll - 1;

        if ((isAtTop && scrollAmount < 0) || (isAtBottom && scrollAmount > 0)) {
          return;
        }

        const newScroll = Math.max(
          0,
          Math.min(maxScroll, currentScroll + scrollAmount),
        );
        aboutModalContainer.scrollTop = newScroll;
      };

      let touchStartY = 0;
      let touchStartScroll = 0;

      const forwardScrollToPopupTouchStart = function (e) {
        if (aboutModalContainer && e.touches.length === 1) {
          touchStartY = e.touches[0].clientY;
          touchStartScroll = aboutModalContainer.scrollTop;
        }
      };

      const forwardScrollToPopupTouchMove = function (e) {
        if (isEventFromScrollableContainer(e)) return;
        if (!aboutModalContainer || e.touches.length !== 1) return;

        e.preventDefault();
        e.stopPropagation();

        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY - touchY;
        const maxScroll =
          aboutModalContainer.scrollHeight - aboutModalContainer.clientHeight;
        const newScroll = touchStartScroll + deltaY;
        aboutModalContainer.scrollTop = Math.max(
          0,
          Math.min(maxScroll, newScroll),
        );
      };

      document.addEventListener('wheel', forwardScrollToPopupWheel, {
        passive: false,
      });
      document.addEventListener('touchstart', forwardScrollToPopupTouchStart, {
        passive: true,
      });
      document.addEventListener('touchmove', forwardScrollToPopupTouchMove, {
        passive: false,
      });

      document._aboutScrollHandlers = {
        wheel: forwardScrollToPopupWheel,
        touchstart: forwardScrollToPopupTouchStart,
        touchmove: forwardScrollToPopupTouchMove,
      };
    }

    // Mobile-only: prevent scroll propagation when container reaches limits
    if (aboutModalContainer && window.innerWidth < 768) {
      let localTouchStartY = 0;

      const handleWheel = function (e) {
        if (window.innerWidth >= 768) return;
        const container = e.currentTarget;
        const isAtTop = container.scrollTop === 0;
        const isAtBottom =
          container.scrollTop + container.clientHeight >=
          container.scrollHeight - 1;

        if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      const handleTouchStart = function (e) {
        localTouchStartY = e.touches[0].clientY;
      };

      const handleTouchMove = function (e) {
        if (window.innerWidth >= 768) return;
        const container = e.currentTarget;
        const touchY = e.touches[0].clientY;
        const deltaY = localTouchStartY - touchY;
        const isAtTop = container.scrollTop === 0;
        const isAtBottom =
          container.scrollTop + container.clientHeight >=
          container.scrollHeight - 1;

        if ((isAtTop && deltaY < 0) || (isAtBottom && deltaY > 0)) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      aboutModalContainer.addEventListener('wheel', handleWheel, {
        passive: false,
      });
      aboutModalContainer.addEventListener('touchstart', handleTouchStart, {
        passive: true,
      });
      aboutModalContainer.addEventListener('touchmove', handleTouchMove, {
        passive: false,
      });

      aboutModalContainer._scrollHandlers = {
        wheel: handleWheel,
        touchstart: handleTouchStart,
        touchmove: handleTouchMove,
      };
    }
  }

  function closeAboutModal() {
    if (!aboutModal) return;



    // Remove hash from URL when closing
    if (window.location.hash === '#about') {
      history.replaceState(
        '',
        document.title,
        window.location.pathname + window.location.search,
      );
    }

    // Helper to run the actual teardown
    const finishClosing = () => {
      aboutModal.classList.remove('closing');
      aboutModal.classList.remove('opening');
      aboutModal.classList.remove('animation-complete');
      aboutModal.style.display = 'none';
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';

      if (aboutModalContainer && aboutModalContainer._scrollHandlers) {
        aboutModalContainer.removeEventListener(
          'wheel',
          aboutModalContainer._scrollHandlers.wheel,
        );
        aboutModalContainer.removeEventListener(
          'touchstart',
          aboutModalContainer._scrollHandlers.touchstart,
        );
        aboutModalContainer.removeEventListener(
          'touchmove',
          aboutModalContainer._scrollHandlers.touchmove,
        );
        aboutModalContainer._scrollHandlers = null;
      }

      if (document._aboutScrollHandlers) {
        document.removeEventListener(
          'wheel',
          document._aboutScrollHandlers.wheel,
        );
        document.removeEventListener(
          'touchstart',
          document._aboutScrollHandlers.touchstart,
        );
        document.removeEventListener(
          'touchmove',
          document._aboutScrollHandlers.touchmove,
        );
        document._aboutScrollHandlers = null;
      }
    };

    // Desktop: animate slide-down before hiding
    if (window.innerWidth >= 768 && aboutModal.style.display !== 'none') {
      aboutModal.classList.add('closing');
      setTimeout(finishClosing, 600); // Matches CSS animation duration
    } else {
      finishClosing();
    }
  }

  // About link clicks (desktop + mobile)
  const aboutLinks = document.querySelectorAll(
    '.nav-link[href="#about"], .mobile-nav-link[href="#about"], .footer-link[href="#about"]',
  );
  aboutLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      // Close mobile menu if open
      closeMobileMenuIfPresent();
      // Open modal directly
      openAboutModal();
    });
  });

  // Close About modal interactions
  if (aboutModalClose) {
    aboutModalClose.addEventListener('click', function (e) {
      e.preventDefault();
      closeAboutModal();
    });
  }

  if (aboutModalOverlay) {
    aboutModalOverlay.addEventListener('click', function (e) {
      e.preventDefault();
      closeAboutModal();
    });
  }

  // Close About modal with Escape key (only when About is open)
  document.addEventListener('keydown', function (e) {
    if (
      e.key === 'Escape' &&
      aboutModal &&
      aboutModal.style.display === 'flex'
    ) {
      closeAboutModal();
    }
  });





  // Image Popup Modal Functionality
  const imagePopupModal = document.getElementById('image-popup-modal');
  const imagePopupOverlay = document.querySelector('.image-popup-overlay');
  const imagePopupClose = document.querySelector('.image-popup-close');
  const popupImage = document.getElementById('popup-image');
  let isZoomed = false;

  // Function to open image popup modal
  function openImagePopup(imageSrc, imageAlt) {
    if (!popupImage || !imagePopupModal) return;
    popupImage.src = imageSrc;
    popupImage.alt = imageAlt;
    imagePopupModal.classList.remove('closing');
    imagePopupModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    isZoomed = false;
  }

  // Function to close image popup modal
  function closeImagePopup() {
    if (!imagePopupModal || imagePopupModal.style.display === 'none') return;



    imagePopupModal.classList.add('closing');
    setTimeout(() => {
      if (imagePopupModal) {
        imagePopupModal.style.display = 'none';
        imagePopupModal.classList.remove('closing');
      }
      document.body.style.overflow = 'auto';
      isZoomed = false;
    }, 300); // Matches CSS animation duration
  }

  // Image click handlers
  const popupImages = document.querySelectorAll('[data-image-popup]');
  popupImages.forEach((img) => {
    img.addEventListener('click', function () {
      const imageSrc = this.getAttribute('data-image-popup');
      const imageAlt = this.getAttribute('alt');
      openImagePopup(imageSrc, imageAlt);
    });
  });

  // Close image popup event listeners
  if (imagePopupClose) {
    imagePopupClose.addEventListener('click', closeImagePopup);
  }

  if (imagePopupOverlay) {
    imagePopupOverlay.addEventListener('click', closeImagePopup);
  }

  // Close image popup with Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && imagePopupModal && imagePopupModal.style.display === 'flex') {
      closeImagePopup();
    }
  });

  // Set nav active state based on current page + hash
  function setActiveNav() {
    const path = window.location.pathname.toLowerCase();
    const isAbout = path.endsWith('/about.html') || path.endsWith('about.html');
    const isProducts = path.endsWith('/products.html') || path.endsWith('products.html');
    const isArticles = path.endsWith('/articles.html') || path.endsWith('articles.html');
    const isHome = path.endsWith('/index.html') || path.endsWith('index.html') || path.endsWith('/') || path === '';

    navLinks.forEach((l) => l.classList.remove('active'));
    mobileNavLinks.forEach((l) => l.classList.remove('active'));

    const allLinks = [...Array.from(navLinks), ...Array.from(mobileNavLinks)];

    if (isAbout || window.location.hash === '#about') {
      allLinks.forEach((l) => {
        if ((l.getAttribute('href') || '').includes('about.html')) {
          l.classList.add('active');
        }
        if ((l.getAttribute('href') || '') === '#about') {
          l.classList.add('active');
        }
      });
      return;
    } else if (isProducts) {
      allLinks.forEach((l) => {
        if ((l.getAttribute('href') || '').includes('products.html')) {
          l.classList.add('active');
        }
      });
      return;
    } else if (isArticles) {
      allLinks.forEach((l) => {
        if ((l.getAttribute('href') || '').includes('articles.html')) {
          l.classList.add('active');
        }
      });
      return;
    } else if (isHome) {
      allLinks.forEach((l) => {
        if ((l.getAttribute('href') || '').includes('index.html')) {
          l.classList.add('active');
        }
      });
      return;
    }
  }

  setActiveNav();
  window.addEventListener('hashchange', setActiveNav);

  // Hash-driven About modal behavior (removed to treat as simple popup)
  // function syncAboutModalToHash() { ... }

  // Redirect hash URLs to dedicated pages
  function handleInitialHash() {
    const hash = window.location.hash;
    if (hash === '#about') {
      window.location.href = 'about.html';
    } else if (hash === '#docswell') {
      window.location.href = 'docswell-case-study.html';
    } else if (hash === '#rememberly') {
      window.location.href = 'rememberly-case-study.html';
    } else if (hash === '#jiffyhive') {
      window.location.href = 'jiffyhive-case-study.html';
    }
  }

  handleInitialHash();

  window.addEventListener('hashchange', function () {
    const hash = window.location.hash;
    if (hash === '#about') {
      window.location.href = 'about.html';
    } else if (hash === '#docswell') {
      window.location.href = 'docswell-case-study.html';
    } else if (hash === '#rememberly') {
      window.location.href = 'rememberly-case-study.html';
    } else if (hash === '#jiffyhive') {
      window.location.href = 'jiffyhive-case-study.html';
    }
  });
}

document.addEventListener('DOMContentLoaded', initPortfolio);
window.addEventListener('portfolio:init', initPortfolio);
