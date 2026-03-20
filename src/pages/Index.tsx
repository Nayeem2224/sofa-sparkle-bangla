import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "@/hooks/use-landing-data";
import { injectMetaPixel, injectGA4, injectGTM } from "@/lib/pixel";
import MarqueeBanner from "@/components/landing/MarqueeBanner";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import SpecialOfferBanner from "@/components/landing/SpecialOfferBanner";
import PainSection from "@/components/landing/PainSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PricingSection from "@/components/landing/PricingSection";
import VideoShowcase from "@/components/landing/VideoShowcase";
import TrustSection from "@/components/landing/TrustSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import BookingForm from "@/components/landing/BookingForm";
import Footer from "@/components/landing/Footer";
import FloatingWhatsApp from "@/components/landing/FloatingWhatsApp";
import LiveBookingNotification from "@/components/landing/LiveBookingNotification";

function TrackingScripts() {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;
    if (settings.meta_pixel_id) injectMetaPixel(settings.meta_pixel_id);
    if (settings.ga4_measurement_id) injectGA4(settings.ga4_measurement_id);
    if (settings.gtm_container_id) injectGTM(settings.gtm_container_id);
  }, [settings]);

  return null;
}

export default function Index() {
  return (
    <>
      <Helmet>
        <title>Purexify — প্রফেশনাল সোফা ক্লিনিং সার্ভিস | ঢাকায় ঘরে বসেই বুক করুন</title>
        <meta name="description" content="Purexify — ঢাকায় ঘরে বসেই প্রফেশনাল সোফা ক্লিনিং সার্ভিস। পেশাদার ইকুইপমেন্ট, নিরাপদ প্রোডাক্ট, ১০০% সন্তুষ্টি গ্যারান্টি। এখনই বুক করুন!" />
        <meta property="og:title" content="Purexify — প্রফেশনাল সোফা ক্লিনিং সার্ভিস" />
        <meta property="og:description" content="ঢাকায় ঘরে বসেই প্রফেশনাল সোফা ক্লিনিং। এখনই বুক করুন!" />
        <meta property="og:type" content="website" />
      </Helmet>
      <TrackingScripts />
      <div className="min-h-screen">
        <MarqueeBanner />
        <Navbar />
        <HeroSection />
        <PainSection />
        <HowItWorksSection />
        <SpecialOfferBanner />
        <PricingSection />
        <VideoShowcase />
        <TrustSection />
        <TestimonialsSection />
        <BookingForm />
        <FAQSection />
        <CTASection />
        <Footer />
        <FloatingWhatsApp />
        <LiveBookingNotification />
      </div>
    </>
  );
}
