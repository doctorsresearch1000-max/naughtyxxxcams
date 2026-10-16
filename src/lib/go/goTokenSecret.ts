import { createHmac } from "crypto";

export function getGoTokenSecret(): string {
  const explicit = process.env.GO_TOKEN_SECRET?.trim();
  if (explicit) return explicit;

  const crak = process.env.CRAK_TOKEN?.trim() ?? process.env.CRACKREVENUE_TOKEN?.trim();
  if (crak) {
    return createHmac("sha256", "nx-go-token-v1")
      .update(crak)
      .digest("hex");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("GO_TOKEN_SECRET or CRAK_TOKEN is required in production");
  }

  return "dev-insecure-go-token";
}
