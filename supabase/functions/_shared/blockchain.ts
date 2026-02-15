// supabase/functions/_shared/blockchain.ts
// Tempo blockchain helpers for USDC/TIP-20 operations
// Chain ID: 42431, RPC: https://rpc.moderato.tempo.xyz

const TEMPO_RPC = Deno.env.get("TEMPO_RPC_URL") || "https://rpc.moderato.tempo.xyz";
const PATHUSD_ADDRESS = "0x20c0000000000000000000000000000000000000";

export interface TransferParams {
  from: string;
  to: string;
  amount: bigint;
  memo?: string;
}

export async function getOnChainBalance(walletAddress: string): Promise<bigint> {
  const response = await fetch(TEMPO_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_call",
      params: [{
        to: PATHUSD_ADDRESS,
        data: `0x70a08231000000000000000000000000${walletAddress.slice(2).padStart(64, "0")}`,
      }, "latest"],
      id: 1,
    }),
  });
  const result = await response.json();
  return BigInt(result.result || "0");
}

export async function getTransactionReceipt(txHash: string) {
  const response = await fetch(TEMPO_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_getTransactionReceipt",
      params: [txHash],
      id: 1,
    }),
  });
  const result = await response.json();
  return result.result;
}

export function encodeTransferMemo(memo: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(memo.slice(0, 32));
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
  return "0x" + hex.padEnd(64, "0");
}

export const TEMPO_CHAIN = {
  id: 42431,
  name: "Tempo Moderato",
  rpc: TEMPO_RPC,
  explorer: "https://explore.tempo.xyz",
  pathUSD: PATHUSD_ADDRESS,
};
