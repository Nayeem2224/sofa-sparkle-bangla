import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, Loader2, Building2, Phone, Globe, CreditCard, Sparkles, MessageSquare } from "lucide-react";

// Category definitions for organizing settings
const CATEGORIES: { key: string; label: string; icon: any; desc: string; keys: string[] }[] = [
  {
    key: "brand",
    label: "ব্র্যান্ড",
    icon: Building2,
    desc: "ব্যবসার নাম, ট্যাগলাইন ও মূল তথ্য",
    keys: ["business_name", "tagline", "hero_subheadline"],
  },
  {
    key: "contact",
    label: "যোগাযোগ",
    icon: Phone,
    desc: "ফোন, ইমেইল ও সোশ্যাল মিডিয়া",
    keys: ["helpline_number", "whatsapp_number", "contact_email", "facebook_url", "instagram_url"],
  },
  {
    key: "pricing",
    label: "মূল্য ও নীতি",
    icon: CreditCard,
    desc: "ডেলিভারি চার্জ, পেমেন্ট নোট ও নীতিমালা",
    keys: ["inside_dhaka_policy", "outside_dhaka_policy", "outside_dhaka_surcharge_bdt", "payment_note"],
  },
  {
    key: "offer",
    label: "স্পেশাল অফার",
    icon: Sparkles,
    desc: "অফার ব্যানার, মূল্য ও কাউন্টডাউন",
    keys: ["offer_enabled", "offer_text", "offer_original_price", "offer_price", "offer_duration_hours"],
  },
  {
    key: "trust",
    label: "ট্রাস্ট ও গ্যারান্টি",
    icon: Globe,
    desc: "স্কার্সিটি মেসেজ, গ্যারান্টি ও কাস্টমার সংখ্যা",
    keys: ["scarcity_message", "guarantee_text", "total_customers", "confirmation_message"],
  },
];

const LONG_KEYS = ["hero_subheadline", "scarcity_message", "guarantee_text", "confirmation_message", "payment_note", "inside_dhaka_policy", "outside_dhaka_policy"];

const KEY_LABELS: Record<string, string> = {
  business_name: "ব্যবসার নাম",
  tagline: "ট্যাগলাইন",
  hero_subheadline: "হিরো সাবহেডলাইন",
  helpline_number: "হেল্পলাইন নম্বর",
  whatsapp_number: "হোয়াটসঅ্যাপ নম্বর",
  contact_email: "ইমেইল",
  facebook_url: "ফেসবুক URL",
  instagram_url: "ইন্সটাগ্রাম URL",
  inside_dhaka_policy: "ঢাকার ভিতরে নীতি",
  outside_dhaka_policy: "ঢাকার বাইরে নীতি",
  outside_dhaka_surcharge_bdt: "ঢাকার বাইরে অতিরিক্ত চার্জ (৳)",
  payment_note: "পেমেন্ট নোট",
  offer_enabled: "অফার চালু (true/false)",
  offer_text: "অফার টেক্সট",
  offer_original_price: "আসল মূল্য",
  offer_price: "অফার মূল্য",
  offer_duration_hours: "কাউন্টডাউন (ঘন্টা)",
  scarcity_message: "স্কার্সিটি মেসেজ",
  guarantee_text: "গ্যারান্টি টেক্সট",
  total_customers: "মোট কাস্টমার",
  confirmation_message: "কনফার্মেশন মেসেজ",
};

export default function SiteSettings() {
  const qc = useQueryClient();
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").order("key");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      const map: Record<string, string> = {};
      settings.forEach((s) => { map[s.key] = s.value; });
      setFormValues(map);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      for (const setting of settings || []) {
        const newVal = formValues[setting.key];
        if (newVal !== setting.value) {
          const { error } = await supabase.from("site_settings").update({ value: newVal }).eq("id", setting.id);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-site-settings"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("সেটিংস সেভ হয়েছে");
    },
    onError: () => toast.error("সেভ করতে সমস্যা হয়েছে"),
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  // Get all categorized keys
  const categorizedKeys = new Set(CATEGORIES.flatMap((c) => c.keys));
  // Uncategorized keys (not in any category and not marketing keys)
  const marketingKeys = ["meta_pixel_id", "meta_access_token", "meta_test_code", "gtm_container_id", "server_side_api_url", "conversion_api_enabled", "gtm_server_url", "ga4_measurement_id"];
  const uncategorized = settings?.filter((s) => !categorizedKeys.has(s.key) && !marketingKeys.includes(s.key)) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-[Poppins]">সাইট সেটিংস</h1>
          <p className="text-sm text-muted-foreground">ক্যাটাগরি অনুযায়ী সব সেটিংস পরিবর্তন করুন</p>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="rounded-xl">
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
          সেভ করুন
        </Button>
      </div>

      <Tabs defaultValue="brand" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 rounded-xl">
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.key} value={cat.key} className="rounded-lg text-xs sm:text-sm">
              <cat.icon className="h-3.5 w-3.5 mr-1" />
              {cat.label}
            </TabsTrigger>
          ))}
          {uncategorized.length > 0 && (
            <TabsTrigger value="other" className="rounded-lg text-xs sm:text-sm">
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              অন্যান্য
            </TabsTrigger>
          )}
        </TabsList>

        {CATEGORIES.map((cat) => (
          <TabsContent key={cat.key} value={cat.key}>
            <Card className="rounded-2xl border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <cat.icon className="h-5 w-5 text-primary" /> {cat.label}
                </CardTitle>
                <CardDescription>{cat.desc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cat.keys.map((key) => {
                  const setting = settings?.find((s) => s.key === key);
                  if (!setting) return null;
                  const label = KEY_LABELS[key] || key;
                  return (
                    <div key={key} className="space-y-1.5">
                      <label className="text-sm font-semibold">{label}</label>
                      {setting.description && <p className="text-xs text-muted-foreground">{setting.description}</p>}
                      {LONG_KEYS.includes(key) ? (
                        <Textarea
                          value={formValues[key] || ""}
                          onChange={(e) => setFormValues({ ...formValues, [key]: e.target.value })}
                          rows={2}
                          className="rounded-xl"
                        />
                      ) : (
                        <Input
                          value={formValues[key] || ""}
                          onChange={(e) => setFormValues({ ...formValues, [key]: e.target.value })}
                          className="rounded-xl"
                        />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        {uncategorized.length > 0 && (
          <TabsContent value="other">
            <Card className="rounded-2xl border-border/50">
              <CardHeader>
                <CardTitle className="text-base">অন্যান্য সেটিংস</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {uncategorized.map((s) => (
                  <div key={s.id} className="space-y-1.5">
                    <label className="text-sm font-semibold">{KEY_LABELS[s.key] || s.key}</label>
                    {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
                    <Input
                      value={formValues[s.key] || ""}
                      onChange={(e) => setFormValues({ ...formValues, [s.key]: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
