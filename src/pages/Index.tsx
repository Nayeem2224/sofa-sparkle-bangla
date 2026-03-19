import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MarqueeBanner from "@/components/landing/MarqueeBanner";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
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
import { useSiteSettings } from "@/hooks/use-landing-data";

function MetaPixelHead() {
  const { data: settings } = useSiteSettings();
  const pixelId = settings?.meta_pixel_id;
  const gtmId = settings?.gtm_container_id;

  if (!pixelId && !gtmId) return null;

  return (
    <Helmet>
      {pixelId && (
        <script>{`
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
        `}</script>
      )}
      {gtmId && (
        <script>{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `}</script>
      )}
    </Helmet>
  );
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
      <MetaPixelHead />
      <div className="min-h-screen">
        <MarqueeBanner />
        <Navbar />
        <HeroSection />
        <PainSection />
        <HowItWorksSection />
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
