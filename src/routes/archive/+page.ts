// Client-only: archive eligibility depends on getDayNumber(), which reads
// the user's local clock. Rendering this on the server (UTC on Fly) would
// include/exclude the current daily incorrectly for anyone behind UTC.
export const ssr = false;
