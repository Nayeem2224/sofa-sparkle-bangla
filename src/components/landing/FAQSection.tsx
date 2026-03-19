import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HelpCircle, Phone, MessageCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQSection() {
  const { data: faqs } = useQuery({
    queryKey: ["public-faqs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (!faqs || faqs.length === 0) return null;

  return (
    <section id="faq" className="relative py-16 md:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--surface-aqua))] to-background" />

      <div className="container relative z-10 max-w-3xl px-4">
        {/* Header */}
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 rounded-full px-4 py-1.5 mb-4">
            <HelpCircle className="h-3.5 w-3.5" /> সাহায্য প্রয়োজন?
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
            সচরাচর জিজ্ঞাসিত <span className="gradient-text">প্রশ্নসমূহ</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-2">যা জানা দরকার</p>
        </div>

        {/* Phone + WhatsApp buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <a
            href="tel:01816390415"
            className="group inline-flex items-center gap-2.5 bg-card rounded-full border border-border/50 px-5 sm:px-6 py-3 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto justify-center"
          >
            <span className="relative flex h-8 w-8 items-center justify-center flex-shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/20" />
              <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                <Phone className="h-3.5 w-3.5 text-primary" />
              </span>
            </span>
            <span className="font-bold text-foreground group-hover:text-primary transition-colors">01816-390415</span>
          </a>

          <a
            href="https://wa.me/8801816390415"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 bg-emerald-50 rounded-full border border-emerald-200/50 px-5 sm:px-6 py-3 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto justify-center"
          >
            <span className="relative flex h-8 w-8 items-center justify-center flex-shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/20" />
              <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
              </span>
            </span>
            <span className="font-bold text-emerald-700 group-hover:text-emerald-800 transition-colors">WhatsApp</span>
          </a>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="bg-card rounded-2xl border border-border/50 px-4 sm:px-6 shadow-sm hover:shadow-md transition-shadow data-[state=open]:shadow-md data-[state=open]:border-primary/20"
            >
              <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-4 sm:py-5 gap-3 sm:gap-4">
                <div className="flex items-center gap-2.5 sm:gap-3 text-left">
                  <span className="flex-shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="leading-snug">{faq.question}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4 sm:pb-5 pl-9 sm:pl-10 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
