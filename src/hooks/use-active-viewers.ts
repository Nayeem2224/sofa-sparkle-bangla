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

    // Read active viewer count via secure aggregate RPC
    const fetchCount = async () => {
      const { data: c } = await supabase.rpc("get_active_viewer_count" as any);
      if (typeof c === "number" && c > 0) {
        setCount(c);
      }
    };

    heartbeat().then(fetchCount);
    const interval = setInterval(() => {
      heartbeat().then(fetchCount);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return count;
}
