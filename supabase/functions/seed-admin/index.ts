import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-seed-token",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Require a secret token to prevent unauthorized admin creation
    const seedToken = Deno.env.get("SEED_ADMIN_SECRET");
    const providedToken = req.headers.get("x-seed-token");

    if (!seedToken) {
      return new Response(JSON.stringify({ error: "Seed admin function is disabled. Set SEED_ADMIN_SECRET to enable." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (providedToken !== seedToken) {
      return new Response(JSON.stringify({ error: "Forbidden: invalid seed token." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check if any admin exists
    const { data: existingAdmins } = await adminClient.from("admins").select("id").limit(1);
    if (existingAdmins && existingAdmins.length > 0) {
      return new Response(JSON.stringify({ error: "Admin already exists. Use the admin panel to create more." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, password, name } = await req.json();
    if (!email || !password || !name) {
      return new Response(JSON.stringify({ error: "email, password, name required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create auth user
    const { data: newUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert into admins table
    const { error: insertError } = await adminClient.from("admins").insert({
      user_id: newUser.user.id,
      email,
      name,
    });

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "First admin created!" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
