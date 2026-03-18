import { Helmet } from "react-helmet-async";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import PainSection from "@/components/landing/PainSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PricingSection from "@/components/landing/PricingSection";
import TrustSection from "@/components/landing/TrustSection";
import BookingForm from "@/components/landing/BookingForm";
import Footer from "@/components/landing/Footer";
import FloatingWhatsApp from "@/components/landing/FloatingWhatsApp";

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
      <div className="min-h-screen">
        <Navbar />
        <HeroSection />
        <PainSection />
        <HowItWorksSection />
        <PricingSection />
        <TrustSection />
        <BookingForm />
        <Footer />
        <FloatingWhatsApp />
      </div>
    </>
  );
}
