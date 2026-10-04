import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { Palette, Typography } from '@/constants/theme';

// Kit screen 15: Password updated (Figma 4278:10514).
export default function PasswordUpdatedScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.main}>
        <View style={styles.hero}>
          <View style={styles.illustration}>
            <Image source={require('@/assets/images/auth/confetti.svg')} style={StyleSheet.absoluteFill} />
            <Image
              source={require('@/assets/images/auth/password-updated.png')}
              style={styles.lock}
            />
          </View>
          <View style={styles.text}>
            <Text style={styles.title} accessibilityRole="header">
              Password Updated!
            </Text>
            <Text style={styles.body}>
              Your password has been successfully changed. Use it next time you log in.
            </Text>
          </View>
        </View>
        {/* The user is already signed in after a reset, so continue into the app. */}
        <PrimaryButton title="Continue" size="md" onPress={() => router.replace('/')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bgPrimary,
    justifyContent: 'center',
  },
  main: {
    padding: 16,
    gap: 32,
    // Figma centres this block 81pt above the screen's midpoint.
    marginBottom: 162,
  },
  hero: {
    alignItems: 'center',
  },
  illustration: {
    width: 244,
    height: 210,
    marginBottom: -32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lock: {
    width: 200,
    height: 200,
  },
  text: {
    alignItems: 'center',
    gap: 4,
  },
  title: {
    ...Typography.displayXsMedium,
    color: Palette.textPrimary,
  },
  body: {
    ...Typography.textSmRegular,
    color: Palette.textTertiary,
    textAlign: 'center',
    maxWidth: 303,
  },
});
