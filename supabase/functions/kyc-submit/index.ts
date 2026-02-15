// supabase/functions/kyc-submit/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifyAuth } from "../_shared/auth.ts";
import { getSupabaseAdmin, getUserByPrivyDid } from "../_shared/supabase.ts";
import { errorResponse, successResponse, AppError } from "../_shared/errors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    if (req.method !== "POST") {
      throw new AppError("Method not allowed", 405, "METHOD_NOT_ALLOWED");
    }

    // Auth + user lookup
    const auth = await verifyAuth(req);
    const supabase = getSupabaseAdmin();
    const user = await getUserByPrivyDid(supabase, auth.privyDid);

    const body = await req.json();
    const { level, data } = body as {
      level: string;
      data: {
        bvn?: string;
        nin?: string;
        email?: string;
        selfie_url?: string;
      };
    };

    // Validate level
    const validLevels = ["email_verified", "full_kyc"];
    if (!level || !validLevels.includes(level)) {
      throw new AppError(
        `Invalid KYC level. Must be one of: ${validLevels.join(", ")}`,
        400,
        "VALIDATION_ERROR",
      );
    }

    if (!data || typeof data !== "object") {
      throw new AppError(
        "KYC data object is required",
        400,
        "VALIDATION_ERROR",
      );
    }

    let submission = null;
    let kycLevel = user.kyc_level;

    if (level === "email_verified") {
      // --- Email verification flow ---
      if (!data.email || typeof data.email !== "string") {
        throw new AppError("Email is required for email verification", 400, "VALIDATION_ERROR");
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new AppError("Invalid email format", 400, "VALIDATION_ERROR");
      }

      // Check if user already has this level or higher
      if (user.kyc_level === "full_kyc" || user.kyc_level === "enhanced") {
        throw new AppError(
          "KYC level is already at or above email_verified",
          400,
          "KYC_LEVEL_EXISTS",
        );
      }

      // Update user record: set email, email_verified, kyc_level
      const { error: updateError } = await supabase
        .from("users")
        .update({
          email: data.email,
          email_verified: true,
          kyc_level: "email_verified",
        })
        .eq("id", user.id);

      if (updateError) {
        throw new AppError(
          `Failed to update user: ${updateError.message}`,
          500,
          "DB_ERROR",
        );
      }

      // Create a kyc_submissions record for audit trail
      const { data: submissionData, error: subError } = await supabase
        .from("kyc_submissions")
        .insert({
          user_id: user.id,
          level: "email_verified",
          provider: "internal",
          status: "approved",
          data: { email: data.email },
          reviewed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (subError) {
        console.error("Failed to create KYC submission record:", subError);
      }

      submission = submissionData;
      kycLevel = "email_verified";
    } else if (level === "full_kyc") {
      // --- Full KYC flow ---
      // Validate required fields for full KYC
      if (!data.bvn && !data.nin) {
        throw new AppError(
          "BVN or NIN is required for full KYC",
          400,
          "VALIDATION_ERROR",
        );
      }

      // Validate BVN format (11 digits)
      if (data.bvn && !/^\d{11}$/.test(data.bvn)) {
        throw new AppError(
          "BVN must be 11 digits",
          400,
          "VALIDATION_ERROR",
        );
      }

      // Validate NIN format (11 digits)
      if (data.nin && !/^\d{11}$/.test(data.nin)) {
        throw new AppError(
          "NIN must be 11 digits",
          400,
          "VALIDATION_ERROR",
        );
      }

      // Check for existing pending submission
      const { data: existingSubmission } = await supabase
        .from("kyc_submissions")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("level", "full_kyc")
        .eq("status", "pending")
        .limit(1)
        .single();

      if (existingSubmission) {
        throw new AppError(
          "You already have a pending KYC submission. Please wait for it to be reviewed.",
          400,
          "KYC_PENDING",
        );
      }

      // Create KYC submission record with provider='manual' for MVP
      // In production: forward to KYC provider API (e.g., Smile ID, MetaMap)
      const kycData: Record<string, string> = {};
      if (data.bvn) kycData.bvn = data.bvn;
      if (data.nin) kycData.nin = data.nin;
      if (data.selfie_url) kycData.selfie_url = data.selfie_url;

      const { data: submissionData, error: subError } = await supabase
        .from("kyc_submissions")
        .insert({
          user_id: user.id,
          level: "full_kyc",
          provider: "manual",
          provider_reference: null, // Would be set by provider in production
          status: "pending",
          data: kycData,
          submitted_at: new Date().toISOString(),
          expires_at: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 30 days
        })
        .select()
        .single();

      if (subError) {
        throw new AppError(
          `Failed to create KYC submission: ${subError.message}`,
          500,
          "DB_ERROR",
        );
      }

      submission = submissionData;
      kycLevel = user.kyc_level; // Doesn't change until approved

      // TODO: In production, forward to KYC provider here:
      // const providerResult = await submitToKycProvider(kycData);
      // Update submission with provider_reference = providerResult.reference;
    }

    return successResponse({
      submission: submission
        ? {
            id: submission.id,
            level: submission.level,
            status: submission.status,
            submitted_at: submission.submitted_at,
          }
        : null,
      kyc_level: kycLevel,
    });
  } catch (error) {
    return errorResponse(error);
  }
});

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, content-type, x-idempotency-key",
    "Access-Control-Allow-Methods": "POST, GET, PATCH, OPTIONS",
  };
}
