import { Check, Star, Crown } from "lucide-react";
import { usePackages, useAddOns, useSiteSettings } from "@/hooks/use-landing-data";
import { Skeleton } from "@/components/ui/skeleton";

export default function PricingSection() {
  const { data: packages, isLoading: loadingPkg } = usePackages();
  const { data: addons } = useAddOns();
  const { data: settings } = useSiteSettings();

  const packageTypeLabel: Record<string, string> = {
    basic: "স্ট্যান্ডার্ড",
    standard: "প্রিমিয়াম",
    premium: "কর্পোরেট"
  };

  const packageStyles: Record<string, { border: string; bg: string; badge?: boolean }> = {
    basic: { border: "border-border/50 hover:border-primary/30", bg: "" },
    standard: { border: "border-primary/20 hover:border-primary/50", bg: "" },
    premium: { border: "border-primary ring-2 ring-primary/20", bg: "bg-gradient-to-b from-primary/[0.03] to-transparent", badge: true },
  };

  return (
    <section id="pricing" className="bg-surface-grey py-16 md:py-20 pb-20 md:pb-24 relative">
      <div className="container px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-foreground mb-3">
          সার্ভিস প্যাকেজ ও <span className="gradient-text">মূল্য</span>
        </h2>
        <p className="text-center text-muted-foreground mb-8 md:mb-12 text-sm sm:text-base md:text-lg">আপনার প্রয়োজন অনুযায়ী প্যাকেজ বেছে নিন</p>

        {loadingPkg ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto stagger-children">
            {packages?.map((pkg) => {
              const style = packageStyles[pkg.package_type] || packageStyles.basic;
              return (
                <div
                  key={pkg.id}
                  className={`bg-background rounded-3xl p-5 sm:p-7 shadow-card border-2 transition-all duration-300 hover:shadow-elevated hover:-translate-y-2 relative overflow-hidden ${style.border} ${style.bg}`}
                >
                  {style.badge && (
                    <div className="absolute -top-px left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 gradient-hero-bg text-white text-xs font-bold px-4 sm:px-5 py-2 rounded-b-2xl shadow-lg">
                        <Crown className="h-3.5 w-3.5" /> সবচেয়ে জনপ্রিয়
                      </span>
                    </div>
                  )}
                  <div className={style.badge ? "pt-6" : ""}>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest">
                      {packageTypeLabel[pkg.package_type] || pkg.package_type}
                    </p>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mt-2">{pkg.name}</h3>
                    <p className="text-3xl sm:text-4xl font-extrabold gradient-text mt-4">
                      ৳{Number(pkg.base_price_bdt).toLocaleString("bn-BD")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed min-h-[3rem]">{pkg.description}</p>
                    <div className="mt-5 pt-5 border-t border-border/50 space-y-2.5">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>গভীর পরিষ্কার</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>দাগ ও গন্ধ দূর</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add-ons */}
        {addons && addons.length > 0 && (
          <div className="max-w-4xl mx-auto mt-8 sm:mt-10 bg-background rounded-3xl p-5 sm:p-7 shadow-card border border-border/40">
            <h3 className="font-bold text-foreground mb-4 text-base sm:text-lg">অতিরিক্ত সেবা (Add-ons):</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addons.map((a) => (
                <div key={a.id} className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/40 rounded-xl px-3 sm:px-4 py-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent flex-shrink-0" />
                  <span>{a.name} — <span className="font-semibold text-foreground">প্রতি {a.unit_label} ৳{Number(a.price_per_unit_bdt)}</span></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delivery policy */}
        {settings && (
          <div className="max-w-4xl mx-auto mt-5 sm:mt-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-3xl p-5 sm:p-7 border border-primary/10">
            <h3 className="font-bold text-primary mb-2">ডেলিভারি পলিসি</h3>
            <p className="text-sm text-foreground">{settings.inside_dhaka_policy}</p>
            <p className="text-sm text-foreground mt-1">
              {settings.outside_dhaka_policy}{" "}
              <span className="font-bold gradient-text">
                (অতিরিক্ত ৳{settings.outside_dhaka_surcharge_bdt})
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 80" className="relative block w-full h-10 sm:h-12" preserveAspectRatio="none">
          <path fill="hsl(var(--surface-aqua))" d="M0,40 C360,80 720,0 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  );
}
