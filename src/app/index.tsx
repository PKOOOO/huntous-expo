import { useAuth, useUser } from '@clerk/expo';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Palette } from '@/constants/theme';
import { hasCompletedProfileSetup } from '@/services/profile';

const MIN_SPLASH_MS = 1200;

/** The branded pause only plays on a cold start; later visits (after sign-in/out) route at once. */
let splashPlayed = false;

/**
 * Branded splash. Renders the same lockup as the native splash (app.json) so the handoff is
 * seamless, then routes by auth state: onboarding, profile setup, or home.
 */
export default function SplashRoute() {
  const { isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const [minTimeElapsed, setMinTimeElapsed] = useState(splashPlayed);

  useEffect(() => {
    if (splashPlayed) return;
    const timer = setTimeout(() => {
      splashPlayed = true;
      setMinTimeElapsed(true);
    }, MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!minTimeElapsed) return;
    if (!isSignedIn) {
      router.replace('/onboarding');
    } else if (userLoaded && user) {
      router.replace(hasCompletedProfileSetup(user) ? '/home' : '/profile-setup');
    }
  }, [minTimeElapsed, isSignedIn, userLoaded, user]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image
        source={require('@/assets/images/brand/splash-lockup.png')}
        style={styles.lockup}
        contentFit="contain"
        accessibilityLabel="Huntouse"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockup: {
    width: 220,
    aspectRatio: 220 / 138,
  },
});
