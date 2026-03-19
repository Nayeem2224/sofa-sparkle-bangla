import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, Video } from "lucide-react";
import { toast } from "sonner";

interface VideoItem {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
}

export default function VideoManagement() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", video_url: "", description: "", thumbnail_url: "" });

  const { data: videos, isLoading } = useQuery({
    queryKey: ["admin-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("showcase_videos" as any)
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as VideoItem[];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (video: Partial<VideoItem>) => {
      if (editingId) {
        const { error } = await supabase.from("showcase_videos" as any).update(video).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("showcase_videos" as any).insert(video);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      toast.success(editingId ? "ভিডিও আপডেট হয়েছে" : "ভিডিও যোগ হয়েছে");
      resetForm();
    },
    onError: () => toast.error("কিছু ভুল হয়েছে"),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("showcase_videos" as any).update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-videos"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("showcase_videos" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      toast.success("ভিডিও মুছে ফেলা হয়েছে");
    },
  });

  const resetForm = () => {
    setEditingId(null);
    setForm({ title: "", video_url: "", description: "", thumbnail_url: "" });
  };

  const handleEdit = (v: VideoItem) => {
    setEditingId(v.id);
    setForm({ title: v.title, video_url: v.video_url, description: v.description || "", thumbnail_url: v.thumbnail_url || "" });
  };

  const handleSubmit = () => {
    if (!form.title || !form.video_url) return toast.error("টাইটেল ও ভিডিও URL দিন");
    upsertMutation.mutate({
      title: form.title,
      video_url: form.video_url,
      description: form.description || null,
      thumbnail_url: form.thumbnail_url || null,
      sort_order: editingId ? undefined : (videos?.length || 0) + 1,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Video className="h-6 w-6 text-primary" /> ভিডিও ম্যানেজমেন্ট
        </h1>
      </div>

      {/* Add/Edit form */}
      <Card className="p-5 space-y-4">
        <h3 className="font-semibold">{editingId ? "ভিডিও এডিট করুন" : "নতুন ভিডিও যোগ করুন"}</h3>
        <Input placeholder="ভিডিও টাইটেল" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Input placeholder="YouTube Embed URL (https://www.youtube.com/embed/...)" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} />
        <Textarea placeholder="বর্ণনা (ঐচ্ছিক)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={upsertMutation.isPending}>
            <Plus className="h-4 w-4 mr-1" /> {editingId ? "আপডেট" : "যোগ করুন"}
          </Button>
          {editingId && <Button variant="outline" onClick={resetForm}>বাতিল</Button>}
        </div>
      </Card>

      {/* Video list */}
      <div className="space-y-3">
        {videos?.map((v) => (
          <Card key={v.id} className="p-4 flex items-center gap-4">
            <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{v.title}</p>
              <p className="text-xs text-muted-foreground truncate">{v.video_url}</p>
            </div>
            <Switch checked={v.is_active} onCheckedChange={(checked) => toggleMutation.mutate({ id: v.id, is_active: checked })} />
            <Button variant="outline" size="sm" onClick={() => handleEdit(v)}>এডিট</Button>
            <Button variant="destructive" size="icon" onClick={() => deleteMutation.mutate(v.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
