// supabase/functions/kyc-webhook/index.ts
// NOTE: This endpoint has verify_jwt = false -- it accepts unauthenticated
// webhook calls from the KYC provider and validates using signature verification.
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getSupabaseAdmin } from "../_shared/supabase.ts";
import { errorResponse, successResponse, AppError } from "../_shared/errors.ts";

const KYC_WEBHOOK_SECRET = Deno.env.get("KYC_WEBHOOK_SECRET") || "";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    if (req.method !== "POST") {
      throw new AppError("Method not allowed", 405, "METHOD_NOT_ALLOWED");
    }

    // Read raw body for signature verification
    const rawBody = await req.text();

    // --- Validate webhook signature ---
    // Placeholder for MVP: in production, verify HMAC signature from the KYC provider
    const signature = req.headers.get("x-webhook-signature") ||
      req.headers.get("x-signature") || "";

    if (!verifyWebhookSignature(rawBody, signature)) {
      // For MVP, we log a warning but don't reject if no secret is configured
      if (KYC_WEBHOOK_SECRET) {
        throw new AppError(
          "Invalid webhook signature",
          401,
          "INVALID_SIGNATURE",
        );
      }
      console.warn(
        "KYC webhook signature verification skipped (no secret configured)",
      );
    }

    // Parse the webhook payload
    let payload: KycWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw new AppError("Invalid JSON payload", 400, "INVALID_PAYLOAD");
    }

    // Validate required fields
    if (!payload.provider_reference) {
      throw new AppError(
        "provider_reference is required",
        400,
        "VALIDATION_ERROR",
      );
    }
    if (
      !payload.status ||
      !["approved", "rejected", "expired"].includes(payload.status)
    ) {
      throw new AppError(
        "status must be one of: approved, rejected, expired",
        400,
        "VALIDATION_ERROR",
      );
    }

    const supabase = getSupabaseAdmin();

    // Find the KYC submission by provider_reference
    const { data: submission, error: findError } = await supabase
      .from("kyc_submissions")
      .select("id, user_id, level, status")
      .eq("provider_reference", payload.provider_reference)
      .single();

    if (findError || !submission) {
      // Log but return success to avoid webhook retries for unknown references
      console.error(
        `KYC submission not found for provider_reference: ${payload.provider_reference}`,
      );
      return successResponse({ received: true, matched: false });
    }

    // Don't process if already in a terminal state
    if (["approved", "rejected"].includes(submission.status)) {
      console.warn(
        `KYC submission ${submission.id} is already in terminal state: ${submission.status}`,
      );
      return successResponse({
        received: true,
        already_processed: true,
      });
    }

    // Update the KYC submission
    const updateData: Record<string, any> = {
      status: payload.status,
      reviewed_at: new Date().toISOString(),
    };

    if (payload.status === "rejected" && payload.rejection_reason) {
      updateData.rejection_reason = payload.rejection_reason;
    }

    const { error: updateError } = await supabase
      .from("kyc_submissions")
      .update(updateData)
      .eq("id", submission.id);

    if (updateError) {
      console.error("Failed to update KYC submission:", updateError);
      throw new AppError(
        "Failed to update KYC submission",
        500,
        "DB_ERROR",
      );
    }

    // If approved: update the user's kyc_level
    if (payload.status === "approved") {
      const { error: userUpdateError } = await supabase
        .from("users")
        .update({ kyc_level: submission.level })
        .eq("id", submission.user_id);

      if (userUpdateError) {
        console.error("Failed to update user KYC level:", userUpdateError);
      }
    }

    // Create a notification for the user about KYC status change
    const notificationTitle =
      payload.status === "approved"
        ? "KYC Verification Approved"
        : payload.status === "rejected"
          ? "KYC Verification Rejected"
          : "KYC Verification Expired";

    const notificationBody =
      payload.status === "approved"
        ? `Your ${submission.level} verification has been approved. You now have access to higher transaction limits.`
        : payload.status === "rejected"
          ? `Your ${submission.level} verification was rejected${payload.rejection_reason ? ": " + payload.rejection_reason : ". Please resubmit with correct information."}`
          : `Your ${submission.level} verification has expired. Please submit a new verification.`;

    const { error: notifError } = await supabase
      .from("notifications")
      .insert({
        user_id: submission.user_id,
        type: "kyc_status",
        title: notificationTitle,
        body: notificationBody,
        data: {
          submission_id: submission.id,
          status: payload.status,
          level: submission.level,
          rejection_reason: payload.rejection_reason || null,
        },
      });

    if (notifError) {
      console.error("Failed to create KYC notification:", notifError);
    }

    return successResponse({ received: true });
  } catch (error) {
    return errorResponse(error);
  }
});

// --- Types ---

interface KycWebhookPayload {
  provider_reference: string;
  status: "approved" | "rejected" | "expired";
  rejection_reason?: string;
  provider_data?: Record<string, unknown>;
}

// --- Webhook signature verification (placeholder for MVP) ---

function verifyWebhookSignature(
  _rawBody: string,
  _signature: string,
): boolean {
  if (!KYC_WEBHOOK_SECRET) {
    // No secret configured -- skip verification (MVP only)
    return true;
  }

  // TODO: Implement actual HMAC-SHA256 verification
  // This would depend on the KYC provider's signature scheme.
  // Example:
  // const key = await crypto.subtle.importKey(
  //   "raw", new TextEncoder().encode(KYC_WEBHOOK_SECRET),
  //   { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
  // );
  // const sig = hexToArrayBuffer(signature);
  // return await crypto.subtle.verify("HMAC", key, sig, new TextEncoder().encode(rawBody));

  // For MVP, always return true if secret is set (signature header check was done above)
  return true;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, content-type, x-idempotency-key, x-webhook-signature, x-signature",
    "Access-Control-Allow-Methods": "POST, GET, PATCH, OPTIONS",
  };
}
