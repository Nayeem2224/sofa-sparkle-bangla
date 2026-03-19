import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Star, Filter } from "lucide-react";

const CATEGORIES = [
  { value: "general", label: "সাধারণ" },
  { value: "sofa", label: "সোফা" },
  { value: "carpet", label: "কার্পেট" },
  { value: "mattress", label: "ম্যাট্রেস" },
  { value: "car", label: "গাড়ি" },
  { value: "office", label: "অফিস" },
];

export default function TestimonialManagement() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [filterCat, setFilterCat] = useState("all");
  const [form, setForm] = useState({
    customer_name: "", location: "", review: "", rating: 5,
    is_active: true, sort_order: 0, category: "general",
  });

  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase.from("testimonials").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const filtered = testimonials
    ? filterCat === "all" ? testimonials : testimonials.filter((t: any) => (t as any).category === filterCat)
    : [];

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from("testimonials").update(form as any).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("testimonials").insert(form as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
      toast.success(editing ? "আপডেট হয়েছে" : "যোগ হয়েছে");
      resetForm();
    },
    onError: () => toast.error("সমস্যা হয়েছে"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
      toast.success("মুছে ফেলা হয়েছে");
    },
  });

  const resetForm = () => {
    setOpen(false);
    setEditing(null);
    setForm({ customer_name: "", location: "", review: "", rating: 5, is_active: true, sort_order: 0, category: "general" });
  };

  const openEdit = (t: any) => {
    setEditing(t);
    setForm({
      customer_name: t.customer_name, location: t.location, review: t.review,
      rating: t.rating, is_active: t.is_active, sort_order: t.sort_order,
      category: (t as any).category || "general",
    });
    setOpen(true);
  };

  const getCategoryLabel = (val: string) => CATEGORIES.find(c => c.value === val)?.label || val;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-[Poppins]">টেস্টিমোনিয়াল</h1>
          <p className="text-sm text-muted-foreground">গ্রাহকের রিভিউ ম্যানেজ করুন</p>
        </div>
        <div className="flex gap-2">
          {/* Category filter */}
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-[140px] rounded-xl">
              <Filter className="h-3.5 w-3.5 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সবগুলো</SelectItem>
              {CATEGORIES.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); else setOpen(o); }}>
            <DialogTrigger asChild>
              <Button className="rounded-xl"><Plus className="h-4 w-4 mr-1" /> নতুন রিভিউ</Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>{editing ? "রিভিউ এডিট" : "নতুন রিভিউ"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>গ্রাহকের নাম</Label>
                    <Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>অবস্থান</Label>
                    <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>ক্যাটেগরি</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>রিভিউ</Label>
                  <Textarea value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} rows={3} className="rounded-xl" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>রেটিং</Label>
                    <Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>ক্রম</Label>
                    <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>সক্রিয়</Label>
                    <div className="pt-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /></div>
                  </div>
                </div>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full rounded-xl">
                  {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "আপডেট" : "যোগ করুন"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>নাম</TableHead>
                <TableHead>অবস্থান</TableHead>
                <TableHead>ক্যাটেগরি</TableHead>
                <TableHead>রেটিং</TableHead>
                <TableHead>রিভিউ</TableHead>
                <TableHead>সক্রিয়</TableHead>
                <TableHead className="w-24">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.customer_name}</TableCell>
                  <TableCell>{t.location}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {getCategoryLabel(t.category || "general")}
                    </span>
                  </TableCell>
                  <TableCell><div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-3 w-3 text-accent fill-accent" />)}</div></TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">{t.review}</TableCell>
                  <TableCell>{t.is_active ? "✅" : "❌"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
