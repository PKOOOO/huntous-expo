import { useSignUp } from '@clerk/expo';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View, type TextInput } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { SocialSignIn } from '@/components/auth/social-sign-in';
import { WelcomeHeader } from '@/components/auth/welcome-header';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { BrandName, Palette, Typography } from '@/constants/theme';
import { clerkErrorCode, clerkErrorMessage, isValidEmail } from '@/services/auth';

const MIN_PASSWORD_LENGTH = 8;

// Kit screens 16–18: Register, Register-filled, Register-password error (Figma 4270:12478).
export default function SignUpScreen() {
  const { signUp } = useSignUp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const submit = async () => {
    if (!canSubmit || submitting) return;
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setEmailError('Enter a valid email address');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await signUp.password({ emailAddress: trimmed, password });
      if (error) {
        const code = clerkErrorCode(error);
        if (code === 'form_identifier_exists') {
          setEmailError('An account with this email already exists');
        } else if (code === 'form_password_pwned') {
          setPasswordError('This password has appeared in a data breach. Please choose another.');
        } else if (code?.startsWith('form_password')) {
          setPasswordError(clerkErrorMessage(error, 'Please choose a stronger password.'));
        } else {
          setPasswordError(
            clerkErrorMessage(error, 'Couldn’t create your account. Check your connection and try again.'),
          );
        }
        return;
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setEmailError(clerkErrorMessage(sendError, 'Couldn’t send the verification code. Try again.'));
        return;
      }
      router.push({ pathname: '/verify-code', params: { email: trimmed, purpose: 'signup' } });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScreen backFallback="/onboarding">
      <View style={styles.content}>
        <WelcomeHeader
          title={`Join ${BrandName}`}
          subtitle="Start your experience in just a few steps"
        />

        <View style={styles.body}>
          <View style={styles.section}>
            <View style={styles.formBlock}>
              <View style={styles.form}>
                <View style={styles.fields}>
                  <TextField
                    label="Email"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setEmailError(undefined);
                    }}
                    error={emailError}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    submitBehavior="submit"
                  />
                  <TextField
                    ref={passwordRef}
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setPasswordError(undefined);
                    }}
                    error={passwordError}
                    secure
                    autoCapitalize="none"
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="go"
                    onSubmitEditing={submit}
                  />
                </View>
                <PrimaryButton
                  title="Create account"
                  size="md"
                  disabled={!canSubmit}
                  loading={submitting}
                  onPress={submit}
                />
              </View>

              {/* TODO: link to the Terms and Conditions page once it exists. */}
              <Text style={styles.terms}>
                By signing up, you accept our{' '}
                <Text style={styles.link}>Terms &amp; Conditions</Text>
              </Text>
            </View>

            <SocialSignIn />
          </View>

          {/* Clerk bot protection mounts its CAPTCHA here on web (nativeID renders as the DOM id). */}
          <View nativeID="clerk-captcha" />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Text
              style={styles.link}
              onPress={() => router.replace('/sign-in')}
              accessibilityRole="link">
              Login
            </Text>
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
  body: {
    gap: 32,
  },
  section: {
    gap: 32,
  },
  formBlock: {
    gap: 16,
  },
  form: {
    gap: 24,
  },
  fields: {
    gap: 16,
  },
  terms: {
    ...Typography.textMdRegular,
    color: Palette.textQuaternary,
    textAlign: 'center',
  },
  link: {
    ...Typography.textMdMedium,
    color: Palette.brand,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  footerText: {
    ...Typography.textMdRegular,
    color: Palette.textQuaternary,
  },
});
