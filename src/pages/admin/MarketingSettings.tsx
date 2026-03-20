import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, Loader2, BarChart3, Code, Server, Tag, Globe, Zap } from "lucide-react";

const MARKETING_KEYS = [
  // Meta Pixel & Conversion API
  { key: "meta_pixel_id", label: "Meta Pixel ID", icon: BarChart3, desc: "Facebook/Meta Pixel ট্র্যাকিং আইডি (যেমন: 123456789)", category: "meta" },
  { key: "meta_access_token", label: "Meta Access Token", icon: Code, desc: "Conversions API এর জন্য অ্যাক্সেস টোকেন", category: "meta" },
  { key: "meta_test_code", label: "Meta Test Event Code", icon: Tag, desc: "টেস্ট ইভেন্ট কোড (ডিবাগিং এর জন্য)", category: "meta" },
  { key: "conversion_api_enabled", label: "Conversion API Enabled", icon: Zap, desc: "Meta Conversion API (সার্ভার সাইড) চালু করুন", category: "meta", isToggle: true },
  // GA4
  { key: "ga4_measurement_id", label: "GA4 Measurement ID", icon: BarChart3, desc: "Google Analytics 4 Measurement ID (G-XXXXXXXXXX)", category: "ga4" },
  // GTM
  { key: "gtm_container_id", label: "GTM Container ID", icon: Code, desc: "Google Tag Manager কন্টেইনার আইডি (GTM-XXXXXXX)", category: "gtm" },
  { key: "gtm_server_url", label: "GTM Server-side URL", icon: Server, desc: "সার্ভার সাইড GTM কন্টেইনার URL", category: "gtm" },
  // Server Side
  { key: "server_side_api_url", label: "Server Side API URL", icon: Globe, desc: "সার্ভার সাইড ট্র্যাকিং API URL", category: "server" },
];

export default function MarketingSettings() {
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-marketing-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .in("key", MARKETING_KEYS.map((k) => k.key));
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      const map: Record<string, string> = {};
      settings.forEach((s) => { map[s.key] = s.value; });
      setValues(map);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      for (const setting of settings || []) {
        const newVal = values[setting.key];
        if (newVal !== setting.value) {
          const { error } = await supabase.from("site_settings").update({ value: newVal }).eq("id", setting.id);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-marketing-settings"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("মার্কেটিং সেটিংস সেভ হয়েছে");
    },
    onError: () => toast.error("সেভ করতে সমস্যা হয়েছে"),
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const renderField = (mk: typeof MARKETING_KEYS[number]) => {
    if (mk.isToggle) {
      return (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{mk.label}</p>
            <p className="text-xs text-muted-foreground">{mk.desc}</p>
          </div>
          <Switch
            checked={values[mk.key] === "true"}
            onCheckedChange={(checked) => setValues({ ...values, [mk.key]: checked ? "true" : "false" })}
          />
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <mk.icon className="h-4 w-4 text-primary" />
          <Label className="text-sm font-semibold">{mk.label}</Label>
        </div>
        <p className="text-xs text-muted-foreground">{mk.desc}</p>
        <Input
          value={values[mk.key] || ""}
          onChange={(e) => setValues({ ...values, [mk.key]: e.target.value })}
          placeholder={`${mk.label} এখানে লিখুন...`}
          className="rounded-xl font-mono text-sm"
        />
      </div>
    );
  };

  const metaFields = MARKETING_KEYS.filter((k) => k.category === "meta");
  const ga4Fields = MARKETING_KEYS.filter((k) => k.category === "ga4");
  const gtmFields = MARKETING_KEYS.filter((k) => k.category === "gtm");
  const serverFields = MARKETING_KEYS.filter((k) => k.category === "server");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-[Poppins] flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> মার্কেটিং ও ট্র্যাকিং
          </h1>
          <p className="text-sm text-muted-foreground">Meta Pixel, Conversion API, GTM ও সার্ভার সাইড ট্র্যাকিং</p>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="rounded-xl">
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
          সেভ করুন
        </Button>
      </div>

      <Tabs defaultValue="meta" className="w-full">
        <TabsList className="rounded-xl">
          <TabsTrigger value="meta" className="rounded-lg">Meta Pixel & CAPI</TabsTrigger>
          <TabsTrigger value="gtm" className="rounded-lg">GTM</TabsTrigger>
          <TabsTrigger value="server" className="rounded-lg">Server-Side</TabsTrigger>
        </TabsList>

        <TabsContent value="meta">
          <Card className="rounded-2xl border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> Meta Pixel & Conversion API
              </CardTitle>
              <CardDescription>Facebook/Meta Pixel ID, Access Token, Test Code ও Conversion API কনফিগার করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {metaFields.map((mk) => <div key={mk.key}>{renderField(mk)}</div>)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gtm">
          <Card className="rounded-2xl border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" /> Google Tag Manager
              </CardTitle>
              <CardDescription>GTM Container ID ও Server-side Container URL কনফিগার করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {gtmFields.map((mk) => <div key={mk.key}>{renderField(mk)}</div>)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="server">
          <Card className="rounded-2xl border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" /> Server-Side Tracking
              </CardTitle>
              <CardDescription>সার্ভার সাইড ট্র্যাকিং API URL সেটআপ করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {serverFields.map((mk) => <div key={mk.key}>{renderField(mk)}</div>)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
