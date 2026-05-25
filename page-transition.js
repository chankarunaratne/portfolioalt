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
    // Allow "/", "./", ".", "about.html", "index.html#section", etc.
    return href === '/' || href === './' || href === '.' || /\.html(\?|#|$)/i.test(href);
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
          root.classList.remove('home', 'case-study-page', 'about-page-root', 'products-page-root', 'articles-page-root');
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

