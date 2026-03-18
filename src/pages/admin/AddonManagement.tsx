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

interface AddonForm {
  name: string;
  unit_label: string;
  price_per_unit_bdt: string;
  is_active: boolean;
  sort_order: string;
}

const emptyForm: AddonForm = { name: "", unit_label: "unit", price_per_unit_bdt: "", is_active: true, sort_order: "0" };

export default function AddonManagement() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<AddonForm>(emptyForm);

  const { data: addons, isLoading } = useQuery({
    queryKey: ["admin-addons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("booking_add_ons").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        unit_label: form.unit_label,
        price_per_unit_bdt: Number(form.price_per_unit_bdt),
        is_active: form.is_active,
        sort_order: Number(form.sort_order),
      };
      if (editId) {
        const { error } = await supabase.from("booking_add_ons").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("booking_add_ons").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-addons"] });
      toast.success(editId ? "আপডেট হয়েছে" : "নতুন অ্যাড-অন যোগ হয়েছে");
      closeDialog();
    },
    onError: () => toast.error("সমস্যা হয়েছে"),
  });

  const deleteAddon = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("booking_add_ons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-addons"] });
      toast.success("মুছে ফেলা হয়েছে");
    },
    onError: () => toast.error("মুছতে সমস্যা হয়েছে"),
  });

  const openCreate = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (a: any) => {
    setEditId(a.id);
    setForm({ name: a.name, unit_label: a.unit_label, price_per_unit_bdt: String(a.price_per_unit_bdt), is_active: a.is_active, sort_order: String(a.sort_order) });
    setDialogOpen(true);
  };
  const closeDialog = () => { setDialogOpen(false); setEditId(null); setForm(emptyForm); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-[Poppins]">অ্যাড-অনসমূহ</h1>
          <p className="text-sm text-muted-foreground">অতিরিক্ত সেবা ম্যানেজ করুন</p>
        </div>
        <Button onClick={openCreate} className="rounded-xl"><Plus className="h-4 w-4 mr-1" /> নতুন অ্যাড-অন</Button>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>নাম</TableHead>
                <TableHead>ইউনিট</TableHead>
                <TableHead>মূল্য/ইউনিট</TableHead>
                <TableHead>ক্রম</TableHead>
                <TableHead>সক্রিয়</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addons?.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell>{a.unit_label}</TableCell>
                  <TableCell>৳{Number(a.price_per_unit_bdt)}</TableCell>
                  <TableCell>{a.sort_order}</TableCell>
                  <TableCell>{a.is_active ? "✅" : "❌"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm("মুছে ফেলতে চান?")) deleteAddon.mutate(a.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
          <DialogHeader><DialogTitle>{editId ? "অ্যাড-অন সম্পাদনা" : "নতুন অ্যাড-অন"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); upsert.mutate(); }} className="space-y-4">
            <div className="space-y-2"><Label>নাম</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-xl" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>ইউনিট লেবেল</Label><Input value={form.unit_label} onChange={(e) => setForm({ ...form, unit_label: e.target.value })} className="rounded-xl" /></div>
              <div className="space-y-2"><Label>মূল্য/ইউনিট (৳)</Label><Input type="number" value={form.price_per_unit_bdt} onChange={(e) => setForm({ ...form, price_per_unit_bdt: e.target.value })} required className="rounded-xl" /></div>
            </div>
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
