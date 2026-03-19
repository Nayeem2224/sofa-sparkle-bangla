import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Flame, Star, Zap } from "lucide-react";

const iconMap: Record<string, any> = {
  sparkles: Sparkles,
  flame: Flame,
  star: Star,
  zap: Zap,
};

export default function MarqueeBanner() {
  const { data: items } = useQuery({
    queryKey: ["marquee-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marquee_items" as any)
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as any[];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (!items || items.length === 0) return null;

  const content = items.map((item: any, i: number) => {
    const Icon = iconMap[item.icon] || Sparkles;
    return (
      <span key={i} className="inline-flex items-center gap-1.5 mx-6 whitespace-nowrap">
        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
        <span>{item.text}</span>
      </span>
    );
  });

  return (
    <div className="bg-primary text-primary-foreground text-xs font-semibold overflow-hidden py-1.5 select-none">
      <div className="flex animate-marquee">
        {content}
        {content}
        {content}
      </div>
    </div>
  );
}
