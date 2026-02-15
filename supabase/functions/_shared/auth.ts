// supabase/functions/_shared/auth.ts
import * as jose from "https://deno.land/x/jose@v5.2.0/index.ts";

const PRIVY_APP_ID = Deno.env.get("PRIVY_APP_ID")!;
const PRIVY_VERIFICATION_KEY = Deno.env.get("PRIVY_VERIFICATION_KEY")!;

let cachedPublicKey: jose.KeyLike | null = null;

async function getVerificationKey(): Promise<jose.KeyLike> {
  if (cachedPublicKey) return cachedPublicKey;
  cachedPublicKey = await jose.importSPKI(PRIVY_VERIFICATION_KEY, "ES256");
  return cachedPublicKey;
}

export interface AuthContext {
  privyDid: string; // e.g., "did:privy:xxxxx"
  userId?: string; // our internal UUID (set after DB lookup)
}

/**
 * Verifies the Privy access token from the Authorization header.
 * Returns the decoded auth context or throws.
 */
export async function verifyAuth(req: Request): Promise<AuthContext> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthError("Missing or invalid Authorization header", 401);
  }

  const token = authHeader.slice(7);
  try {
    const verificationKey = await getVerificationKey();
    const { payload } = await jose.jwtVerify(token, verificationKey, {
      issuer: "privy.io",
      audience: PRIVY_APP_ID,
    });

    return {
      privyDid: payload.sub as string,
    };
  } catch (error) {
    throw new AuthError("Invalid or expired access token", 401);
  }
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number = 401) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}
