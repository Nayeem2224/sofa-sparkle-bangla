import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

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

  const isLongValue = (key: string) =>
    ["hero_headline", "hero_subheadline", "scarcity_message", "guarantee_text", "confirmation_message", "payment_note"].includes(key);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-[Poppins]">সাইট সেটিংস</h1>
          <p className="text-sm text-muted-foreground">ল্যান্ডিং পেজের টেক্সট ও কনফিগারেশন পরিবর্তন করুন</p>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="rounded-xl">
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
          সেভ করুন
        </Button>
      </div>

      <div className="grid gap-4">
        {settings?.map((s) => (
          <Card key={s.id} className="rounded-2xl border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">{s.key}</CardTitle>
              {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
            </CardHeader>
            <CardContent>
              {isLongValue(s.key) ? (
                <Textarea
                  value={formValues[s.key] || ""}
                  onChange={(e) => setFormValues({ ...formValues, [s.key]: e.target.value })}
                  rows={2}
                  className="rounded-xl"
                />
              ) : (
                <Input
                  value={formValues[s.key] || ""}
                  onChange={(e) => setFormValues({ ...formValues, [s.key]: e.target.value })}
                  className="rounded-xl"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
