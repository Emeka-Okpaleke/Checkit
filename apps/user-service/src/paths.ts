import { join } from "path";

/** Resolves monorepo root from compiled `dist/` (apps/user-service/dist/...). */
export function monorepoRoot(): string {
  return join(__dirname, "..", "..", "..");
}

export function userProtoPath(): string {
  return join(monorepoRoot(), "packages", "proto", "proto", "user.proto");
}

export function walletProtoPath(): string {
  return join(monorepoRoot(), "packages", "proto", "proto", "wallet.proto");
}
