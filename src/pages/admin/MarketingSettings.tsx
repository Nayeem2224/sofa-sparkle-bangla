import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Loader2, BarChart3, Code, Server, Tag } from "lucide-react";

const MARKETING_KEYS = [
  { key: "meta_pixel_id", label: "Meta Pixel ID", icon: BarChart3, desc: "Facebook/Meta Pixel ট্র্যাকিং আইডি" },
  { key: "meta_access_token", label: "Meta Access Token", icon: Code, desc: "Conversions API এর জন্য অ্যাক্সেস টোকেন" },
  { key: "meta_test_code", label: "Meta Test Event Code", icon: Tag, desc: "টেস্ট ইভেন্ট কোড (ডিবাগিং এর জন্য)" },
  { key: "gtm_container_id", label: "GTM Container ID", icon: Code, desc: "Google Tag Manager কন্টেইনার আইডি (GTM-XXXXXXX)" },
  { key: "server_side_api_url", label: "Server Side API URL", icon: Server, desc: "সার্ভার সাইড ট্র্যাকিং API URL" },
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-[Poppins] flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> মার্কেটিং সেটিংস
          </h1>
          <p className="text-sm text-muted-foreground">Meta Pixel, GTM ও সার্ভার সাইড ট্র্যাকিং কনফিগার করুন</p>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="rounded-xl">
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
          সেভ করুন
        </Button>
      </div>

      <div className="grid gap-4">
        {MARKETING_KEYS.map((mk) => (
          <Card key={mk.key} className="rounded-2xl border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <mk.icon className="h-4 w-4 text-primary" /> {mk.label}
              </CardTitle>
              <CardDescription className="text-xs">{mk.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={values[mk.key] || ""}
                onChange={(e) => setValues({ ...values, [mk.key]: e.target.value })}
                placeholder={`${mk.label} এখানে লিখুন...`}
                className="rounded-xl font-mono text-sm"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
