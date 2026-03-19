import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, HelpCircle } from "lucide-react";

export default function FAQManagement() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ question: "", answer: "", is_active: true, sort_order: 0 });

  const { data: faqs, isLoading } = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("faqs").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from("faqs").update(form as any).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("faqs").insert(form as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-faqs"] });
      toast.success(editing ? "আপডেট হয়েছে" : "যোগ হয়েছে");
      setOpen(false); setEditing(null);
      setForm({ question: "", answer: "", is_active: true, sort_order: 0 });
    },
    onError: () => toast.error("সমস্যা হয়েছে"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faqs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-faqs"] });
      toast.success("মুছে ফেলা হয়েছে");
    },
  });

  const openEdit = (f: any) => {
    setEditing(f);
    setForm({ question: f.question, answer: f.answer, is_active: f.is_active, sort_order: f.sort_order });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-[Poppins] flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" /> FAQ ম্যানেজমেন্ট
          </h1>
          <p className="text-sm text-muted-foreground">সচরাচর জিজ্ঞাসিত প্রশ্ন ম্যানেজ করুন</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setForm({ question: "", answer: "", is_active: true, sort_order: 0 }); } }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl"><Plus className="h-4 w-4 mr-1" /> নতুন প্রশ্ন</Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>{editing ? "প্রশ্ন এডিট" : "নতুন প্রশ্ন"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>প্রশ্ন</Label>
                <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>উত্তর</Label>
                <Textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={3} className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
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

      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ক্রম</TableHead>
                <TableHead>প্রশ্ন</TableHead>
                <TableHead>উত্তর</TableHead>
                <TableHead>সক্রিয়</TableHead>
                <TableHead className="w-24">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faqs?.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{f.sort_order}</TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">{f.question}</TableCell>
                  <TableCell className="max-w-[250px] truncate text-sm text-muted-foreground">{f.answer}</TableCell>
                  <TableCell>{f.is_active ? "✅" : "❌"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(f)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(f.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
