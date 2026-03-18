import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Trash2, Loader2, ShieldCheck, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function AdminManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const { data: admins, isLoading } = useQuery({
    queryKey: ["admin-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("admins").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const createAdmin = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("create-admin", {
        body: { email, password, name },
      });
      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);
      return res.data;
    },
    onSuccess: () => {
      toast({ title: "সফল!", description: "নতুন অ্যাডমিন তৈরি হয়েছে।" });
      queryClient.invalidateQueries({ queryKey: ["admin-list"] });
      setOpen(false);
      setEmail("");
      setPassword("");
      setName("");
    },
    onError: (err: Error) => {
      toast({ title: "ত্রুটি", description: err.message, variant: "destructive" });
    },
  });

  const deleteAdmin = useMutation({
    mutationFn: async ({ adminId, userId }: { adminId: string; userId: string }) => {
      const res = await supabase.functions.invoke("delete-admin", {
        body: { admin_id: adminId, user_id: userId },
      });
      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);
      return res.data;
    },
    onSuccess: () => {
      toast({ title: "সফল!", description: "অ্যাডমিন মুছে ফেলা হয়েছে।" });
      queryClient.invalidateQueries({ queryKey: ["admin-list"] });
    },
    onError: (err: Error) => {
      toast({ title: "ত্রুটি", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-[Poppins] flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            অ্যাডমিন ম্যানেজমেন্ট
          </h1>
          <p className="text-sm text-muted-foreground">অ্যাডমিন অ্যাকাউন্ট তৈরি ও পরিচালনা করুন</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="cta" className="rounded-xl">
              <UserPlus className="h-4 w-4 mr-2" />
              নতুন অ্যাডমিন
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                নতুন অ্যাডমিন তৈরি করুন
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>নাম</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="অ্যাডমিনের নাম"
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>ইমেইল</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>পাসওয়ার্ড</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  className="h-11 rounded-xl"
                />
              </div>
              <Button
                variant="cta"
                className="w-full rounded-xl h-11"
                onClick={() => createAdmin.mutate()}
                disabled={createAdmin.isPending || !email || !password || !name}
              >
                {createAdmin.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "অ্যাডমিন তৈরি করুন"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">সকল অ্যাডমিন</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>নাম</TableHead>
                  <TableHead>ইমেইল</TableHead>
                  <TableHead>তৈরির তারিখ</TableHead>
                  <TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins?.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{new Date(admin.created_at).toLocaleDateString("bn-BD")}</TableCell>
                    <TableCell className="text-right">
                      {admin.user_id === user?.id ? (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">আপনি</span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => deleteAdmin.mutate({ adminId: admin.id, userId: admin.user_id })}
                          disabled={deleteAdmin.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
