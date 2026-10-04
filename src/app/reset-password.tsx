import { useSignIn } from '@clerk/expo';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View, type TextInput } from 'react-native';

import { AuthScreen, ScreenTitle } from '@/components/auth/auth-screen';
import { meetsPasswordRules, PasswordRequirements } from '@/components/auth/password-requirements';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { clerkErrorCode, clerkErrorMessage } from '@/services/auth';

// Kit screens 12–14: Set up new password, -filled, -error (Figma 4278:9905).
export default function ResetPasswordScreen() {
  const { signIn } = useSignIn();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const confirmRef = useRef<TextInput>(null);

  const canSubmit = meetsPasswordRules(password) && confirm.length > 0;

  const submit = async () => {
    if (!canSubmit || submitting) return;
    if (confirm !== password) {
      setError('Passwords don’t match');
      return;
    }
    setSubmitting(true);
    try {
      const { error: submitError } = await signIn.resetPasswordEmailCode.submitPassword({
        password,
        signOutOfOtherSessions: true,
      });
      if (submitError) {
        setError(
          clerkErrorCode(submitError) === 'form_password_pwned'
            ? 'This password has appeared in a data breach. Please choose another.'
            : clerkErrorMessage(submitError, 'Couldn’t save your password. Try again.'),
        );
        return;
      }
      if (signIn.status === 'complete') {
        // Clerk signs the user in after a reset; show the success screen inside the app.
        await signIn.finalize({ navigate: () => router.replace('/password-updated') });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScreen
      backFallback="/sign-in"
      footer={
        <PrimaryButton
          title="Save new password"
          size="md"
          disabled={!canSubmit}
          loading={submitting}
          onPress={submit}
        />
      }>
      <View style={styles.content}>
        <ScreenTitle
          title="Set a new password"
          subtitle="Choose a strong password to secure your account"
        />
        <View style={styles.form}>
          <View style={styles.passwordBlock}>
            <TextField
              label="Create new password"
              placeholder="Create new password"
              size="sm"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError(undefined);
              }}
              secure
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              submitBehavior="submit"
              autoFocus
            />
            <PasswordRequirements password={password} />
          </View>
          <TextField
            ref={confirmRef}
            label="Confirm new password"
            placeholder="Confirm your new password"
            size="sm"
            value={confirm}
            onChangeText={(text) => {
              setConfirm(text);
              setError(undefined);
            }}
            error={error}
            secure
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="go"
            onSubmitEditing={submit}
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
  passwordBlock: {
    gap: 12,
  },
});
