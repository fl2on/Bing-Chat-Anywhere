(() => {
  // Select URLs that match the specified pattern
  const urlPattern = { matches: ["*://www.bing.com/search*"] };

  /**
   * Wait until an element matches the given selector in the DOM.
   * @param {HTMLElement} parentElement - The parent element in which to search for the selector.
   * @param {string} cssSelector - The CSS selector to use to find the desired element.
   * @returns {Promise<HTMLElement>} - A promise that resolves with the matching element.
   */
  async function waitForElement(parentElement, cssSelector) {
    return new Promise((resolve, reject) => {
      const matchingElement = parentElement.querySelector(cssSelector);
      if (matchingElement) resolve(matchingElement);
      else {
        const timeoutDuration = 10000; // Timeout duration in milliseconds
        const mutationObserver = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (
              mutation.type === "childList" &&
              parentElement.querySelector(cssSelector)
            ) {
              resolve(parentElement.querySelector(cssSelector));
              mutationObserver.disconnect();
              clearTimeout(timeout);
            }
          });
        });
        mutationObserver.observe(parentElement, { childList: true, subtree: true });
        const timeout = setTimeout(() => {
          mutationObserver.disconnect();
          reject(new Error("Timeout"));
        }, timeoutDuration);
      }
    });
  }

  /**
   * Remove the "maxlength" attribute on the search text box and replace the letter counter with the infinity symbol.
   */
  async function removeSearchBoxMaxLength() {
    const serpNone = await waitForElement(
      document,
      "cib-serp[serp-slot='none']"
    );
    const actionBar = await waitForElement(serpNone.shadowRoot, "cib-action-bar");
    const [searchBox, letterCounter] = await Promise.all([
      waitForElement(actionBar.shadowRoot, "textarea[maxlength]"),
      waitForElement(actionBar.shadowRoot, ".letter-counter"),
    ]);
    searchBox.removeAttribute("maxlength");
    letterCounter.lastChild.textContent = "\u221E"; // Replace the number of letters with the infinity symbol
  }

  /**
   * Add an iframe that loads a web page within a specific HTML element.
   */
  async function addIframe() {
    const li = document.createElement("li");
    li.style.width = "100%";
    li.style.height = "1200px";
    const iframe = document.createElement("iframe");
    iframe.src = "https://edgeservices.bing.com/edgesvc/compose";
    iframe.csp =
      "frame-src https://www.bing.com/search https://edgeservices.bing.com/; base-uri 'self'; require-trusted-types-for 'script';";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    li.appendChild(iframe);
    const bContext = await waitForElement(document, "#b_context");
    const aside = bContext.querySelector("aside");
    if (aside) {
      aside.querySelector("#b_context").appendChild(li);
    }
  }

  /**
   * Initialize the extension.
   */
async function initializeExtension() {
  removeSearchBoxMaxLength();
  addIframe();
}

  window.addEventListener("load", initializeExtension);
  window.addEventListener("popstate", initializeExtension);
  
  setInterval(() => {
    initializeExtension();
  }, 3000);
})();