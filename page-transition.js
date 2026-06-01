// Lightweight cross-page fade for a more seamless transition between static pages.
// Only intercepts same-tab HTML navigations (e.g., index.html <-> about.html).
(function () {
  function isModifiedClick(e) {
    return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
  }

  function isSamePageHashNavigation(href) {
    try {
      const url = new URL(href, window.location.href);
      return (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash &&
        url.hash.length > 1
      );
    } catch {
      return false;
    }
  }

  function isHtmlNavigation(href) {
    if (!href) return false;
    
    // Ignore internal anchor hashes like "#about"
    if (href.startsWith('#')) return false;
    
    // Ignore mailto:, tel:, javascript: protocols
    if (/^(mailto|tel|javascript):/i.test(href)) return false;

    try {
      const url = new URL(href, window.location.href);
      
      // Must be same origin
      if (url.origin !== window.location.origin) return false;
      
      // Get the pathname
      const pathname = url.pathname;
      
      // If pathname ends with any common non-html extension, it's not a page navigation
      const nonHtmlRegex = /\.(png|jpe?g|gif|svg|pdf|zip|xml|json|txt|css|js|mp4|webm|ico|webmanifest)$/i;
      if (nonHtmlRegex.test(pathname)) {
        return false;
      }
      
      return true;
    } catch {
      // Fallback for relative paths if URL parsing fails
      return !/\.(png|jpe?g|gif|svg|pdf|zip|xml|json|txt|css|js|mp4|webm|ico|webmanifest)$/i.test(href);
    }
  }

  function updateActiveNavbarLinks(currentHref = window.location.href) {
    const path = new URL(currentHref, window.location.href).pathname;
    
    const normalize = (str) => {
      if (!str) return '';
      try {
        const url = new URL(str, window.location.origin);
        str = url.pathname;
      } catch (e) {}

      if (str === '/' || str.endsWith('/')) return '';
      
      const slug = str
        .toLowerCase()
        .replace(/\.html$/, '')
        .split('/')
        .filter(Boolean)
        .pop() || '';

      return slug
        .replace(/\/$/, '')
        .trim();
    };

    const normalizedPath = normalize(path);
    const isHomePath = normalizedPath === '' || normalizedPath === 'index';

    const links = document.querySelectorAll('.navbar .nav-link, .navbar .mobile-nav-link');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      const normalizedHref = normalize(href);
      const isHomeHref = normalizedHref === '' || normalizedHref === 'index';

      let isActive = false;
      if (isHomePath && isHomeHref) {
        isActive = true;
      } else if (!isHomePath && normalizedHref && normalizedPath === normalizedHref) {
        isActive = true;
      }

      if (isActive) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  function getPageRoot() {
    return document.querySelector(".page-root") || document.body;
  }

  function markEntered() {
    const root = getPageRoot();
    root.classList.add("page-ready");
    root.classList.remove("page-leave");
  }

  function navigateWithFade(href, isPopstate = false) {
    const root = getPageRoot();
    const navbar = root.querySelector('.navbar');

    // Fade out only non-navbar content (keep navbar visible throughout)
    Array.from(root.children).forEach(child => {
      if (child !== navbar) {
        child.style.transition = 'opacity 180ms ease';
        child.style.opacity = '0';
      }
    });

    fetch(href)
      .then(r => r.text())
      .then(html => {
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, 'text/html');
        
        window.setTimeout(() => {
          const newRoot = newDoc.querySelector('.page-root');
          if (!newRoot) {
            window.location.href = href;
            return;
          }

          document.title = newDoc.title;
          
          // Swap page-specific classes before inserting content (prevents flash)
          root.classList.remove('home', 'case-study-page', 'about-page-root', 'products-page-root', 'articles-page-root', 'contact-page-root');
          newRoot.className.split(/\s+/).forEach(cls => {
            if (cls && cls !== 'page-root' && cls !== 'page-ready' && cls !== 'page-leave') {
              root.classList.add(cls);
            }
          });

          // Remove children of root EXCEPT navbar
          Array.from(root.children).forEach(child => {
            if (child !== navbar) {
              child.remove();
            }
          });

          // Append new children EXCEPT navbar (clear fade-out inline styles)
          Array.from(newRoot.children).forEach(child => {
            if (!child.classList.contains('navbar')) {
              const cloned = child.cloneNode(true);
              cloned.style.opacity = '';
              cloned.style.transition = '';
              root.appendChild(cloned);
            }
          });
          
          // Push state
          if (!isPopstate) {
            history.pushState(null, '', href);
          }

          // Update active states on the preserved navbar links to match the new page
          updateActiveNavbarLinks(href);
          
          // Signal SPA re-init (so initPortfolio skips navbar animation)
          window.__spaTransition = true;

          // Trigger scripts initialization
          window.dispatchEvent(new Event('portfolio:init'));
          
          // Reveal
          window.scrollTo(0, 0);
          markEntered();
        }, 180);
      })
      .catch((err) => {
        console.error("Transition error caught:", err);
        window.location.href = href;
      });
  }

  window.addEventListener("pageshow", () => {
    // Covers back/forward cache as well.
    markEntered();
  });

  document.addEventListener("DOMContentLoaded", () => {
    markEntered();
    updateActiveNavbarLinks();

    document.addEventListener("click", (e) => {
      if (e.defaultPrevented) return;
      const target = e.target;
      if (!(target instanceof Element)) return;

      const link = target.closest("a");
      if (!link) return;
      if (isModifiedClick(e)) return;
      if (link.target && link.target !== "_self") return;

      const href = link.getAttribute("href");
      if (!href) return;
      if (!isHtmlNavigation(href)) return;
      if (isSamePageHashNavigation(href)) return;

      e.preventDefault();
      navigateWithFade(href);
    });
    
    // Handle back/forward navigation
    window.addEventListener("popstate", () => {
      navigateWithFade(window.location.href, true);
    });
  });
})();
