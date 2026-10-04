import { StatusBar } from 'expo-status-bar';
import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/back-button';
import { Palette, Typography } from '@/constants/theme';

type WizardScreenProps = {
  /** 0–1. Omit to hide the progress bar (first step). */
  progress?: number;
  onSkip?: () => void;
  title?: string;
  subtitle?: string;
  /** Bottom action bar content. */
  footer: ReactNode;
  /** Set false when the body lays itself out to fill the space (property-type bubbles). */
  scroll?: boolean;
  children: ReactNode;
};

/** Profile-setup step: nav bar with back / progress / Skip, question header, body, action bar. */
export function WizardScreen({
  progress,
  onSkip,
  title,
  subtitle,
  footer,
  scroll = true,
  children,
}: WizardScreenProps) {
  const header = title ? (
    <View style={styles.question}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  ) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.navBar}>
        <BackButton fallback="/sign-in" />
        {progress !== undefined && (
          <View
            style={styles.track}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}>
            <View style={[styles.fill, { width: `${progress * 100}%` }]} />
          </View>
        )}
        {onSkip && (
          <Text style={styles.skip} onPress={onSkip} accessibilityRole="button">
            Skip
          </Text>
        )}
      </View>

      {scroll ? (
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {header}
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.body, styles.bodyContent]}>
          {header}
          {children}
        </View>
      )}

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        {footer}
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bgPrimary,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.bgTertiary,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.brand,
  },
  skip: {
    ...Typography.textSmMedium,
    color: Palette.brand,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    flexGrow: 1,
    gap: 32,
    paddingHorizontal: 16,
  },
  question: {
    gap: 4,
  },
  title: {
    ...Typography.displayXsMedium,
    color: Palette.textPrimary,
  },
  subtitle: {
    ...Typography.textSmRegular,
    color: Palette.textQuaternary,
  },
  footer: {
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
    backgroundColor: Palette.bgPrimary,
  },
});
