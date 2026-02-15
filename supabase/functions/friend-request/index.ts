// supabase/functions/friend-request/index.ts
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

    const auth = await verifyAuth(req);
    const supabase = getSupabaseAdmin();
    const user = await getUserByPrivyDid(supabase, auth.privyDid);

    const body = await req.json();
    const { addressee_id, action } = body;

    if (!addressee_id || typeof addressee_id !== "string") {
      throw new AppError("addressee_id is required", 422, "VALIDATION_ERROR");
    }

    const validActions = ["send", "accept", "decline", "block", "unfriend"];
    if (!action || !validActions.includes(action)) {
      throw new AppError(
        `action must be one of: ${validActions.join(", ")}`,
        422,
        "VALIDATION_ERROR",
      );
    }

    let friendship: Record<string, unknown> | null = null;

    switch (action) {
      case "send": {
        // Cannot send to yourself
        if (addressee_id === user.id) {
          throw new AppError(
            "Cannot send a friend request to yourself",
            400,
            "SELF_REQUEST",
          );
        }

        // Check addressee exists
        const { data: addressee, error: addrErr } = await supabase
          .from("users")
          .select("id, username, full_name, privacy_who_can_add")
          .eq("id", addressee_id)
          .single();

        if (addrErr || !addressee) {
          throw new AppError("User not found", 404, "USER_NOT_FOUND");
        }

        // Check addressee's privacy_who_can_add setting
        if (addressee.privacy_who_can_add === "friends") {
          // Only existing friends can add -- but they would already be friends, so block
          throw new AppError(
            "This user only accepts friend requests from existing friends",
            403,
            "PRIVACY_RESTRICTED",
          );
        }

        if (addressee.privacy_who_can_add === "contacts") {
          // Only synced contacts can add
          const { data: contactMatch } = await supabase
            .from("contact_syncs")
            .select("id")
            .eq("user_id", addressee_id)
            .eq("matched_user_id", user.id)
            .limit(1)
            .maybeSingle();

          if (!contactMatch) {
            throw new AppError(
              "This user only accepts friend requests from their contacts",
              403,
              "PRIVACY_RESTRICTED",
            );
          }
        }

        // Check no existing friendship in either direction
        const { data: existing } = await supabase
          .from("friendships")
          .select("id, status, requester_id, addressee_id")
          .or(
            `and(requester_id.eq.${user.id},addressee_id.eq.${addressee_id}),and(requester_id.eq.${addressee_id},addressee_id.eq.${user.id})`,
          )
          .limit(1)
          .maybeSingle();

        if (existing) {
          if (existing.status === "accepted") {
            throw new AppError(
              "You are already friends with this user",
              409,
              "ALREADY_FRIENDS",
            );
          }
          if (existing.status === "pending") {
            throw new AppError(
              "A friend request already exists between you and this user",
              409,
              "REQUEST_EXISTS",
            );
          }
          if (existing.status === "blocked") {
            throw new AppError(
              "Cannot send friend request",
              403,
              "BLOCKED",
            );
          }
          // If declined, allow re-sending by deleting old record first
          if (existing.status === "declined") {
            await supabase
              .from("friendships")
              .delete()
              .eq("id", existing.id);
          }
        }

        // Create friendship record
        const { data: newFriendship, error: createErr } = await supabase
          .from("friendships")
          .insert({
            requester_id: user.id,
            addressee_id,
            status: "pending",
          })
          .select()
          .single();

        if (createErr) throw createErr;
        friendship = newFriendship;

        // Notify addressee
        const senderName = user.username ? `@${user.username}` : user.phone;
        await supabase.from("notifications").insert({
          user_id: addressee_id,
          type: "friend_request",
          title: "Friend Request",
          body: `${senderName} sent you a friend request`,
          data: {
            friendship_id: newFriendship.id,
            requester_id: user.id,
          },
        });

        break;
      }

      case "accept": {
        // Find pending request where current user is the addressee
        const { data: pending, error: pendErr } = await supabase
          .from("friendships")
          .select("*")
          .eq("addressee_id", user.id)
          .eq("requester_id", addressee_id)
          .eq("status", "pending")
          .single();

        if (pendErr || !pending) {
          throw new AppError(
            "No pending friend request found",
            404,
            "NOT_FOUND",
          );
        }

        const { data: accepted, error: acceptErr } = await supabase
          .from("friendships")
          .update({
            status: "accepted",
            updated_at: new Date().toISOString(),
          })
          .eq("id", pending.id)
          .select()
          .single();

        if (acceptErr) throw acceptErr;
        friendship = accepted;

        // Notify the original requester
        const acceptorName = user.username ? `@${user.username}` : user.phone;
        await supabase.from("notifications").insert({
          user_id: addressee_id, // the original requester
          type: "friend_accepted",
          title: "Friend Request Accepted",
          body: `${acceptorName} accepted your friend request`,
          data: {
            friendship_id: pending.id,
            friend_id: user.id,
          },
        });

        break;
      }

      case "decline": {
        // Find pending request where current user is the addressee
        const { data: pendingDecline, error: decErr } = await supabase
          .from("friendships")
          .select("*")
          .eq("addressee_id", user.id)
          .eq("requester_id", addressee_id)
          .eq("status", "pending")
          .single();

        if (decErr || !pendingDecline) {
          throw new AppError(
            "No pending friend request found",
            404,
            "NOT_FOUND",
          );
        }

        const { data: declined, error: declErr } = await supabase
          .from("friendships")
          .update({
            status: "declined",
            updated_at: new Date().toISOString(),
          })
          .eq("id", pendingDecline.id)
          .select()
          .single();

        if (declErr) throw declErr;
        friendship = declined;

        break;
      }

      case "block": {
        if (addressee_id === user.id) {
          throw new AppError("Cannot block yourself", 400, "SELF_BLOCK");
        }

        // Upsert: if a friendship exists in either direction, update to blocked;
        // otherwise create a new blocked record
        const { data: existingBlock } = await supabase
          .from("friendships")
          .select("id, requester_id, addressee_id")
          .or(
            `and(requester_id.eq.${user.id},addressee_id.eq.${addressee_id}),and(requester_id.eq.${addressee_id},addressee_id.eq.${user.id})`,
          )
          .limit(1)
          .maybeSingle();

        if (existingBlock) {
          const { data: blocked, error: blockErr } = await supabase
            .from("friendships")
            .update({
              status: "blocked",
              requester_id: user.id,
              addressee_id,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingBlock.id)
            .select()
            .single();

          if (blockErr) throw blockErr;
          friendship = blocked;
        } else {
          const { data: newBlock, error: newBlockErr } = await supabase
            .from("friendships")
            .insert({
              requester_id: user.id,
              addressee_id,
              status: "blocked",
            })
            .select()
            .single();

          if (newBlockErr) throw newBlockErr;
          friendship = newBlock;
        }

        break;
      }

      case "unfriend": {
        // Delete friendship record in either direction
        const { data: deleted, error: delErr } = await supabase
          .from("friendships")
          .delete()
          .or(
            `and(requester_id.eq.${user.id},addressee_id.eq.${addressee_id}),and(requester_id.eq.${addressee_id},addressee_id.eq.${user.id})`,
          )
          .select()
          .maybeSingle();

        if (delErr) throw delErr;

        if (!deleted) {
          throw new AppError(
            "No friendship found to remove",
            404,
            "NOT_FOUND",
          );
        }

        friendship = deleted;
        break;
      }
    }

    return successResponse({ success: true, friendship });
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
