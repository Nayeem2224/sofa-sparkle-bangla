import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

function getSessionId() {
  let id = sessionStorage.getItem("pv_session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("pv_session", id);
  }
  return id;
}

export function useActiveViewers() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const sessionId = getSessionId();

    // Upsert own session via secure RPC
    const heartbeat = async () => {
      await supabase.rpc("upsert_page_view" as any, { p_session_id: sessionId });
    };

    // Count active viewers (last 3 minutes)
    const fetchCount = async () => {
      const threshold = new Date(Date.now() - 3 * 60 * 1000).toISOString();
      const { count: c } = await supabase
        .from("page_views" as any)
        .select("*", { count: "exact", head: true })
        .gte("last_seen_at", threshold);
      if (c !== null && c > 0) setCount(c);
    };

    heartbeat().then(fetchCount);
    const interval = setInterval(() => {
      heartbeat().then(fetchCount);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return count;
}
