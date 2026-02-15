// supabase/functions/pool-create/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifyAuth } from "../_shared/auth.ts";
import { getSupabaseAdmin, getUserByPrivyDid } from "../_shared/supabase.ts";
import { errorResponse, successResponse, AppError } from "../_shared/errors.ts";
import { validate } from "../_shared/validation.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    const auth = await verifyAuth(req);
    const supabase = getSupabaseAdmin();
    const organizer = await getUserByPrivyDid(supabase, auth.privyDid);
    const body = await req.json();

    const errors = validate(body, [
      { field: "title", type: "string", required: true, minLength: 1, maxLength: 100 },
      { field: "pool_type", type: "string", required: true, enum: ["open", "closed", "recurring"] },
    ]);
    if (errors.length) throw new AppError(errors.join("; "), 422, "VALIDATION_ERROR");

    // Generate share token for open pools
    const shareToken = body.pool_type === "open" ? crypto.randomUUID().slice(0, 8) : null;

    // Create pool
    const { data: pool, error } = await supabase
      .from("pools")
      .insert({
        organizer_id: organizer.id,
        title: body.title,
        description: body.description,
        image_url: body.image_url,
        pool_type: body.pool_type,
        target_amount_usdc: body.target_amount_usdc || null,
        allow_anonymous: body.allow_anonymous || false,
        deadline: body.deadline || null,
        share_token: shareToken,
      })
      .select()
      .single();

    if (error) throw error;

    // Add organizer as first member
    await supabase.from("pool_members").insert({
      pool_id: pool.id,
      user_id: organizer.id,
      role: "organizer",
    });

    // Add invited members
    if (body.members && Array.isArray(body.members)) {
      const memberRecords = body.members.map((m: any) => ({
        pool_id: pool.id,
        user_id: m.user_id || null,
        phone: m.phone || null,
        role: "member",
      }));

      await supabase.from("pool_members").insert(memberRecords);

      // Notify invited members
      for (const m of body.members) {
        if (m.user_id) {
          await supabase.from("notifications").insert({
            user_id: m.user_id,
            type: "pool_invite",
            title: "Pool Invitation",
            body: `${organizer.username ? "@" + organizer.username : organizer.phone} invited you to "${body.title}"`,
            data: { pool_id: pool.id, organizer_id: organizer.id },
          });
        }
      }
    }

    return successResponse({
      pool: {
        ...pool,
        share_url: shareToken ? `https://tanda.app/pool/${shareToken}` : null,
      },
    }, 201);
  } catch (error) {
    return errorResponse(error);
  }
});

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
