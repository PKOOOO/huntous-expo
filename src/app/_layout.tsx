import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import {
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  useFonts,
} from '@expo-google-fonts/fredoka';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import { Palette } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

const clerkKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!clerkKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to .env.local.');
}
const publishableKey: string = clerkKey;

/** If Clerk can't load (e.g. offline on first launch), stop waiting and treat the user as signed out. */
const CLERK_LOAD_TIMEOUT_MS = 10_000;

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <RootStack />
    </ClerkProvider>
  );
}

function RootStack() {
  const { isLoaded, isSignedIn } = useAuth();
  const [timedOut, setTimedOut] = useState(false);
  const ready = isLoaded || timedOut;

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), CLERK_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) {
    return null;
  }

  const signedIn = !!isSignedIn;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Palette.bgPrimary },
      }}>
      {/* Splash: decides where to go once auth state is known. */}
      <Stack.Screen name="index" options={{ animation: 'none' }} />
      {/* Unguarded: Clerk navigates here just before the post-reset session becomes active. */}
      <Stack.Screen name="password-updated" options={{ gestureEnabled: false }} />
      {/* OAuth redirect target; forwards to the splash route. */}
      <Stack.Screen name="sso-callback" options={{ animation: 'none' }} />

      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="verify-code" />
        <Stack.Screen name="reset-password" />
      </Stack.Protected>

      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="profile-setup" options={{ gestureEnabled: false }} />
        <Stack.Screen name="home" options={{ gestureEnabled: false }} />
      </Stack.Protected>
    </Stack>
  );
}
