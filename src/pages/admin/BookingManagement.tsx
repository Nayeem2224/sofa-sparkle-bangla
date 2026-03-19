import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Search, Eye, Loader2, Edit, Save } from "lucide-react";

const STATUSES = ["pending", "confirmed", "in_progress", "completed", "cancelled"] as const;

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  in_progress: "bg-purple-100 text-purple-800 border-purple-300",
  completed: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

const statusLabels: Record<string, string> = {
  pending: "পেন্ডিং",
  confirmed: "কনফার্মড",
  in_progress: "চলমান",
  completed: "সম্পন্ন",
  cancelled: "বাতিল",
};

export default function BookingManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");
  const [editing, setEditing] = useState(false);
  const [editFields, setEditFields] = useState({ customer_name: "", phone: "", address: "", district: "", additional_notes: "" });

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, service_packages(name), available_time_slots(slot_label)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    refetchInterval: 15_000,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      const update: any = { status };
      if (note !== undefined) update.admin_note = note;
      const { error } = await supabase.from("bookings").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast.success("বুকিং আপডেট হয়েছে");
    },
    onError: () => toast.error("আপডেট করতে সমস্যা হয়েছে"),
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, fields }: { id: string; fields: typeof editFields }) => {
      const { error } = await supabase.from("bookings").update({
        customer_name: fields.customer_name,
        phone: fields.phone,
        address: fields.address,
        district: fields.district || null,
        additional_notes: fields.additional_notes || null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast.success("গ্রাহকের তথ্য আপডেট হয়েছে");
      setEditing(false);
    },
    onError: () => toast.error("আপডেট করতে সমস্যা হয়েছে"),
  });

  const filtered = bookings?.filter((b) => {
    const matchesSearch =
      !search ||
      b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      b.phone.includes(search) ||
      b.booking_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openDetail = (booking: any) => {
    setSelectedBooking(booking);
    setAdminNote(booking.admin_note || "");
    setEditing(false);
    setEditFields({
      customer_name: booking.customer_name,
      phone: booking.phone,
      address: booking.address,
      district: booking.district || "",
      additional_notes: booking.additional_notes || "",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-[Poppins]">বুকিং ম্যানেজমেন্ট</h1>
        <p className="text-sm text-muted-foreground">সকল বুকিং দেখুন, এডিট করুন ও ম্যানেজ করুন</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="নাম, ফোন বা বুকিং নম্বর দিয়ে খুঁজুন..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 rounded-xl" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 h-11 rounded-xl"><SelectValue placeholder="স্ট্যাটাস ফিল্টার" /></SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">সকল স্ট্যাটাস</SelectItem>
            {STATUSES.map((s) => (<SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>বুকিং নম্বর</TableHead>
                  <TableHead>গ্রাহক</TableHead>
                  <TableHead>ফোন</TableHead>
                  <TableHead>প্যাকেজ</TableHead>
                  <TableHead>তারিখ</TableHead>
                  <TableHead>সময়</TableHead>
                  <TableHead>মোট</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">কোনো বুকিং পাওয়া যায়নি</TableCell></TableRow>
                )}
                {filtered?.map((b) => (
                  <TableRow key={b.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">{b.booking_number}</TableCell>
                    <TableCell className="font-medium">{b.customer_name}</TableCell>
                    <TableCell>{b.phone}</TableCell>
                    <TableCell>{(b as any).service_packages?.name ?? "—"}</TableCell>
                    <TableCell>{b.preferred_date}</TableCell>
                    <TableCell>{(b as any).available_time_slots?.slot_label ?? "—"}</TableCell>
                    <TableCell className="font-semibold">৳{Number(b.grand_total)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${statusColors[b.status]}`}>{statusLabels[b.status] || b.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => openDetail(b)}><Eye className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={(o) => !o && setSelectedBooking(null)}>
        <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-[Poppins] flex items-center gap-2">
              বুকিং বিবরণ
              <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)} className="ml-auto">
                <Edit className="h-4 w-4 mr-1" /> {editing ? "বাতিল" : "এডিট"}
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              {editing ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">গ্রাহকের নাম</Label>
                    <Input value={editFields.customer_name} onChange={(e) => setEditFields({ ...editFields, customer_name: e.target.value })} className="rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">ফোন</Label>
                    <Input value={editFields.phone} onChange={(e) => setEditFields({ ...editFields, phone: e.target.value })} className="rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">ঠিকানা</Label>
                    <Textarea value={editFields.address} onChange={(e) => setEditFields({ ...editFields, address: e.target.value })} rows={2} className="rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">এলাকা/জেলা</Label>
                    <Input value={editFields.district} onChange={(e) => setEditFields({ ...editFields, district: e.target.value })} className="rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">গ্রাহকের নোট</Label>
                    <Textarea value={editFields.additional_notes} onChange={(e) => setEditFields({ ...editFields, additional_notes: e.target.value })} rows={2} className="rounded-xl" />
                  </div>
                  <Button onClick={() => editMutation.mutate({ id: selectedBooking.id, fields: editFields })} disabled={editMutation.isPending} className="rounded-xl">
                    {editMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                    সেভ করুন
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">বুকিং নম্বর</span>
                    <p className="font-mono font-semibold">{selectedBooking.booking_number}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">গ্রাহকের নাম</span>
                    <p className="font-semibold">{selectedBooking.customer_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ফোন</span>
                    <p className="font-semibold">{selectedBooking.phone}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">তারিখ ও সময়</span>
                    <p className="font-semibold">{selectedBooking.preferred_date} — {(selectedBooking as any).available_time_slots?.slot_label}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">ঠিকানা</span>
                    <p className="font-semibold">{selectedBooking.address}</p>
                  </div>
                  {selectedBooking.district && (
                    <div>
                      <span className="text-muted-foreground">এলাকা</span>
                      <p className="font-semibold">{selectedBooking.district}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">মোট মূল্য</span>
                    <p className="font-bold text-primary text-lg">৳{Number(selectedBooking.grand_total)}</p>
                  </div>
                  {selectedBooking.additional_notes && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">গ্রাহকের নোট</span>
                      <p className="text-sm bg-muted rounded-xl p-3">{selectedBooking.additional_notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Status Update */}
              <div className="space-y-2">
                <Label>স্ট্যাটাস পরিবর্তন</Label>
                <Select value={selectedBooking.status} onValueChange={(val) => {
                  updateStatus.mutate({ id: selectedBooking.id, status: val, note: adminNote || undefined });
                  setSelectedBooking({ ...selectedBooking, status: val });
                }}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {STATUSES.map((s) => (<SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              {/* Admin Note */}
              <div className="space-y-2">
                <Label>অ্যাডমিন নোট (অভ্যন্তরীণ)</Label>
                <Textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="অভ্যন্তরীণ নোট লিখুন..." rows={2} className="rounded-xl" />
                <Button size="sm" onClick={() => updateStatus.mutate({ id: selectedBooking.id, status: selectedBooking.status, note: adminNote })} disabled={updateStatus.isPending}>
                  নোট সেভ করুন
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
