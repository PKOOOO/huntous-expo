import { isClerkAPIResponseError } from '@clerk/expo';

/**
 * Auth helpers shared by the auth screens. The flows themselves use Clerk's
 * `useSignIn()` / `useSignUp()` hooks directly in each screen.
 */

/** Why a verification code was sent; decides what the OTP screen verifies and where it goes next. */
export type CodePurpose =
  /** Verify the email of a new account. */
  | 'signup'
  /** Password reset. */
  | 'reset'
  /** Clerk "client trust": a password sign-in from a new device needs an emailed code. */
  | 'signin';

/** Clerk email verification codes are 6 digits. */
export const CODE_LENGTH = 6;

/** Clerk's machine-readable error code (e.g. `form_password_incorrect`), if any. */
export function clerkErrorCode(error: unknown): string | undefined {
  if (isClerkAPIResponseError(error)) return error.errors[0]?.code;
  if (error && typeof error === 'object' && 'code' in error) return String(error.code);
  return undefined;
}

/** A user-facing message for a Clerk error, falling back to `fallback`. */
export function clerkErrorMessage(error: unknown, fallback: string): string {
  if (isClerkAPIResponseError(error)) {
    const first = error.errors[0];
    return first?.longMessage ?? first?.message ?? fallback;
  }
  return fallback;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string) {
  return EMAIL_PATTERN.test(email.trim());
}
