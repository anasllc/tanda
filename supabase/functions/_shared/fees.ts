// supabase/functions/_shared/fees.ts

// All amounts in USDC smallest units (1 USDC = 1_000_000)
const USDC_UNIT = 1_000_000;

export type FeeType = "send" | "withdrawal" | "bill_payment" | "escrow";

export function calculateFee(amountUsdc: number, feeType: FeeType): number {
  switch (feeType) {
    case "send":
      // 0.5%, min $0.01, max $5
      return Math.max(
        10_000,
        Math.min(5 * USDC_UNIT, Math.floor((amountUsdc * 5) / 1000)),
      );

    case "escrow":
      // Same as send + $0.02 for SMS
      return (
        Math.max(
          10_000,
          Math.min(5 * USDC_UNIT, Math.floor((amountUsdc * 5) / 1000)),
        ) + 20_000
      );

    case "withdrawal":
      // 0.5%, min $0.01, max ~$0.67 (₦1000 equivalent)
      return Math.max(
        10_000,
        Math.min(670_000, Math.floor((amountUsdc * 5) / 1000)),
      );

    case "bill_payment":
      // 1%, min $0.01
      return Math.max(10_000, Math.floor((amountUsdc * 10) / 1000));

    default:
      return 0;
  }
}
