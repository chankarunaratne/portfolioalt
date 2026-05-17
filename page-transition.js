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
    // Allow "about.html", "index.html#section", "./about.html", etc.
    return /\.html(\?|#|$)/i.test(href);
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
    root.classList.add("page-leave");

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
          
          const navbar = root.querySelector('.navbar');
          
          // Remove children of root EXCEPT navbar
          Array.from(root.children).forEach(child => {
            if (child !== navbar) {
              child.remove();
            }
          });
          
          // Append new children EXCEPT navbar
          Array.from(newRoot.children).forEach(child => {
            if (!child.classList.contains('navbar')) {
              root.appendChild(child.cloneNode(true));
            }
          });
          
          // Update root class list
          root.className = newRoot.className;

          // Clone navbar to remove old event listeners
          const currentNavbar = root.querySelector('.navbar');
          if (currentNavbar) {
            const clonedNavbar = currentNavbar.cloneNode(true);
            currentNavbar.replaceWith(clonedNavbar);
          }
          
          // Push state
          if (!isPopstate) {
            history.pushState(null, '', href);
          }
          
          // Trigger scripts initialization
          window.dispatchEvent(new Event('portfolio:init'));
          
          // Reveal
          window.scrollTo(0, 0);
          markEntered();
        }, 180);
      })
      .catch(() => {
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

