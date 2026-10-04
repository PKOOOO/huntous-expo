import { useAuth, useUser } from '@clerk/expo';
import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { Palette, Typography } from '@/constants/theme';

// Placeholder until the home screen (kit screens 28–29) is built.
export default function HomeScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Hi {user?.firstName ?? 'there'}!</Text>
      <Text style={styles.body}>
        Signed in as {user?.primaryEmailAddress?.emailAddress}. Home is coming next.
      </Text>
      <PrimaryButton
        title="Sign out"
        style={styles.button}
        onPress={async () => {
          await signOut();
          router.replace('/');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    gap: 8,
    backgroundColor: Palette.bgPrimary,
  },
  title: {
    ...Typography.headline,
    color: Palette.textPrimary,
    textAlign: 'center',
  },
  body: {
    ...Typography.textMdRegular,
    color: Palette.textQuaternary,
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
  },
});
