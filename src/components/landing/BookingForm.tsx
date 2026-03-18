import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Minus, Plus, ShieldCheck, Sparkles, Package, Clock, MapPin, User, Phone, FileText, ChevronRight } from "lucide-react";
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
  const { data: packages } = usePackages();
  const { data: addons } = useAddOns();
  const { data: timeSlots } = useTimeSlots();

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

  return (
    <section id="booking-form" className="relative py-20 overflow-hidden">
      {/* Background with pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/50 via-background to-secondary/30" />
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
      
      {/* Floating decorative elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 right-10 w-56 h-56 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="container relative z-10 max-w-5xl px-4">
        {/* Scarcity banner */}
        {settings?.scarcity_message && (
          <div className="animate-fade-in-up gradient-hero-bg rounded-2xl p-4 text-center mb-10 shadow-lg">
            <span className="text-primary-foreground font-bold text-sm flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 animate-pulse" />
              {settings.scarcity_message}
              <Sparkles className="h-4 w-4 animate-pulse" />
            </span>
          </div>
        )}

        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            <CalendarIcon className="h-3.5 w-3.5" />
            সহজ ৩ স্টেপে বুক করুন
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold gradient-text mb-3 font-poppins tracking-tight">
            এখনই অ্যাপয়েন্টমেন্ট বুক করুন
          </h2>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            আপনার সুবিধামতো সময় ও প্যাকেজ বেছে নিন। আমরা আপনার দোরগোড়ায় পৌঁছে যাবো।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-1">
            {/* Step 1: Personal Info */}
            <div className="glass-card rounded-3xl border border-border/40 p-6 md:p-8 space-y-5 shadow-[var(--shadow-card)] animate-fade-in-up">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl gradient-hero-bg flex items-center justify-center shadow-md">
                  <User className="h-4.5 w-4.5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">ব্যক্তিগত তথ্য</h3>
                  <p className="text-xs text-muted-foreground">আপনার নাম ও যোগাযোগের তথ্য</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-bold text-foreground/80 uppercase tracking-wider">আপনার নাম *</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="সম্পূর্ণ নাম"
                      className="h-12 pl-10 rounded-xl border-border/50 bg-background/60 focus:bg-background focus:border-primary/40 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                  {errors.name && <p className="text-destructive text-xs flex items-center gap-1">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-bold text-foreground/80 uppercase tracking-wider">ফোন নম্বর *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="h-12 pl-10 rounded-xl border-border/50 bg-background/60 focus:bg-background focus:border-primary/40 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                  {errors.phone && <p className="text-destructive text-xs">{errors.phone}</p>}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs font-bold text-foreground/80 uppercase tracking-wider">সম্পূর্ণ ঠিকানা *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="বাসা/ফ্ল্যাট নম্বর, রোড, এলাকা"
                    rows={2}
                    className="pl-10 rounded-xl border-border/50 bg-background/60 focus:bg-background focus:border-primary/40 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>
                {errors.address && <p className="text-destructive text-xs">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* District */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground/80 uppercase tracking-wider">এলাকা (ঐচ্ছিক)</Label>
                  <Select value={district} onValueChange={setDistrict}>
                    <SelectTrigger className="h-12 rounded-xl border-border/50 bg-background/60 focus:border-primary/40">
                      <SelectValue placeholder="এলাকা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-60">
                      {DHAKA_AREAS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Outside Dhaka */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground/80 uppercase tracking-wider">ঢাকার বাইরে?</Label>
                  <div className="flex items-center gap-3 h-12 bg-background/60 rounded-xl border border-border/50 px-4">
                    <Switch checked={isOutsideDhaka} onCheckedChange={setIsOutsideDhaka} />
                    <span className="text-sm text-foreground/70">{isOutsideDhaka ? 'হ্যাঁ' : 'না'}</span>
                    {isOutsideDhaka && (
                      <span className="text-xs text-primary font-bold ml-auto bg-primary/10 px-2.5 py-0.5 rounded-full animate-fade-in">+৳{surchargeAmount}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Connector line */}
            <div className="flex justify-center">
              <div className="w-px h-6 bg-gradient-to-b from-primary/30 to-primary/10" />
            </div>

            {/* Step 2: Package & Add-ons */}
            <div className="glass-card rounded-3xl border border-border/40 p-6 md:p-8 space-y-5 shadow-[var(--shadow-card)] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-md">
                  <Package className="h-4.5 w-4.5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">সার্ভিস নির্বাচন</h3>
                  <p className="text-xs text-muted-foreground">প্যাকেজ ও অতিরিক্ত সেবা বেছে নিন</p>
                </div>
              </div>

              {/* Package selection as cards */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground/80 uppercase tracking-wider">সার্ভিস প্যাকেজ *</Label>
                {packages && packages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {packages.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPackageId(p.id)}
                        className={cn(
                          "relative text-left rounded-2xl p-4 border-2 transition-all duration-300 group",
                          packageId === p.id
                            ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                            : "border-border/50 bg-background/60 hover:border-primary/30 hover:bg-primary/[0.02]"
                        )}
                      >
                        {packageId === p.id && (
                          <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full gradient-hero-bg flex items-center justify-center animate-fade-in">
                            <ChevronRight className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                        <span className="text-sm font-bold text-foreground block">{p.name}</span>
                        {p.description && <span className="text-xs text-muted-foreground block mt-0.5">{p.description}</span>}
                        <span className="text-lg font-extrabold text-primary mt-2 block">৳{Number(p.base_price_bdt)}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <Select value={packageId} onValueChange={setPackageId}>
                    <SelectTrigger className="h-12 rounded-xl border-border/50 bg-background/60">
                      <SelectValue placeholder="প্যাকেজ বেছে নিন" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {packages?.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} — ৳{Number(p.base_price_bdt)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.package && <p className="text-destructive text-xs">{errors.package}</p>}
              </div>

              {/* Add-ons */}
              {addons && addons.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-foreground/80 uppercase tracking-wider">অতিরিক্ত সেবা</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {addons.map((a) => {
                      const qty = addonQty[a.id] || 0;
                      return (
                        <div
                          key={a.id}
                          className={cn(
                            "rounded-2xl p-4 border-2 transition-all duration-300",
                            qty > 0
                              ? "border-accent/50 bg-accent/5"
                              : "border-border/40 bg-background/60 hover:border-accent/20"
                          )}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <span className="text-sm font-bold text-foreground block">{a.name}</span>
                              <span className="text-xs text-muted-foreground">৳{Number(a.price_per_unit_bdt)}/{a.unit_label}</span>
                            </div>
                            {qty > 0 && (
                              <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full animate-fade-in">
                                ৳{qty * Number(a.price_per_unit_bdt)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateAddonQty(a.id, -1)}
                              className="w-9 h-9 rounded-xl bg-background border border-border/60 flex items-center justify-center hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-all duration-200 disabled:opacity-30"
                              disabled={qty === 0}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className={cn(
                              "w-10 text-center text-sm font-extrabold rounded-lg py-1",
                              qty > 0 ? "text-accent bg-accent/10" : "text-muted-foreground"
                            )}>
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateAddonQty(a.id, 1)}
                              className="w-9 h-9 rounded-xl bg-background border border-border/60 flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-200"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Connector line */}
            <div className="flex justify-center">
              <div className="w-px h-6 bg-gradient-to-b from-primary/30 to-primary/10" />
            </div>

            {/* Step 3: Schedule */}
            <div className="glass-card rounded-3xl border border-border/40 p-6 md:p-8 space-y-5 shadow-[var(--shadow-card)] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-[hsl(var(--primary))] flex items-center justify-center shadow-md">
                  <Clock className="h-4.5 w-4.5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">সময়সূচী নির্ধারণ</h3>
                  <p className="text-xs text-muted-foreground">আপনার সুবিধামতো তারিখ ও সময়</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Date */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground/80 uppercase tracking-wider">পছন্দের তারিখ *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal rounded-xl border-border/50 bg-background/60 hover:bg-background hover:border-primary/30",
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

                {/* Time */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground/80 uppercase tracking-wider">পছন্দের সময় *</Label>
                  <Select value={timeSlotId} onValueChange={setTimeSlotId}>
                    <SelectTrigger className="h-12 rounded-xl border-border/50 bg-background/60 focus:border-primary/40">
                      <SelectValue placeholder="সময় বেছে নিন" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {timeSlots?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.slot_label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.time && <p className="text-destructive text-xs">{errors.time}</p>}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-bold text-foreground/80 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  অতিরিক্ত তথ্য (ঐচ্ছিক)
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="বিশেষ কোনো তথ্য থাকলে লিখুন..."
                  rows={2}
                  className="rounded-xl border-border/50 bg-background/60 focus:bg-background focus:border-primary/40 focus:ring-primary/20 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Live Price Summary — Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="rounded-3xl overflow-hidden shadow-[var(--shadow-elevated)] border border-primary/15">
                {/* Header gradient */}
                <div className="gradient-hero-bg p-5 text-center relative">
                  <div className="absolute inset-0 shimmer" />
                  <Sparkles className="h-6 w-6 text-primary-foreground/80 mx-auto mb-1.5" />
                  <h3 className="font-extrabold text-primary-foreground text-lg relative">মূল্য সারসংক্ষেপ</h3>
                </div>

                <div className="bg-card p-6 space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5" /> প্যাকেজ মূল্য
                      </span>
                      <span key={pricing.basePrice} className="font-bold text-foreground animate-fade-in">
                        ৳{pricing.basePrice}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Plus className="h-3.5 w-3.5" /> অতিরিক্ত সেবা
                      </span>
                      <span key={pricing.addonsTotal} className="font-bold text-foreground animate-fade-in">
                        ৳{pricing.addonsTotal}
                      </span>
                    </div>
                    {isOutsideDhaka && (
                      <div className="flex justify-between items-center py-1.5 border-b border-border/30 animate-fade-in">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" /> সার্চার্জ
                        </span>
                        <span className="font-bold text-foreground">৳{pricing.surcharge}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-4 text-center">
                    <span className="text-xs text-muted-foreground block mb-0.5">সর্বমোট</span>
                    <span key={pricing.grandTotal} className="text-3xl font-extrabold gradient-text animate-fade-in">
                      ৳{pricing.grandTotal}
                    </span>
                  </div>

                  {/* Payment note */}
                  {settings?.payment_note && (
                    <p className="text-xs text-muted-foreground bg-muted/40 rounded-xl p-3 border border-border/40 text-center">
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
                    className="w-full rounded-2xl h-14 text-base shadow-[var(--shadow-elevated)] glow-primary"
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
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground glass-card rounded-2xl p-3.5 border border-border/40 shadow-sm">
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
