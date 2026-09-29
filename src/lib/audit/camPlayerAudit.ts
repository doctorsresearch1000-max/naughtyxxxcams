type AuditPayload = Record<string, unknown>;

const marks = new Map<string, number>();

export function isCamPlayerAuditEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CAM_PLAYER_AUDIT === "1";
}

export function camPlayerAudit(
  event: string,
  payload?: AuditPayload,
): void {
  if (!isCamPlayerAuditEnabled()) return;
  const line = payload ? { ...payload } : {};
  console.log("[CamPlayer Audit]", event, line);
}

export function camPlayerAuditMark(key: string): void {
  if (!isCamPlayerAuditEnabled()) return;
  marks.set(key, performance.now());
}

export function camPlayerAuditSince(
  key: string,
  event: string,
  extra?: AuditPayload,
): void {
  if (!isCamPlayerAuditEnabled()) return;
  const start = marks.get(key);
  const ms =
    typeof start === "number"
      ? Math.round(performance.now() - start)
      : undefined;
  camPlayerAudit(event, { ...extra, ms });
}
