import { useSignIn } from '@clerk/expo';
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

// Kit screens 5–7: Login, Login-filled, Login-password error (Figma 4270:11608).
export default function SignInScreen() {
  const { signIn } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const submit = async () => {
    if (!canSubmit || submitting) return;
    if (!isValidEmail(email)) {
      setEmailError('Enter a valid email address');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await signIn.password({ identifier: email.trim(), password });
      if (error) {
        const code = clerkErrorCode(error);
        if (code === 'form_password_incorrect') {
          setPasswordError('Password incorrect');
        } else if (code === 'form_identifier_not_found') {
          setEmailError('No account found with this email');
        } else {
          setPasswordError(
            clerkErrorMessage(error, 'Couldn’t sign in. Check your connection and try again.'),
          );
        }
        return;
      }

      if (signIn.status === 'complete') {
        // The splash route decides between profile setup and home.
        await signIn.finalize({ navigate: () => router.replace('/') });
      } else if (
        signIn.status === 'needs_client_trust' ||
        signIn.status === 'needs_second_factor'
      ) {
        // New device: Clerk wants an emailed code before trusting this sign-in.
        await signIn.mfa.sendEmailCode();
        router.push({
          pathname: '/verify-code',
          params: { email: email.trim(), purpose: 'signin' },
        });
      } else {
        setPasswordError('Couldn’t sign in. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScreen backFallback="/onboarding">
      <View style={styles.content}>
        <WelcomeHeader
          title="Welcome back!"
          subtitle={`Sign in to continue your journey with ${BrandName}`}
        />

        <View style={styles.body}>
          <View style={styles.section}>
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
                  autoComplete="current-password"
                  textContentType="password"
                  returnKeyType="go"
                  onSubmitEditing={submit}
                />
                <Text
                  style={styles.link}
                  onPress={() =>
                    router.push({ pathname: '/forgot-password', params: { email: email.trim() } })
                  }
                  accessibilityRole="link">
                  Forgot password?
                </Text>
              </View>
              <PrimaryButton
                title="Login"
                size="md"
                disabled={!canSubmit}
                loading={submitting}
                onPress={submit}
              />
            </View>

            <SocialSignIn />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don’t have an account?</Text>
            <Text
              style={styles.link}
              onPress={() => router.replace('/sign-up')}
              accessibilityRole="link">
              Join now
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
  form: {
    gap: 24,
  },
  fields: {
    gap: 16,
    alignItems: 'flex-end',
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
