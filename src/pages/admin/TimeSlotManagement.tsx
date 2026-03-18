import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface SlotForm {
  slot_label: string;
  slot_time: string;
  is_active: boolean;
  sort_order: string;
}

const emptyForm: SlotForm = { slot_label: "", slot_time: "", is_active: true, sort_order: "0" };

export default function TimeSlotManagement() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<SlotForm>(emptyForm);

  const { data: slots, isLoading } = useQuery({
    queryKey: ["admin-time-slots"],
    queryFn: async () => {
      const { data, error } = await supabase.from("available_time_slots").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      const payload = {
        slot_label: form.slot_label,
        slot_time: form.slot_time,
        is_active: form.is_active,
        sort_order: Number(form.sort_order),
      };
      if (editId) {
        const { error } = await supabase.from("available_time_slots").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("available_time_slots").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-time-slots"] });
      toast.success(editId ? "আপডেট হয়েছে" : "নতুন স্লট যোগ হয়েছে");
      closeDialog();
    },
    onError: () => toast.error("সমস্যা হয়েছে"),
  });

  const deleteSlot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("available_time_slots").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-time-slots"] });
      toast.success("মুছে ফেলা হয়েছে");
    },
    onError: () => toast.error("মুছতে সমস্যা হয়েছে"),
  });

  const openCreate = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (s: any) => {
    setEditId(s.id);
    setForm({ slot_label: s.slot_label, slot_time: s.slot_time, is_active: s.is_active, sort_order: String(s.sort_order) });
    setDialogOpen(true);
  };
  const closeDialog = () => { setDialogOpen(false); setEditId(null); setForm(emptyForm); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-[Poppins]">টাইম স্লট</h1>
          <p className="text-sm text-muted-foreground">বুকিং ফর্মে সময়ের অপশন ম্যানেজ করুন</p>
        </div>
        <Button onClick={openCreate} className="rounded-xl"><Plus className="h-4 w-4 mr-1" /> নতুন স্লট</Button>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>লেবেল</TableHead>
                <TableHead>সময়</TableHead>
                <TableHead>ক্রম</TableHead>
                <TableHead>সক্রিয়</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slots?.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.slot_label}</TableCell>
                  <TableCell>{s.slot_time}</TableCell>
                  <TableCell>{s.sort_order}</TableCell>
                  <TableCell>{s.is_active ? "✅" : "❌"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm("মুছে ফেলতে চান?")) deleteSlot.mutate(s.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>{editId ? "স্লট সম্পাদনা" : "নতুন স্লট"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); upsert.mutate(); }} className="space-y-4">
            <div className="space-y-2"><Label>লেবেল (বাংলা)</Label><Input value={form.slot_label} onChange={(e) => setForm({ ...form, slot_label: e.target.value })} required className="rounded-xl" placeholder="সকাল ৯:০০" /></div>
            <div className="space-y-2"><Label>সময় (24h)</Label><Input type="time" value={form.slot_time} onChange={(e) => setForm({ ...form, slot_time: e.target.value })} required className="rounded-xl" /></div>
            <div className="space-y-2"><Label>ক্রম</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="rounded-xl" /></div>
            <div className="flex items-center gap-3"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>সক্রিয়</Label></div>
            <Button type="submit" className="w-full rounded-xl" disabled={upsert.isPending}>
              {upsert.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editId ? "আপডেট করুন" : "যোগ করুন"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
