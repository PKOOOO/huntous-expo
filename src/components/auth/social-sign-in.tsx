import { useSSO } from '@clerk/expo';
import * as AuthSession from 'expo-auth-session';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette, Radius, Shadow, Typography } from '@/constants/theme';
import { clerkErrorMessage } from '@/services/auth';

// Completes the browser auth session when the redirect lands back in the app (needed on web).
WebBrowser.maybeCompleteAuthSession();

type Provider = 'google' | 'apple';

const STRATEGY = { google: 'oauth_google', apple: 'oauth_apple' } as const;

/** Pre-loads the browser on Android so the OAuth page opens faster. */
function useWarmUpBrowser() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}

/**
 * Dashed "OR" divider followed by the Google / Apple buttons (login and register).
 *
 * Uses Clerk's browser-based SSO (same approach as cosmix): the provider's page opens in an
 * in-app browser and returns to the app. Works for sign-in and sign-up alike.
 */
export function SocialSignIn() {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();
  const [pending, setPending] = useState<Provider | null>(null);
  const [error, setError] = useState<string>();

  const signInWith = async (provider: Provider) => {
    if (pending) return;
    setPending(provider);
    setError(undefined);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: STRATEGY[provider],
        redirectUrl: AuthSession.makeRedirectUri({ path: 'sso-callback' }),
      });
      // No session means the user closed the browser; nothing to report.
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        // The splash route sends new users to profile setup and returning users home.
        router.replace('/');
      }
    } catch (err) {
      if (__DEV__) console.warn(`[sso:${provider}]`, err);
      setError(
        clerkErrorMessage(err, `Couldn’t continue with ${provider === 'google' ? 'Google' : 'Apple'}. Try again.`),
      );
    } finally {
      setPending(null);
    }
  };

  return (
    <>
      <View style={styles.divider}>
        <Image
          source={require('@/assets/images/auth/divider-dashed.svg')}
          style={styles.dividerLine}
          contentFit="fill"
        />
        <Text style={styles.dividerLabel}>OR</Text>
      </View>

      <View style={styles.block}>
        <View style={styles.row}>
          <Pressable
            style={({ pressed }) => [styles.button, styles.google, pressed && styles.pressed]}
            onPress={() => signInWith('google')}
            disabled={!!pending}
            accessibilityRole="button"
            accessibilityLabel="Continue with Google"
            accessibilityState={{ busy: pending === 'google' }}>
            {pending === 'google' ? (
              <ActivityIndicator color={Palette.textSecondary} style={styles.icon} />
            ) : (
              <Image source={require('@/assets/icons/google.svg')} style={styles.icon} />
            )}
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.button, styles.apple, pressed && styles.pressed]}
            onPress={() => signInWith('apple')}
            disabled={!!pending}
            accessibilityRole="button"
            accessibilityLabel="Continue with Apple"
            accessibilityState={{ busy: pending === 'apple' }}>
            {pending === 'apple' ? (
              <ActivityIndicator color={Palette.textWhite} style={styles.icon} />
            ) : (
              <Image source={require('@/assets/icons/apple.svg')} style={styles.icon} />
            )}
          </Pressable>
        </View>
        {error && (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  // A 1pt dashed line; the "OR" label overlays it without adding height (as in Figma).
  divider: {
    height: 1,
    alignItems: 'center',
  },
  dividerLine: {
    alignSelf: 'stretch',
    height: 1,
  },
  dividerLabel: {
    ...Typography.textXsRegular,
    position: 'absolute',
    top: 0.5 - Typography.textXsRegular.lineHeight / 2,
    color: Palette.textQuaternary,
    backgroundColor: Palette.bgPrimary,
    paddingHorizontal: 4,
  },
  block: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: Radius.pill,
    boxShadow: Shadow.xs,
  },
  google: {
    // Inside stroke in Figma: keep the 44pt height by trimming the padding.
    padding: 9,
    borderWidth: 1,
    borderColor: Palette.borderPrimary,
    backgroundColor: Palette.bgPrimary,
  },
  apple: {
    backgroundColor: '#000000',
  },
  pressed: {
    opacity: 0.8,
  },
  icon: {
    width: 24,
    height: 24,
  },
  error: {
    ...Typography.textSmRegular,
    color: Palette.textError,
    textAlign: 'center',
  },
});
