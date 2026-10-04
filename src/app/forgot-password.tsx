import { useSignIn } from '@clerk/expo';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthScreen, ScreenTitle } from '@/components/auth/auth-screen';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { clerkErrorCode, clerkErrorMessage, isValidEmail } from '@/services/auth';

// Kit screens 8–9: Forgot password, Forgot password-filled (Figma 4278:8758).
export default function ForgotPasswordScreen() {
  const { signIn } = useSignIn();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0;

  const submit = async () => {
    if (!canSubmit || submitting) return;
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setError('Enter a valid email address');
      return;
    }
    setSubmitting(true);
    try {
      const { error: createError } = await signIn.create({ identifier: trimmed });
      const { error: sendError } = createError
        ? { error: createError }
        : await signIn.resetPasswordEmailCode.sendCode();
      const failure = createError ?? sendError;
      if (failure) {
        setError(
          clerkErrorCode(failure) === 'form_identifier_not_found'
            ? 'We couldn’t find an account with this email'
            : clerkErrorMessage(failure, 'Couldn’t send the code. Check your connection and try again.'),
        );
        return;
      }
      router.push({ pathname: '/verify-code', params: { email: trimmed, purpose: 'reset' } });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScreen backFallback="/sign-in">
      <View style={styles.content}>
        <ScreenTitle
          title="Forgot your password?"
          subtitle="Enter your email, and we'll send you a reset code"
        />
        <View style={styles.form}>
          <TextField
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError(undefined);
            }}
            error={error}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="go"
            onSubmitEditing={submit}
            autoFocus={!params.email}
          />
          <PrimaryButton
            title="Send OTP Code"
            size="md"
            disabled={!canSubmit}
            loading={submitting}
            onPress={submit}
          />
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
});
