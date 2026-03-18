import { Check, Star } from "lucide-react";
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

  const packageColors: Record<string, string> = {
    basic: "border-border hover:border-primary/40",
    standard: "border-primary/30 hover:border-primary",
    premium: "border-primary ring-2 ring-primary/20",
  };

  return (
    <section className="bg-surface-grey py-16 pb-20 relative">
      <div className="container">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-3">
          সার্ভিস প্যাকেজ ও <span className="text-primary">মূল্য</span>
        </h2>
        <p className="text-center text-muted-foreground mb-10">আপনার প্রয়োজন অনুযায়ী প্যাকেজ বেছে নিন</p>

        {loadingPkg ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto stagger-children">
            {packages?.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-background rounded-2xl p-6 shadow-card border-2 transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 relative ${packageColors[pkg.package_type] || "border-border"}`}
              >
                {pkg.package_type === "premium" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                      <Star className="h-3 w-3 fill-current" /> সবচেয়ে জনপ্রিয়
                    </span>
                  </div>
                )}
                <p className="text-xs font-bold text-primary uppercase tracking-wider">
                  {packageTypeLabel[pkg.package_type] || pkg.package_type}
                </p>
                <h3 className="text-xl font-bold text-foreground mt-2">{pkg.name}</h3>
                <p className="text-3xl font-extrabold text-primary mt-4">
                  ৳{Number(pkg.base_price_bdt).toLocaleString("bn-BD")}
                </p>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{pkg.description}</p>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>গভীর পরিষ্কার</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground mt-1.5">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>দাগ ও গন্ধ দূর</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add-ons */}
        {addons && addons.length > 0 && (
          <div className="max-w-4xl mx-auto mt-8 bg-background rounded-2xl p-6 shadow-card border border-border/50">
            <h3 className="font-bold text-foreground mb-3">অতিরিক্ত সেবা (Add-ons):</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {addons.map((a) => (
                <div key={a.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {a.name} — প্রতি {a.unit_label} ৳{Number(a.price_per_unit_bdt)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delivery policy */}
        {settings && (
          <div className="max-w-4xl mx-auto mt-6 bg-primary/5 rounded-2xl p-6 border border-primary/10">
            <h3 className="font-bold text-primary mb-2">ডেলিভারি পলিসি</h3>
            <p className="text-sm text-foreground">{settings.inside_dhaka_policy}</p>
            <p className="text-sm text-foreground mt-1">
              {settings.outside_dhaka_policy}{" "}
              <span className="font-bold text-primary">
                (অতিরিক্ত ৳{settings.outside_dhaka_surcharge_bdt})
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 80" className="relative block w-full h-12">
          <path fill="hsl(var(--surface-aqua))" d="M0,40 C360,80 720,0 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  );
}
