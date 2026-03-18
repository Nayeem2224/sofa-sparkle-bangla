import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Minus, Plus, ShieldCheck, Sparkles, Package, Clock, MapPin, User, Phone, FileText, ChevronRight, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useSiteSettings, usePackages, useAddOns, useTimeSlots } from "@/hooks/use-landing-data";
import { calculatePricing, createBooking, type AddonItem } from "@/lib/api";
import { DHAKA_AREAS } from "@/lib/districts";

interface FormErrors {
  [key: string]: string;
}

export default function BookingForm() {
  const navigate = useNavigate();
  const { data: settings } = useSiteSettings();
  const { data: packages, isLoading: loadingPkg } = usePackages();
  const { data: addons } = useAddOns();
  const { data: timeSlots, isLoading: loadingSlots } = useTimeSlots();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [packageId, setPackageId] = useState("");
  const [isOutsideDhaka, setIsOutsideDhaka] = useState(false);
  const [preferredDate, setPreferredDate] = useState<Date>();
  const [timeSlotId, setTimeSlotId] = useState("");
  const [notes, setNotes] = useState("");
  const [addonQty, setAddonQty] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const surchargeAmount = Number(settings?.outside_dhaka_surcharge_bdt || 150);
  const selectedPackage = packages?.find((p) => p.id === packageId);

  const pricing = useMemo(() => {
    const basePrice = selectedPackage ? Number(selectedPackage.base_price_bdt) : 0;
    const addonList = (addons || []).map((a) => ({
      quantity: addonQty[a.id] || 0,
      unitPrice: Number(a.price_per_unit_bdt),
    }));
    return calculatePricing(basePrice, addonList, isOutsideDhaka, surchargeAmount);
  }, [selectedPackage, addons, addonQty, isOutsideDhaka, surchargeAmount]);

  const updateAddonQty = (id: string, delta: number) => {
    setAddonQty((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (name.trim().length < 3) e.name = "নাম কমপক্ষে ৩ অক্ষরের হতে হবে।";
    if (!/^01\d{9}$/.test(phone)) e.phone = "ফোন নম্বর ১১ সংখ্যার হতে হবে এবং 01 দিয়ে শুরু।";
    if (address.trim().length < 10) e.address = "সম্পূর্ণ ঠিকানা লিখুন (কমপক্ষে ১০ অক্ষর)।";
    if (!packageId) e.package = "একটি প্যাকেজ বেছে নিন।";
    if (!preferredDate) e.date = "তারিখ নির্বাচন করুন।";
    if (!timeSlotId) e.time = "সময় নির্বাচন করুন।";
    if (pricing.grandTotal <= 0) e.total = "মোট মূল্য ০ এর বেশি হতে হবে।";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      const addonItems: AddonItem[] = (addons || [])
        .filter((a) => (addonQty[a.id] || 0) > 0)
        .map((a) => ({
          add_on_id: a.id,
          quantity: addonQty[a.id],
          unit_price: Number(a.price_per_unit_bdt),
          subtotal: addonQty[a.id] * Number(a.price_per_unit_bdt),
        }));

      const result = await createBooking(
        {
          customer_name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          district: district || undefined,
          is_outside_dhaka: isOutsideDhaka,
          package_id: packageId,
          preferred_date: format(preferredDate!, "yyyy-MM-dd"),
          preferred_time_slot_id: timeSlotId,
          base_price: pricing.basePrice,
          addons_total: pricing.addonsTotal,
          surcharge: pricing.surcharge,
          grand_total: pricing.grandTotal,
          additional_notes: notes || undefined,
        },
        addonItems
      );

      navigate(`/confirmation?id=${result.bookingId}`);
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("slot_full")) {
        setErrors((prev) => ({ ...prev, time: "এই সময়ের স্লট পূর্ণ। অন্য সময় বেছে নিন।" }));
      } else if (msg.includes("past_date")) {
        setErrors((prev) => ({ ...prev, date: "আপনি অতীত তারিখে বুকিং দিতে পারবেন না।" }));
      } else {
        console.error("Booking error:", err);
        setSubmitError("বুকিং সম্পন্ন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const packageTypeIcon: Record<string, string> = {
    basic: "🧹",
    standard: "✨",
    premium: "👑",
  };

  return (
    <section id="booking-form" className="relative py-16 md:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--surface-aqua))] via-background to-[hsl(var(--surface-grey))]" />

      <div className="container relative z-10 max-w-6xl px-4">
        {/* Scarcity banner */}
        {settings?.scarcity_message && (
          <div className="animate-fade-in-up gradient-hero-bg rounded-2xl p-3.5 text-center mb-8 shadow-lg max-w-2xl mx-auto">
            <span className="text-primary-foreground font-bold text-sm flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 animate-pulse" />
              {settings.scarcity_message}
              <Sparkles className="h-4 w-4 animate-pulse" />
            </span>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">
            এখনই <span className="gradient-text">বুকিং করুন</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
            আপনার সুবিধামতো সময় ও প্যাকেজ বেছে নিন
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* ─── Main Form Column ─── */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-3xl border border-border/60 shadow-[var(--shadow-card)] overflow-hidden">

              {/* ── Section 1: Personal Info ── */}
              <div className="p-5 md:p-7 border-b border-border/40">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-7 h-7 rounded-lg gradient-hero-bg flex items-center justify-center text-xs font-bold text-primary-foreground">1</div>
                  <h3 className="font-bold text-foreground text-sm">ব্যক্তিগত তথ্য</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground">আপনার নাম *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="সম্পূর্ণ নাম" className="h-11 pl-9 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors" />
                    </div>
                    {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground">ফোন নম্বর *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                      <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="h-11 pl-9 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors" />
                    </div>
                    {errors.phone && <p className="text-destructive text-xs">{errors.phone}</p>}
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-semibold text-muted-foreground">সম্পূর্ণ ঠিকানা *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                    <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="বাসা/ফ্ল্যাট নম্বর, রোড, এলাকা" rows={2} className="pl-9 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors resize-none" />
                  </div>
                  {errors.address && <p className="text-destructive text-xs">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">এলাকা (ঐচ্ছিক)</Label>
                    <Select value={district} onValueChange={setDistrict}>
                      <SelectTrigger className="h-11 rounded-xl border-border/50 bg-muted/30">
                        <SelectValue placeholder="এলাকা নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl max-h-60">
                        {DHAKA_AREAS.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">ঢাকার বাইরে?</Label>
                    <div className="flex items-center gap-3 h-11 bg-muted/30 rounded-xl border border-border/50 px-3">
                      <Switch checked={isOutsideDhaka} onCheckedChange={setIsOutsideDhaka} />
                      <span className="text-sm text-muted-foreground">{isOutsideDhaka ? 'হ্যাঁ' : 'না'}</span>
                      {isOutsideDhaka && (
                        <span className="text-xs text-primary font-bold ml-auto bg-primary/10 px-2 py-0.5 rounded-full">+৳{surchargeAmount}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Section 2: Package Selection ── */}
              <div className="p-5 md:p-7 border-b border-border/40">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-7 h-7 rounded-lg gradient-hero-bg flex items-center justify-center text-xs font-bold text-primary-foreground">2</div>
                  <h3 className="font-bold text-foreground text-sm">সার্ভিস প্যাকেজ বেছে নিন *</h3>
                </div>

                {loadingPkg ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl bg-muted/50 animate-pulse" />)}
                  </div>
                ) : packages && packages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {packages.map((p) => {
                      const selected = packageId === p.id;
                      const isPremium = p.package_type === 'premium';
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPackageId(p.id)}
                          className={cn(
                            "relative text-left rounded-2xl p-4 border-2 transition-all duration-300 group",
                            selected
                              ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
                              : "border-border/40 bg-muted/20 hover:border-primary/30 hover:shadow-md",
                            isPremium && !selected && "border-accent/30 bg-accent/[0.03]"
                          )}
                        >
                          {isPremium && (
                            <div className="absolute -top-2.5 left-3">
                              <span className="text-[10px] font-bold bg-accent text-accent-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Star className="h-2.5 w-2.5" /> জনপ্রিয়
                              </span>
                            </div>
                          )}
                          <div className="flex items-start justify-between">
                            <span className="text-xl">{packageTypeIcon[p.package_type] || "📦"}</span>
                            {selected && (
                              <CheckCircle2 className="h-5 w-5 text-primary animate-fade-in" />
                            )}
                          </div>
                          <span className="text-sm font-bold text-foreground block mt-2">{p.name}</span>
                          {p.description && <span className="text-[11px] text-muted-foreground block mt-0.5 leading-snug">{p.description}</span>}
                          <span className="text-lg font-extrabold text-primary mt-2 block">
                            ৳{Number(p.base_price_bdt).toLocaleString("bn-BD")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">কোনো প্যাকেজ পাওয়া যায়নি।</p>
                )}
                {errors.package && <p className="text-destructive text-xs mt-2">{errors.package}</p>}

                {/* Add-ons */}
                {addons && addons.length > 0 && (
                  <div className="mt-5">
                    <Label className="text-xs font-semibold text-muted-foreground mb-3 block">অতিরিক্ত সেবা (ঐচ্ছিক)</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {addons.map((a) => {
                        const qty = addonQty[a.id] || 0;
                        return (
                          <div
                            key={a.id}
                            className={cn(
                              "rounded-xl p-3 border transition-all duration-200 flex items-center justify-between gap-3",
                              qty > 0
                                ? "border-accent/40 bg-accent/5"
                                : "border-border/40 bg-muted/20 hover:border-border"
                            )}
                          >
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-foreground block truncate">{a.name}</span>
                              <span className="text-[11px] text-muted-foreground">৳{Number(a.price_per_unit_bdt)}/{a.unit_label}</span>
                              {qty > 0 && (
                                <span className="text-[11px] font-bold text-accent ml-1.5">= ৳{qty * Number(a.price_per_unit_bdt)}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => updateAddonQty(a.id, -1)}
                                className="w-7 h-7 rounded-lg bg-background border border-border/60 flex items-center justify-center hover:bg-destructive/10 transition-colors disabled:opacity-30"
                                disabled={qty === 0}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className={cn("w-7 text-center text-xs font-bold", qty > 0 ? "text-accent" : "text-muted-foreground")}>{qty}</span>
                              <button
                                type="button"
                                onClick={() => updateAddonQty(a.id, 1)}
                                className="w-7 h-7 rounded-lg bg-background border border-border/60 flex items-center justify-center hover:bg-primary/10 transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Section 3: Schedule ── */}
              <div className="p-5 md:p-7">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-7 h-7 rounded-lg gradient-hero-bg flex items-center justify-center text-xs font-bold text-primary-foreground">3</div>
                  <h3 className="font-bold text-foreground text-sm">তারিখ ও সময় নির্ধারণ</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">পছন্দের তারিখ *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-11 justify-start text-left font-normal rounded-xl border-border/50 bg-muted/30 hover:bg-background",
                            !preferredDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                          {preferredDate ? format(preferredDate, "PPP") : "তারিখ নির্বাচন করুন"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                        <Calendar
                          mode="single"
                          selected={preferredDate}
                          onSelect={setPreferredDate}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.date && <p className="text-destructive text-xs">{errors.date}</p>}
                  </div>

                  {/* Time Slots as visual buttons */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">পছন্দের সময় *</Label>
                    {loadingSlots ? (
                      <div className="grid grid-cols-2 gap-2">
                        {[1,2,3,4].map(i => <div key={i} className="h-10 rounded-xl bg-muted/50 animate-pulse" />)}
                      </div>
                    ) : timeSlots && timeSlots.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {timeSlots.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setTimeSlotId(s.id)}
                            className={cn(
                              "h-10 rounded-xl border text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5",
                              timeSlotId === s.id
                                ? "border-primary bg-primary text-primary-foreground shadow-md"
                                : "border-border/50 bg-muted/20 text-foreground hover:border-primary/30 hover:bg-primary/5"
                            )}
                          >
                            <Clock className="h-3 w-3" />
                            {s.slot_label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground py-2">কোনো সময় স্লট পাওয়া যায়নি।</p>
                    )}
                    {errors.time && <p className="text-destructive text-xs mt-1">{errors.time}</p>}
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-4 space-y-1.5">
                  <Label htmlFor="notes" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" /> অতিরিক্ত তথ্য (ঐচ্ছিক)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="বিশেষ কোনো তথ্য থাকলে লিখুন..."
                    rows={2}
                    className="rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ─── Sticky Price Summary ─── */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <div className="rounded-3xl overflow-hidden shadow-[var(--shadow-elevated)] border border-primary/10 bg-card">
                {/* Gradient header */}
                <div className="gradient-hero-bg px-6 py-5 text-center relative overflow-hidden">
                  <div className="absolute inset-0 shimmer" />
                  <Sparkles className="h-5 w-5 text-primary-foreground/80 mx-auto mb-1" />
                  <h3 className="font-extrabold text-primary-foreground text-lg relative">মূল্য সারসংক্ষেপ</h3>
                </div>

                <div className="p-5 space-y-4">
                  {/* Selected package display */}
                  {selectedPackage ? (
                    <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Package className="h-3.5 w-3.5 text-primary" /> নির্বাচিত প্যাকেজ
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground">{selectedPackage.name}</span>
                        <span className="font-extrabold text-primary">৳{Number(selectedPackage.base_price_bdt).toLocaleString("bn-BD")}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/30 rounded-xl p-3 border border-border/30 text-center">
                      <span className="text-xs text-muted-foreground">প্যাকেজ নির্বাচন করুন</span>
                    </div>
                  )}

                  {/* Price breakdown */}
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">প্যাকেজ মূল্য</span>
                      <span className="font-bold text-foreground">৳{pricing.basePrice.toLocaleString("bn-BD")}</span>
                    </div>
                    {pricing.addonsTotal > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">অতিরিক্ত সেবা</span>
                        <span className="font-bold text-foreground">৳{pricing.addonsTotal.toLocaleString("bn-BD")}</span>
                      </div>
                    )}
                    {isOutsideDhaka && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">ঢাকার বাইরে সার্চার্জ</span>
                        <span className="font-bold text-foreground">৳{pricing.surcharge.toLocaleString("bn-BD")}</span>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-dashed border-border/50" />

                  {/* Grand total */}
                  <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 rounded-2xl p-4 text-center">
                    <span className="text-[11px] text-muted-foreground block mb-0.5 uppercase tracking-wider font-semibold">সর্বমোট</span>
                    <span className="text-3xl font-extrabold gradient-text">
                      ৳{pricing.grandTotal.toLocaleString("bn-BD")}
                    </span>
                  </div>

                  {settings?.payment_note && (
                    <p className="text-[11px] text-muted-foreground bg-muted/40 rounded-xl p-2.5 text-center border border-border/30">
                      {settings.payment_note}
                    </p>
                  )}

                  {submitError && (
                    <p className="text-destructive text-xs font-medium bg-destructive/10 rounded-xl p-3">{submitError}</p>
                  )}
                  {errors.total && (
                    <p className="text-destructive text-xs font-medium bg-destructive/10 rounded-xl p-3">{errors.total}</p>
                  )}

                  <Button
                    variant="cta"
                    size="lg"
                    className="w-full rounded-2xl h-13 text-base shadow-[var(--shadow-elevated)] glow-primary"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                        প্রসেসিং...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        অ্যাপয়েন্টমেন্ট কনফার্ম করুন
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Trust badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-card rounded-2xl p-3 border border-border/40 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>আপনার তথ্য সম্পূর্ণ নিরাপদ ও এনক্রিপ্টেড</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
