import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrackRequest {
  event_name: string;
  event_time?: number;
  user_agent?: string;
  source_url?: string;
  custom_data?: Record<string, any>;
  // For deduplication
  event_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get marketing settings
    const { data: settings } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["meta_pixel_id", "meta_access_token", "meta_test_code", "conversion_api_enabled", "ga4_measurement_id"]);

    const config: Record<string, string> = {};
    settings?.forEach((s: any) => { config[s.key] = s.value; });

    const body: TrackRequest = await req.json();
    const eventTime = body.event_time || Math.floor(Date.now() / 1000);
    const eventId = body.event_id || crypto.randomUUID();
    const userAgent = body.user_agent || req.headers.get("user-agent") || "";
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || "";

    const results: Record<string, any> = {};

    // ─── Meta Conversion API ───
    if (config.conversion_api_enabled === "true" && config.meta_pixel_id && config.meta_access_token) {
      const pixelId = config.meta_pixel_id;
      const accessToken = config.meta_access_token;
      const testCode = config.meta_test_code;

      const eventData: any = {
        event_name: body.event_name,
        event_time: eventTime,
        event_id: eventId,
        action_source: "website",
        event_source_url: body.source_url || "",
        user_data: {
          client_user_agent: userAgent,
          client_ip_address: clientIp,
        },
      };

      if (body.custom_data) {
        eventData.custom_data = body.custom_data;
      }

      const payload: any = { data: [eventData] };
      if (testCode) {
        payload.test_event_code = testCode;
      }

      const metaResponse = await fetch(
        `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const metaResult = await metaResponse.json();
      results.meta_capi = { status: metaResponse.status, data: metaResult };
    }

    // ─── GA4 Measurement Protocol ───
    if (config.ga4_measurement_id) {
      const measurementId = config.ga4_measurement_id;
      // GA4 Measurement Protocol requires an API secret - stored in secrets
      const ga4Secret = Deno.env.get("GA4_API_SECRET");
      
      if (ga4Secret) {
        const ga4Payload = {
          client_id: eventId,
          events: [
            {
              name: mapToGA4Event(body.event_name),
              params: {
                ...body.custom_data,
                engagement_time_msec: "100",
              },
            },
          ],
        };

        const ga4Response = await fetch(
          `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${ga4Secret}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ga4Payload),
          }
        );

        await ga4Response.text();
        results.ga4 = { status: ga4Response.status };
      }
    }

    return new Response(JSON.stringify({ success: true, event_id: eventId, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Track event error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function mapToGA4Event(metaEvent: string): string {
  const map: Record<string, string> = {
    PageView: "page_view",
    ViewContent: "view_item",
    AddToCart: "add_to_cart",
    InitiateCheckout: "begin_checkout",
    Purchase: "purchase",
    Lead: "generate_lead",
    Contact: "contact",
    Schedule: "schedule",
  };
  return map[metaEvent] || metaEvent.toLowerCase();
}
