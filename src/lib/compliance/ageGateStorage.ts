export const AGE_GATE_STORAGE_KEY = "age_verified";

export const AGE_GATE_ACCEPTED_EVENT = "nx-age-gate-accepted";

export function readAgeGateVerified(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(AGE_GATE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function writeAgeGateVerified(): void {
  try {
    window.localStorage.setItem(AGE_GATE_STORAGE_KEY, "true");
  } catch {
    /* quota / private mode */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AGE_GATE_ACCEPTED_EVENT));
  }
}
