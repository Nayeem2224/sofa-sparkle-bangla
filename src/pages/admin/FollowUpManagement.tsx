import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Bell, Search, Loader2, Phone, MessageCircle, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";

const statusLabels: Record<string, string> = {
  pending: "পেন্ডিং",
  contacted: "যোগাযোগ হয়েছে",
  booked: "পুনরায় বুক হয়েছে",
  skipped: "স্কিপ",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  contacted: "bg-blue-100 text-blue-800 border-blue-300",
  booked: "bg-green-100 text-green-800 border-green-300",
  skipped: "bg-gray-100 text-gray-800 border-gray-300",
};

export default function FollowUpManagement() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedFollowUp, setSelectedFollowUp] = useState<any>(null);
  const [noteText, setNoteText] = useState("");

  const { data: followUps, isLoading } = useQuery({
    queryKey: ["admin-follow-ups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("follow_ups")
        .select("*")
        .order("follow_up_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    refetchInterval: 30_000,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const update: any = { status };
      if (notes !== undefined) update.notes = notes;
      const { error } = await supabase.from("follow_ups").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-follow-ups"] });
      toast.success("ফলো-আপ আপডেট হয়েছে");
    },
    onError: () => toast.error("আপডেট করতে সমস্যা হয়েছে"),
  });

  const filtered = followUps?.filter((f) => {
    const matchSearch = !search || f.customer_name.toLowerCase().includes(search.toLowerCase()) || f.phone.includes(search);
    const matchStatus = statusFilter === "all" || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Count urgent (due within 7 days or overdue)
  const urgentCount = followUps?.filter((f) => {
    if (f.status !== "pending") return false;
    const daysUntil = differenceInDays(new Date(f.follow_up_date), new Date());
    return daysUntil <= 7;
  }).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-[Poppins] flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" /> ফলো-আপ ম্যানেজমেন্ট
          </h1>
          <p className="text-sm text-muted-foreground">সম্পন্ন বুকিং থেকে ৬ মাস পর স্বয়ংক্রিয় রিমাইন্ডার</p>
        </div>
        {urgentCount > 0 && (
          <Badge className="bg-destructive/10 text-destructive border-destructive/30 px-4 py-2 text-sm animate-pulse">
            <AlertTriangle className="h-4 w-4 mr-1" /> {urgentCount} টি জরুরি ফলো-আপ
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="নাম বা ফোন দিয়ে খুঁজুন..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 rounded-xl" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 h-11 rounded-xl">
            <SelectValue placeholder="স্ট্যাটাস" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">সকল</SelectItem>
            {Object.entries(statusLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>গ্রাহক</TableHead>
                  <TableHead>ফোন</TableHead>
                  <TableHead>সার্ভিসের তারিখ</TableHead>
                  <TableHead>ফলো-আপ তারিখ</TableHead>
                  <TableHead>অবস্থা</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead className="w-32">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">কোনো ফলো-আপ নেই</TableCell>
                  </TableRow>
                )}
                {filtered?.map((f) => {
                  const daysUntil = differenceInDays(new Date(f.follow_up_date), new Date());
                  const isOverdue = isPast(new Date(f.follow_up_date)) && f.status === "pending";
                  const isDueSoon = daysUntil <= 7 && daysUntil >= 0 && f.status === "pending";

                  return (
                    <TableRow key={f.id} className={isOverdue ? "bg-destructive/5" : isDueSoon ? "bg-yellow-50" : ""}>
                      <TableCell className="font-medium">{f.customer_name}</TableCell>
                      <TableCell>{f.phone}</TableCell>
                      <TableCell>{f.service_date}</TableCell>
                      <TableCell className="font-semibold">
                        {f.follow_up_date}
                      </TableCell>
                      <TableCell>
                        {isOverdue ? (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" /> ওভারডিউ
                          </Badge>
                        ) : isDueSoon ? (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                            <Clock className="h-3 w-3 mr-1" /> {daysUntil} দিন বাকি
                          </Badge>
                        ) : f.status === "pending" ? (
                          <span className="text-xs text-muted-foreground">{daysUntil} দিন বাকি</span>
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${statusColors[f.status]}`}>
                          {statusLabels[f.status] || f.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <a href={`https://wa.me/88${f.phone}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#25D366] hover:bg-[#25D366]/10">
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </a>
                          <a href={`tel:${f.phone}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
                              <Phone className="h-4 w-4" />
                            </Button>
                          </a>
                          <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setSelectedFollowUp(f); setNoteText(f.notes || ""); }}>
                            আপডেট
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Update Dialog */}
      <Dialog open={!!selectedFollowUp} onOpenChange={(o) => !o && setSelectedFollowUp(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>ফলো-আপ আপডেট</DialogTitle>
          </DialogHeader>
          {selectedFollowUp && (
            <div className="space-y-4">
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">গ্রাহক:</span> <strong>{selectedFollowUp.customer_name}</strong></p>
                <p><span className="text-muted-foreground">ফোন:</span> <strong>{selectedFollowUp.phone}</strong></p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">স্ট্যাটাস পরিবর্তন</label>
                <Select value={selectedFollowUp.status} onValueChange={(val) => {
                  updateMutation.mutate({ id: selectedFollowUp.id, status: val, notes: noteText || undefined });
                  setSelectedFollowUp({ ...selectedFollowUp, status: val });
                }}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {Object.entries(statusLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">নোট</label>
                <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="ফলো-আপ নোট..." rows={3} className="rounded-xl" />
                <Button size="sm" onClick={() => updateMutation.mutate({ id: selectedFollowUp.id, status: selectedFollowUp.status, notes: noteText })} disabled={updateMutation.isPending}>
                  সেভ করুন
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
