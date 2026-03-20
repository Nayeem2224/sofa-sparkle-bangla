import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Play, Video } from "lucide-react";
import { useState } from "react";

/**
 * Convert various video URLs to embeddable format:
 * - YouTube: youtube.com/watch?v=ID → youtube.com/embed/ID
 * - YouTube short: youtu.be/ID → youtube.com/embed/ID
 * - Facebook: fb.watch/xxx or facebook.com/...video... → facebook embed
 * - Already embed URLs pass through
 */
function toEmbedUrl(url: string): string {
  if (!url) return url;

  // Already an embed URL
  if (url.includes("/embed")) return url;

  // YouTube watch URL
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Facebook video URL — use Facebook's embedded video player
  if (url.includes("facebook.com") || url.includes("fb.watch") || url.includes("fb.com")) {
    const encoded = encodeURIComponent(url);
    return `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false&width=560`;
  }

  return url;
}

function isYouTube(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function isFacebook(url: string): boolean {
  return url.includes("facebook.com") || url.includes("fb.watch") || url.includes("fb.com") || url.includes("plugins/video.php");
}

export default function VideoShowcase() {
  const { data: videos } = useQuery({
    queryKey: ["showcase-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("showcase_videos" as any)
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as any[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const [activeVideo, setActiveVideo] = useState(0);

  if (!videos || videos.length === 0) return null;

  const current = videos[activeVideo];
  const embedUrl = toEmbedUrl(current.video_url);

  return (
    <section id="video-showcase" className="bg-surface-grey py-16 md:py-24 relative overflow-hidden">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 rounded-full px-4 py-1.5 mb-5">
            <Video className="h-3.5 w-3.5" /> আমাদের কাজ দেখুন
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-foreground leading-tight">
            আমাদের <span className="gradient-text">সার্ভিস ভিডিও</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3">
            দেখুন কিভাবে আমরা প্রফেশনালভাবে ক্লিনিং করি
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Main video player */}
          <div className="relative rounded-3xl overflow-hidden shadow-elevated border border-border/30 bg-foreground/5 aspect-video">
            <iframe
              src={embedUrl}
              title={current.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Video title & description */}
          <div className="mt-5 text-center">
            <h3 className="text-lg sm:text-xl font-bold text-foreground">{current.title}</h3>
            {current.description && (
              <p className="text-sm text-muted-foreground mt-1">{current.description}</p>
            )}
          </div>

          {/* Video selector thumbnails */}
          {videos.length > 1 && (
            <div className="flex justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
              {videos.map((v: any, i: number) => (
                <button
                  key={v.id}
                  onClick={() => setActiveVideo(i)}
                  className={`group relative flex-1 max-w-[200px] rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                    activeVideo === i
                      ? "border-primary shadow-lg scale-105"
                      : "border-border/40 hover:border-primary/40 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <Play className={`h-6 w-6 ${activeVideo === i ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="p-2 bg-card">
                    <p className="text-xs font-semibold text-foreground truncate">{v.title}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
