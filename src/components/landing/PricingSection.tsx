import { Check, Star, Crown, Sofa, Sparkles } from "lucide-react";
import { usePackages, useAddOns, useSiteSettings } from "@/hooks/use-landing-data";
import { Skeleton } from "@/components/ui/skeleton";
import { pixelViewContent } from "@/lib/pixel";

export default function PricingSection() {
  const { data: packages, isLoading: loadingPkg } = usePackages();
  const { data: addons } = useAddOns();
  const { data: settings } = useSiteSettings();

  const packageTypeLabel: Record<string, string> = {
    basic: "বেসিক",
    standard: "স্ট্যান্ডার্ড",
    premium: "প্রিমিয়াম"
  };

  const packageBadge: Record<string, string> = {
    basic: "বেসিক",
    standard: "জনপ্রিয়",
    premium: "প্রিমিয়াম"
  };

  return (
    <section id="pricing" className="bg-surface-grey py-16 md:py-24 pb-20 md:pb-28 relative">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 rounded-full px-4 py-1.5 mb-5">
            <Sparkles className="h-3.5 w-3.5" /> সেরা মূল্যে সেরা সেবা
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-foreground leading-tight">
            প্যাকেজ ও <span className="gradient-text">মূল্য</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3">আপনার প্রয়োজন অনুযায়ী প্যাকেজ বেছে নিন</p>
        </div>

        {loadingPkg ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto stagger-children">
            {packages?.map((pkg, index) => {
              const isPremium = pkg.package_type === "premium";
              const isStandard = pkg.package_type === "standard";
              return (
                <div
                  key={pkg.id}
                  className={`relative bg-card rounded-2xl border-2 transition-all duration-300 hover:shadow-elevated hover:-translate-y-2 overflow-hidden ${
                    isPremium
                      ? "border-primary ring-2 ring-primary/20 shadow-lg"
                      : isStandard
                      ? "border-primary/20 hover:border-primary/40 shadow-card"
                      : "border-border/50 hover:border-primary/30 shadow-card"
                  }`}
                >
                  {/* Badge */}
                  <div className={`px-5 py-2 text-xs font-bold uppercase tracking-wider ${
                    isPremium
                      ? "gradient-hero-bg text-primary-foreground"
                      : isStandard
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {isPremium && <Crown className="h-3 w-3 inline mr-1.5 -mt-0.5" />}
                    {packageBadge[pkg.package_type] || pkg.package_type}
                  </div>

                  <div className="p-5 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-foreground">{pkg.name}</h3>
                    <p className="text-3xl sm:text-4xl font-extrabold gradient-text mt-3">
                      ৳{Number(pkg.base_price_bdt).toLocaleString("bn-BD")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed min-h-[2.5rem]">{pkg.description}</p>

                    <div className="mt-5 pt-4 border-t border-border/40 space-y-2.5">
                      <div className="flex items-center gap-2.5 text-sm text-foreground">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>গভীর পরিষ্কার</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm text-foreground">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>দাগ ও গন্ধ দূর</span>
                      </div>
                      {isPremium && (
                        <div className="flex items-center gap-2.5 text-sm text-foreground">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>প্রোটেক্টিভ কোটিং</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add-ons */}
        {addons && addons.length > 0 && (
          <div className="max-w-5xl mx-auto mt-10 sm:mt-12">
            <h3 className="font-bold text-foreground mb-5 text-base sm:text-lg text-center">অতিরিক্ত সেবা (Add-ons):</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {addons.map((a) => (
                <div key={a.id} className="flex items-center gap-3 text-sm bg-card rounded-xl px-4 py-3 border border-border/40 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-primary to-accent flex-shrink-0" />
                  <span className="text-muted-foreground">
                    {a.name} — <span className="font-semibold text-foreground">প্রতি {a.unit_label} ৳{Number(a.price_per_unit_bdt)}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delivery policy */}
        {settings && (
          <div className="max-w-5xl mx-auto mt-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-5 sm:p-6 border border-primary/10">
            <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
              <Sofa className="h-4 w-4" /> ডেলিভারি পলিসি
            </h3>
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
