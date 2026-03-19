import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Confirmation from "./pages/Confirmation.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminLayout from "./components/admin/AdminLayout.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";
import BookingManagement from "./pages/admin/BookingManagement.tsx";
import PackageManagement from "./pages/admin/PackageManagement.tsx";
import AddonManagement from "./pages/admin/AddonManagement.tsx";
import TimeSlotManagement from "./pages/admin/TimeSlotManagement.tsx";
import SiteSettings from "./pages/admin/SiteSettings.tsx";
import AdminManagement from "./pages/admin/AdminManagement.tsx";
import FollowUpManagement from "./pages/admin/FollowUpManagement.tsx";
import TestimonialManagement from "./pages/admin/TestimonialManagement.tsx";
import FAQManagement from "./pages/admin/FAQManagement.tsx";
import MarketingSettings from "./pages/admin/MarketingSettings.tsx";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/confirmation" element={<Confirmation />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="bookings" element={<BookingManagement />} />
              <Route path="follow-ups" element={<FollowUpManagement />} />
              <Route path="packages" element={<PackageManagement />} />
              <Route path="addons" element={<AddonManagement />} />
              <Route path="time-slots" element={<TimeSlotManagement />} />
              <Route path="testimonials" element={<TestimonialManagement />} />
              <Route path="faqs" element={<FAQManagement />} />
              <Route path="marketing" element={<MarketingSettings />} />
              <Route path="settings" element={<SiteSettings />} />
              <Route path="admins" element={<AdminManagement />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
