import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface PackageForm {
  name: string;
  description: string;
  base_price_bdt: string;
  package_type: string;
  is_active: boolean;
  sort_order: string;
}

const emptyForm: PackageForm = { name: "", description: "", base_price_bdt: "", package_type: "standard", is_active: true, sort_order: "0" };

export default function PackageManagement() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<PackageForm>(emptyForm);

  const { data: packages, isLoading } = useQuery({
    queryKey: ["admin-packages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_packages").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        description: form.description || null,
        base_price_bdt: Number(form.base_price_bdt),
        package_type: form.package_type,
        is_active: form.is_active,
        sort_order: Number(form.sort_order),
      };
      if (editId) {
        const { error } = await supabase.from("service_packages").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("service_packages").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-packages"] });
      toast.success(editId ? "প্যাকেজ আপডেট হয়েছে" : "নতুন প্যাকেজ যোগ হয়েছে");
      closeDialog();
    },
    onError: () => toast.error("সমস্যা হয়েছে"),
  });

  const deletePkg = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("service_packages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-packages"] });
      toast.success("প্যাকেজ মুছে ফেলা হয়েছে");
    },
    onError: () => toast.error("মুছতে সমস্যা হয়েছে — বুকিংয়ে ব্যবহৃত হচ্ছে কিনা দেখুন"),
  });

  const openCreate = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p: any) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      description: p.description || "",
      base_price_bdt: String(p.base_price_bdt),
      package_type: p.package_type,
      is_active: p.is_active,
      sort_order: String(p.sort_order),
    });
    setDialogOpen(true);
  };
  const closeDialog = () => { setDialogOpen(false); setEditId(null); setForm(emptyForm); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-[Poppins]">সার্ভিস প্যাকেজসমূহ</h1>
          <p className="text-sm text-muted-foreground">প্যাকেজ যোগ, সম্পাদনা বা মুছুন</p>
        </div>
        <Button onClick={openCreate} className="rounded-xl"><Plus className="h-4 w-4 mr-1" /> নতুন প্যাকেজ</Button>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>নাম</TableHead>
                <TableHead>মূল্য</TableHead>
                <TableHead>ক্রম</TableHead>
                <TableHead>সক্রিয়</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages?.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>৳{Number(p.base_price_bdt)}</TableCell>
                  <TableCell>{p.sort_order}</TableCell>
                  <TableCell>{p.is_active ? "✅" : "❌"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm("মুছে ফেলতে চান?")) deletePkg.mutate(p.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
          <DialogHeader><DialogTitle>{editId ? "প্যাকেজ সম্পাদনা" : "নতুন প্যাকেজ"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); upsert.mutate(); }} className="space-y-4">
            <div className="space-y-2"><Label>নাম</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-xl" /></div>
            <div className="space-y-2"><Label>বিবরণ</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl" rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>মূল্য (৳)</Label><Input type="number" value={form.base_price_bdt} onChange={(e) => setForm({ ...form, base_price_bdt: e.target.value })} required className="rounded-xl" /></div>
              <div className="space-y-2"><Label>ক্রম</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="rounded-xl" /></div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>সক্রিয়</Label>
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={upsert.isPending}>
              {upsert.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editId ? "আপডেট করুন" : "যোগ করুন"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
