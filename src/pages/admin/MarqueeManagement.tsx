import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Megaphone, Sparkles, Flame, Star, Zap } from "lucide-react";

const iconOptions = [
  { value: "sparkles", label: "✨ Sparkles", Icon: Sparkles },
  { value: "flame", label: "🔥 Flame", Icon: Flame },
  { value: "star", label: "⭐ Star", Icon: Star },
  { value: "zap", label: "⚡ Zap", Icon: Zap },
];

export default function MarqueeManagement() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ text: "", icon: "sparkles", is_active: true, sort_order: 0 });

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-marquee"],
    queryFn: async () => {
      const { data, error } = await supabase.from("marquee_items" as any).select("*").order("sort_order");
      if (error) throw error;
      return data as any[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from("marquee_items" as any).update(form as any).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("marquee_items" as any).insert(form as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-marquee"] });
      qc.invalidateQueries({ queryKey: ["marquee-items"] });
      toast.success(editing ? "আপডেট হয়েছে" : "যোগ হয়েছে");
      resetForm();
    },
    onError: () => toast.error("সমস্যা হয়েছে"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("marquee_items" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-marquee"] });
      qc.invalidateQueries({ queryKey: ["marquee-items"] });
      toast.success("মুছে ফেলা হয়েছে");
    },
  });

  const resetForm = () => {
    setOpen(false);
    setEditing(null);
    setForm({ text: "", icon: "sparkles", is_active: true, sort_order: 0 });
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ text: item.text, icon: item.icon, is_active: item.is_active, sort_order: item.sort_order });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-[Poppins] flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" /> মার্কি ব্যানার
          </h1>
          <p className="text-sm text-muted-foreground">উপরের স্ক্রলিং ব্যানার ম্যানেজ করুন</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl"><Plus className="h-4 w-4 mr-1" /> নতুন আইটেম</Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>{editing ? "এডিট করুন" : "নতুন আইটেম"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>টেক্সট</Label>
                <Input value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>আইকন</Label>
                  <Select value={form.icon} onValueChange={(v) => setForm({ ...form, icon: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>ক্রম</Label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>সক্রিয়</Label>
                <div className="pt-1"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /></div>
              </div>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full rounded-xl">
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "আপডেট" : "যোগ করুন"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ক্রম</TableHead>
                <TableHead>আইকন</TableHead>
                <TableHead>টেক্সট</TableHead>
                <TableHead>সক্রিয়</TableHead>
                <TableHead className="w-24">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items?.map((item: any) => {
                const IconComp = iconOptions.find((o) => o.value === item.icon)?.Icon || Sparkles;
                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.sort_order}</TableCell>
                    <TableCell><IconComp className="h-4 w-4 text-primary" /></TableCell>
                    <TableCell className="font-medium max-w-[300px] truncate">{item.text}</TableCell>
                    <TableCell>{item.is_active ? "✅" : "❌"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
