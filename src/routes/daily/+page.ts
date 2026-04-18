// Disable SSR: the daily page is driven entirely by client-side state
// (localStorage for history + in-progress, local date for list selection).
// SSR on Fly (UTC) picks a different day's list than the client when the
// user is in a timezone behind UTC, causing a hydration mismatch that wipes
// restored results and lets the user replay on refresh.
export const ssr = false;
