// supabase/functions/_shared/sms.ts

const TERMII_API_KEY = Deno.env.get("TERMII_API_KEY");
const TERMII_SENDER_ID = Deno.env.get("TERMII_SENDER_ID") || "Tanda";
const TWILIO_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_FROM = Deno.env.get("TWILIO_FROM_NUMBER");

export async function sendSMS(
  to: string,
  message: string,
): Promise<{ success: boolean; provider: string; messageId?: string }> {
  // Use Termii for Nigerian numbers, Twilio for international
  const isNigerian = to.startsWith("+234");

  if (isNigerian && TERMII_API_KEY) {
    return sendViaTermii(to, message);
  }
  return sendViaTwilio(to, message);
}

async function sendViaTermii(to: string, message: string) {
  try {
    const res = await fetch("https://api.ng.termii.com/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to,
        from: TERMII_SENDER_ID,
        sms: message,
        type: "plain",
        channel: "generic",
        api_key: TERMII_API_KEY,
      }),
    });
    const data = await res.json();
    return { success: res.ok, provider: "termii", messageId: data.message_id };
  } catch (error) {
    console.error("Termii SMS failed:", error);
    // Fallback to Twilio
    return sendViaTwilio(to, message);
  }
}

async function sendViaTwilio(to: string, message: string) {
  try {
    const auth = btoa(`${TWILIO_SID}:${TWILIO_AUTH}`);
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: to,
          From: TWILIO_FROM!,
          Body: message,
        }),
      },
    );
    const data = await res.json();
    return { success: res.ok, provider: "twilio", messageId: data.sid };
  } catch (error) {
    console.error("Twilio SMS failed:", error);
    return { success: false, provider: "twilio" };
  }
}
