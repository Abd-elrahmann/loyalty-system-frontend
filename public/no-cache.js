// This script prevents caching in the browser
function preventCaching() {
  // Prevent caching of the entire page
  window.onpageshow = function(event) {
    if (event.persisted) {
      window.location.reload();
    }
  };

  // Add timestamp to all fetch requests to prevent caching
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    if (typeof args[0] === 'string') {
      if (args[0].indexOf('?') === -1) {
        args[0] += '?_=' + Date.now();
      } else {
        args[0] += '&_=' + Date.now();
      }
    }
    return originalFetch.apply(this, args);
  };

  // Add timestamp to all XHR requests
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(...args) {
    if (typeof args[1] === 'string') {
      if (args[1].indexOf('?') === -1) {
        args[1] += '?_=' + Date.now();
      } else {
        args[1] += '&_=' + Date.now();
      }
    }
    return originalOpen.apply(this, args);
  };

  // Add meta tags to prevent caching
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Cache-Control';
  meta.content = 'no-cache, no-store, must-revalidate';
  document.head.appendChild(meta);

  const pragma = document.createElement('meta');
  pragma.httpEquiv = 'Pragma';
  pragma.content = 'no-cache';
  document.head.appendChild(pragma);

  const expires = document.createElement('meta');
  expires.httpEquiv = 'Expires';
  expires.content = '0';
  document.head.appendChild(expires);
}
export default preventCaching;