import { join } from "path";

export function monorepoRoot(): string {
  return join(__dirname, "..", "..", "..");
}

export function userProtoPath(): string {
  return join(monorepoRoot(), "packages", "proto", "proto", "user.proto");
}

export function walletProtoPath(): string {
  return join(monorepoRoot(), "packages", "proto", "proto", "wallet.proto");
}
