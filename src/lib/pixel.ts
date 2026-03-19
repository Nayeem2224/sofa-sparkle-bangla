// Meta Pixel helper — fires fbq events safely
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== "undefined" && window.fbq) {
    if (params) {
      window.fbq("track", eventName, params);
    } else {
      window.fbq("track", eventName);
    }
  }
}

// Standard events
export const pixelPageView = () => trackEvent("PageView");
export const pixelViewContent = (params: { content_name: string; content_category?: string; value?: number; currency?: string }) =>
  trackEvent("ViewContent", { ...params, currency: params.currency || "BDT" });
export const pixelInitiateCheckout = (params: { value: number; content_name?: string; num_items?: number }) =>
  trackEvent("InitiateCheckout", { ...params, currency: "BDT" });
export const pixelAddToCart = (params: { content_name: string; value: number }) =>
  trackEvent("AddToCart", { ...params, currency: "BDT" });
export const pixelPurchase = (params: { value: number; content_name?: string; order_id?: string }) =>
  trackEvent("Purchase", { ...params, currency: "BDT" });
export const pixelLead = (params?: { content_name?: string; value?: number }) =>
  trackEvent("Lead", params);
export const pixelContact = () => trackEvent("Contact");
export const pixelSchedule = () => trackEvent("Schedule");
