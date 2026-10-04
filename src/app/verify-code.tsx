import { useSignIn, useSignUp } from '@clerk/expo';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthScreen, ScreenTitle } from '@/components/auth/auth-screen';
import { OtpInput } from '@/components/auth/otp-input';
import { PrimaryButton } from '@/components/primary-button';
import { Palette, Typography } from '@/constants/theme';
import { clerkErrorCode, clerkErrorMessage, CODE_LENGTH, type CodePurpose } from '@/services/auth';

const RESEND_COOLDOWN_S = 30;

const BACK_FALLBACK = {
  signup: '/sign-up',
  reset: '/forgot-password',
  signin: '/sign-in',
} as const;

// Kit screens 10–11 (password reset) and 19–20 (sign-up): Enter OTP Code (Figma 4278:8938).
// Also used for Clerk's new-device check on password sign-in.
export default function VerifyCodeScreen() {
  const { purpose = 'reset' } = useLocalSearchParams<{ email?: string; purpose?: CodePurpose }>();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const canSubmit = code.length === CODE_LENGTH;

  const verify = async () => {
    switch (purpose) {
      case 'signup': {
        const { error } = await signUp.verifications.verifyEmailCode({ code });
        if (error) return error;
        if (signUp.status === 'complete') {
          // The splash route sends a new user on to profile setup.
          await signUp.finalize({ navigate: () => router.replace('/') });
        }
        return null;
      }
      case 'reset': {
        const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code });
        if (error) return error;
        if (signIn.status === 'needs_new_password') router.replace('/reset-password');
        return null;
      }
      case 'signin': {
        const { error } = await signIn.mfa.verifyEmailCode({ code });
        if (error) return error;
        if (signIn.status === 'complete') {
          await signIn.finalize({ navigate: () => router.replace('/') });
        }
        return null;
      }
    }
  };

  const submit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const failure = await verify();
      if (failure) {
        const errorCode = clerkErrorCode(failure);
        setError(
          errorCode === 'form_code_incorrect'
            ? 'That code isn’t right. Check your email and try again.'
            : errorCode === 'verification_expired'
              ? 'This code has expired. Tap “Resend code” for a new one.'
              : clerkErrorMessage(failure, 'Couldn’t verify the code. Check your connection and try again.'),
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setCooldown(RESEND_COOLDOWN_S);
    setCode('');
    setError(undefined);
    const { error } =
      purpose === 'signup'
        ? await signUp.verifications.sendEmailCode()
        : purpose === 'reset'
          ? await signIn.resetPasswordEmailCode.sendCode()
          : await signIn.mfa.sendEmailCode();
    if (error) setError(clerkErrorMessage(error, 'Couldn’t send a new code. Try again shortly.'));
  };

  return (
    <AuthScreen backFallback={BACK_FALLBACK[purpose]}>
      <View style={styles.content}>
        <ScreenTitle
          title="Enter OTP Code"
          subtitle="Enter the OTP sent to your email to continue"
        />
        <View style={styles.form}>
          <View style={styles.codeBlock}>
            <OtpInput
              value={code}
              onChange={(next) => {
                setCode(next);
                setError(undefined);
              }}
              length={CODE_LENGTH}
            />
            {error && (
              <Text style={styles.error} accessibilityLiveRegion="polite">
                {error}
              </Text>
            )}
          </View>
          <PrimaryButton
            title="Continue"
            size="md"
            disabled={!canSubmit}
            loading={submitting}
            onPress={submit}
          />
          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Didn’t receive the code?</Text>
            {cooldown > 0 ? (
              <Text style={styles.resendText}>Resend in {cooldown}s</Text>
            ) : (
              <Text style={styles.link} onPress={resend} accessibilityRole="button">
                Resend code
              </Text>
            )}
          </View>
        </View>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 32,
  },
  form: {
    gap: 24,
  },
  codeBlock: {
    gap: 6,
  },
  error: {
    ...Typography.textSmRegular,
    color: Palette.textError,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  resendText: {
    ...Typography.textMdRegular,
    color: Palette.textQuaternary,
  },
  link: {
    ...Typography.textMdMedium,
    color: Palette.brand,
  },
});
