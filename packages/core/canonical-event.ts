/**
 * Canonical event type that the core system understands.
 * All gateway-specific events map to this canonical event.
 */
export type CanonicalEvent = "payment.succeeded";

export const CANONICAL_EVENT: CanonicalEvent = "payment.succeeded";

