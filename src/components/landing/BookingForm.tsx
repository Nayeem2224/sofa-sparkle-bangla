import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Minus, Plus, ShieldCheck, Sparkles } from "lucide-react";
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
    <section id="booking-form" className="bg-gradient-to-b from-background to-secondary/30 py-20">
      <div className="container max-w-5xl px-4">
        {/* Scarcity banner */}
        {settings?.scarcity_message && (
          <div className="animate-fade-in bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center mb-8 backdrop-blur-sm">
            <span className="text-primary font-bold text-sm flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              {settings.scarcity_message}
              <Sparkles className="h-4 w-4" />
            </span>
          </div>
        )}

        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3 font-[Poppins]">
            এখনই অ্যাপয়েন্টমেন্ট বুক করুন
          </h2>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            আপনার সুবিধামতো সময় ও প্যাকেজ বেছে নিন। আমরা আপনার দোরগোড়ায় পৌঁছে যাবো।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 bg-card rounded-3xl shadow-[var(--shadow-card)] border border-border/50 p-6 md:p-8 space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-foreground">আপনার নাম *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="সম্পূর্ণ নাম"
                className="h-12 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors duration-200"
              />
              {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-foreground">ফোন নম্বর *</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01816390415"
                className="h-12 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors duration-200"
              />
              {errors.phone && <p className="text-destructive text-xs">{errors.phone}</p>}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-semibold text-foreground">সম্পূর্ণ ঠিকানা *</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="বাসা/ফ্ল্যাট নম্বর, রোড, এলাকা"
                rows={2}
                className="rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors duration-200"
              />
              {errors.address && <p className="text-destructive text-xs">{errors.address}</p>}
            </div>

            {/* District */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">এলাকা (ঐচ্ছিক)</Label>
              <Select value={district} onValueChange={setDistrict}>
                <SelectTrigger className="h-12 rounded-xl border-border/60 bg-muted/30">
                  <SelectValue placeholder="এলাকা নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {DHAKA_AREAS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Package */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">সার্ভিস প্যাকেজ *</Label>
              <Select value={packageId} onValueChange={setPackageId}>
                <SelectTrigger className="h-12 rounded-xl border-border/60 bg-muted/30">
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
              {errors.package && <p className="text-destructive text-xs">{errors.package}</p>}
            </div>

            {/* Add-ons */}
            {addons && addons.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">অতিরিক্ত সেবা</Label>
                <div className="space-y-3">
                  {addons.map((a) => (
                    <div key={a.id} className="flex items-center justify-between bg-secondary/40 rounded-2xl p-4 border border-primary/10 hover:border-primary/25 transition-all duration-200">
                      <div>
                        <span className="text-sm font-semibold text-foreground">{a.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">(৳{Number(a.price_per_unit_bdt)}/{a.unit_label})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateAddonQty(a.id, -1)}
                          className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-bold text-foreground">{addonQty[a.id] || 0}</span>
                        <button
                          type="button"
                          onClick={() => updateAddonQty(a.id, 1)}
                          className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Outside Dhaka */}
            <div className="flex items-center gap-4 bg-secondary/40 rounded-2xl p-4 border border-primary/10">
              <Switch checked={isOutsideDhaka} onCheckedChange={setIsOutsideDhaka} />
              <Label className="cursor-pointer text-sm font-medium">ঢাকা সিটি কর্পোরেশনের বাইরে?</Label>
              {isOutsideDhaka && (
                <span className="text-xs text-primary font-bold ml-auto bg-primary/10 px-3 py-1 rounded-full">+৳{surchargeAmount}</span>
              )}
            </div>

            {/* Date & Time row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Date */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">পছন্দের তারিখ *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal rounded-xl border-border/60 bg-muted/30 hover:bg-background",
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
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">পছন্দের সময় *</Label>
                <Select value={timeSlotId} onValueChange={setTimeSlotId}>
                  <SelectTrigger className="h-12 rounded-xl border-border/60 bg-muted/30">
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
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-foreground">অতিরিক্ত তথ্য (ঐচ্ছিক)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="বিশেষ কোনো তথ্য থাকলে লিখুন..."
                rows={2}
                className="rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors duration-200"
              />
            </div>
          </div>

          {/* Live Price Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-card rounded-3xl shadow-[var(--shadow-elevated)] border border-primary/15 p-6 space-y-4 overflow-hidden relative">
                {/* Decorative corner */}
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/5 rounded-full blur-xl" />

                <h3 className="font-bold text-primary text-lg flex items-center gap-2 relative">
                  <Sparkles className="h-5 w-5" />
                  মূল্য সারসংক্ষেপ
                </h3>

                <div className="space-y-3 text-sm relative">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">প্যাকেজ মূল্য</span>
                    <span
                      key={pricing.basePrice}
                      className="font-semibold text-foreground animate-fade-in"
                    >
                      ৳{pricing.basePrice}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">অতিরিক্ত সেবা</span>
                    <span
                      key={pricing.addonsTotal}
                      className="font-semibold text-foreground animate-fade-in"
                    >
                      ৳{pricing.addonsTotal}
                    </span>
                  </div>
                  {isOutsideDhaka && (
                    <div className="flex justify-between items-center py-1 animate-fade-in">
                      <span className="text-muted-foreground">ঢাকার বাইরে সার্চার্জ</span>
                      <span className="font-semibold text-foreground">৳{pricing.surcharge}</span>
                    </div>
                  )}

                  <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent my-2" />

                  <div className="flex justify-between items-center py-2">
                    <span className="text-lg font-bold text-primary">মোট</span>
                    <span
                      key={pricing.grandTotal}
                      className="text-2xl font-extrabold text-primary animate-fade-in"
                    >
                      ৳{pricing.grandTotal}
                    </span>
                  </div>
                </div>

                {/* Payment note */}
                {settings?.payment_note && (
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-xl p-3 border border-border/50">
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
                  className="w-full rounded-2xl h-14 text-base shadow-[var(--shadow-elevated)]"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? "প্রসেসিং..." : "অ্যাপয়েন্টমেন্ট কনফার্ম করুন"}
                </Button>
              </div>

              {/* Trust badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-card rounded-2xl p-3 border border-border/50">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>আপনার তথ্য সম্পূর্ণ নিরাপদ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
