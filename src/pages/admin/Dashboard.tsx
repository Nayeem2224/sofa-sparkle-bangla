import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Clock, CheckCircle2, XCircle, TrendingUp, Package } from "lucide-react";

function useBookingStats() {
  return useQuery({
    queryKey: ["admin-booking-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, status, grand_total, created_at");
      if (error) throw error;

      const total = data.length;
      const pending = data.filter((b) => b.status === "pending").length;
      const confirmed = data.filter((b) => b.status === "confirmed").length;
      const inProgress = data.filter((b) => b.status === "in_progress").length;
      const completed = data.filter((b) => b.status === "completed").length;
      const cancelled = data.filter((b) => b.status === "cancelled").length;
      const revenue = data
        .filter((b) => b.status === "completed")
        .reduce((sum, b) => sum + Number(b.grand_total), 0);

      const today = new Date().toISOString().split("T")[0];
      const todayCount = data.filter((b) => b.created_at.startsWith(today)).length;

      return { total, pending, confirmed, inProgress, completed, cancelled, revenue, todayCount };
    },
    refetchInterval: 30_000,
  });
}

const statCards = [
  { key: "total" as const, label: "মোট বুকিং", icon: CalendarCheck, color: "text-primary" },
  { key: "pending" as const, label: "পেন্ডিং", icon: Clock, color: "text-yellow-600" },
  { key: "confirmed" as const, label: "কনফার্মড", icon: CheckCircle2, color: "text-blue-600" },
  { key: "completed" as const, label: "সম্পন্ন", icon: CheckCircle2, color: "text-green-600" },
  { key: "cancelled" as const, label: "বাতিল", icon: XCircle, color: "text-destructive" },
  { key: "todayCount" as const, label: "আজকের বুকিং", icon: TrendingUp, color: "text-primary" },
];

export default function Dashboard() {
  const { data: stats, isLoading } = useBookingStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-[Poppins]">ড্যাশবোর্ড</h1>
        <p className="text-sm text-muted-foreground">Purexify বুকিং ওভারভিউ</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <Card key={card.key} className="rounded-2xl border-border/50">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-2">
                <card.icon className={`h-4 w-4 ${card.color}`} />
                <CardTitle className="text-xs text-muted-foreground font-normal">{card.label}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-bold text-foreground">
                {isLoading ? "—" : stats?.[card.key] ?? 0}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Card */}
      <Card className="rounded-2xl border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">মোট রেভিনিউ (সম্পন্ন বুকিং)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-extrabold text-primary">
            ৳{isLoading ? "—" : (stats?.revenue ?? 0).toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
