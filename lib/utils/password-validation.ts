/**
 * Pure, framework-free validation for the "set a new password" step so it can
 * be unit-tested without rendering a component or touching Supabase.
 *
 * This intentionally lives apart from `password.ts` (which pulls in
 * `node:crypto` for server-side hashing) so it stays safe to import from
 * client components without leaking Node built-ins into the browser bundle.
 *
 * Returns a human-readable error message, or `null` when the input is valid.
 */
export const MIN_PASSWORD_LENGTH = 8;

export function validateNewPassword(
  password: string,
  confirmPassword: string,
): string | null {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }
  return null;
}
