// supabase/functions/_shared/validation.ts

// Lightweight validation (no external deps — Zod is heavy for Deno Edge)
export type ValidationRule = {
  field: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: string[];
};

export function validate(
  data: Record<string, unknown>,
  rules: ValidationRule[],
): string[] {
  const errors: string[] = [];

  for (const rule of rules) {
    const value = data[rule.field];

    if (value === undefined || value === null || value === "") {
      if (rule.required) errors.push(`${rule.field} is required`);
      continue;
    }

    if (rule.type === "string" && typeof value !== "string") {
      errors.push(`${rule.field} must be a string`);
      continue;
    }
    if (rule.type === "number" && typeof value !== "number") {
      errors.push(`${rule.field} must be a number`);
      continue;
    }

    if (typeof value === "string") {
      if (rule.minLength && value.length < rule.minLength)
        errors.push(
          `${rule.field} must be at least ${rule.minLength} characters`,
        );
      if (rule.maxLength && value.length > rule.maxLength)
        errors.push(
          `${rule.field} must be at most ${rule.maxLength} characters`,
        );
      if (rule.pattern && !rule.pattern.test(value))
        errors.push(`${rule.field} has invalid format`);
      if (rule.enum && !rule.enum.includes(value))
        errors.push(`${rule.field} must be one of: ${rule.enum.join(", ")}`);
    }

    if (typeof value === "number") {
      if (rule.min !== undefined && value < rule.min)
        errors.push(`${rule.field} must be at least ${rule.min}`);
      if (rule.max !== undefined && value > rule.max)
        errors.push(`${rule.field} must be at most ${rule.max}`);
    }
  }

  return errors;
}

// Phone number normalization
export function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");
  if (!cleaned.startsWith("+")) {
    // Default to Nigeria if no country code
    if (cleaned.startsWith("0")) cleaned = "+234" + cleaned.slice(1);
    else cleaned = "+" + cleaned;
  }
  return cleaned;
}

export function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(phone);
}
