// supabase/functions/_shared/errors.ts

export class AppError extends Error {
  status: number;
  code: string;

  constructor(
    message: string,
    status: number = 400,
    code: string = "BAD_REQUEST",
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

export function errorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    return new Response(
      JSON.stringify({ error: error.message, code: error.code }),
      { status: error.status, headers: { "Content-Type": "application/json" } },
    );
  }

  if (error instanceof Error && error.name === "AuthError") {
    return new Response(
      JSON.stringify({ error: error.message, code: "UNAUTHORIZED" }),
      {
        status: (error as any).status || 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  console.error("Unhandled error:", error);
  return new Response(
    JSON.stringify({ error: "Internal server error", code: "INTERNAL_ERROR" }),
    { status: 500, headers: { "Content-Type": "application/json" } },
  );
}

export function successResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
