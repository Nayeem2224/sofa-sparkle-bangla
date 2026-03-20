// Meta Pixel + GA4 helper — fires events safely
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// ─── Meta Pixel ───
export function trackPixelEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== "undefined" && window.fbq) {
    if (params) {
      window.fbq("track", eventName, params);
    } else {
      window.fbq("track", eventName);
    }
  }
}

// ─── GA4 / gtag ───
export function trackGA4Event(eventName: string, params?: Record<string, any>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params || {});
  }
}

// ─── Unified tracker (fires both Pixel + GA4) ───
function trackEvent(pixelEvent: string, ga4Event: string, params?: Record<string, any>) {
  trackPixelEvent(pixelEvent, params);
  trackGA4Event(ga4Event, params);
}

// Standard events
export const pixelPageView = () => {
  trackPixelEvent("PageView");
  // GA4 page_view is automatic via gtag config
};

export const pixelViewContent = (params: { content_name: string; content_category?: string; value?: number; currency?: string }) => {
  const p = { ...params, currency: params.currency || "BDT" };
  trackPixelEvent("ViewContent", p);
  trackGA4Event("view_item", {
    item_name: params.content_name,
    item_category: params.content_category,
    value: params.value,
    currency: "BDT",
  });
};

export const pixelInitiateCheckout = (params: { value: number; content_name?: string; num_items?: number }) => {
  trackPixelEvent("InitiateCheckout", { ...params, currency: "BDT" });
  trackGA4Event("begin_checkout", {
    value: params.value,
    currency: "BDT",
    items: [{ item_name: params.content_name, quantity: params.num_items || 1 }],
  });
};

export const pixelAddToCart = (params: { content_name: string; value: number }) => {
  trackPixelEvent("AddToCart", { ...params, currency: "BDT" });
  trackGA4Event("add_to_cart", {
    value: params.value,
    currency: "BDT",
    items: [{ item_name: params.content_name }],
  });
};

export const pixelPurchase = (params: { value: number; content_name?: string; order_id?: string }) => {
  trackPixelEvent("Purchase", { ...params, currency: "BDT" });
  trackGA4Event("purchase", {
    transaction_id: params.order_id,
    value: params.value,
    currency: "BDT",
    items: [{ item_name: params.content_name }],
  });
};

export const pixelLead = (params?: { content_name?: string; value?: number }) => {
  trackPixelEvent("Lead", params);
  trackGA4Event("generate_lead", params || {});
};

export const pixelContact = () => {
  trackPixelEvent("Contact");
  trackGA4Event("contact", {});
};

export const pixelSchedule = () => {
  trackPixelEvent("Schedule");
  trackGA4Event("schedule", {});
};

// ─── Script injectors ───
export function injectMetaPixel(pixelId: string) {
  if (!pixelId || typeof document === "undefined") return;
  if (document.querySelector(`script[data-pixel-id="${pixelId}"]`)) return;

  const script = document.createElement("script");
  script.dataset.pixelId = pixelId;
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);

  // Also add noscript fallback
  const noscript = document.createElement("noscript");
  const img = document.createElement("img");
  img.height = 1;
  img.width = 1;
  img.style.display = "none";
  img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
  noscript.appendChild(img);
  document.body.appendChild(noscript);
}

export function injectGA4(measurementId: string) {
  if (!measurementId || typeof document === "undefined") return;
  if (document.querySelector(`script[data-ga4-id="${measurementId}"]`)) return;

  // Load gtag.js
  const gtagScript = document.createElement("script");
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  gtagScript.dataset.ga4Id = measurementId;
  document.head.appendChild(gtagScript);

  // Initialize
  const initScript = document.createElement("script");
  initScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(initScript);
}

export function injectGTM(containerId: string) {
  if (!containerId || typeof document === "undefined") return;
  if (document.querySelector(`script[data-gtm-id="${containerId}"]`)) return;

  const script = document.createElement("script");
  script.dataset.gtmId = containerId;
  script.innerHTML = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${containerId}');
  `;
  document.head.appendChild(script);
}
