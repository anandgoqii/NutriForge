import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * GOQii NutriForge - Resilient CORS Interceptor
 * Transparently wraps fetch calls to NutriForge and Supabase domains using public CORS bridges.
 */
const originalFetch = window.fetch.bind(window);

// List of available public CORS proxies
const PROXY_GENERATORS = [
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

const corsWrappedFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

  // Intercept NutriForge related API calls
  if (url.includes('nutriforge.goqii.com') || url.includes('supabase.co/functions/v1')) {
    let lastError: any = null;

    for (const generateProxyUrl of PROXY_GENERATORS) {
      try {
        const proxyUrl = generateProxyUrl(url);
        
        // When using a proxy, we pass through the headers from the original request
        const response = await originalFetch(proxyUrl, {
          method: init?.method || 'GET',
          headers: { 
            'Accept': 'application/json',
            ...(init?.headers as Record<string, string> || {})
          },
          cache: 'no-cache',
          mode: 'cors'
        });

        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("text/html")) {
             console.debug(`Proxy ${proxyUrl} returned HTML instead of data. Trying next proxy...`);
             continue; 
          }
          return response;
        }
      } catch (err) {
        lastError = err;
      }
    }

    // Last resort: try direct fetch
    try {
      return await originalFetch(input, init);
    } catch (finalErr) {
      console.error("NutriForge API Access Failed via all methods:", finalErr || lastError);
      throw finalErr || lastError;
    }
  }

  return originalFetch(input, init);
};

// Override global fetch safely
try {
  Object.defineProperty(window, 'fetch', {
    value: corsWrappedFetch,
    configurable: true,
    writable: true,
    enumerable: true
  });
} catch (e) {
  (window as any).fetch = corsWrappedFetch;
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}