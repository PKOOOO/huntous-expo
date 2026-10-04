import { type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/back-button';
import { Palette, Typography } from '@/constants/theme';

type AuthScreenProps = {
  children: ReactNode;
  /** Where the back button goes when there is no history. */
  backFallback: Href;
  /** Sticky bottom action bar (kit "Price Details" bar on the set-new-password screen). */
  footer?: ReactNode;
};

/** Shared frame for the auth screens: nav bar with back button, scrolling body, keyboard handling. */
export function AuthScreen({ children, backFallback, footer }: AuthScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={footer ? ['top'] : ['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.navBar}>
            <BackButton fallback={backFallback} />
          </View>
          {children}
        </ScrollView>
        {footer && (
          <SafeAreaView edges={['bottom']} style={styles.footer}>
            {footer}
          </SafeAreaView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Left-aligned title + subtitle (forgot password, OTP, set new password). */
export function ScreenTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bgPrimary,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  navBar: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
    backgroundColor: Palette.bgPrimary,
  },
  title: {
    ...Typography.textXlMedium,
    color: Palette.textPrimary,
  },
  subtitle: {
    ...Typography.textSmRegular,
    color: Palette.textQuaternary,
  },
});
