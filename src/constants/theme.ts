/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/*
 * Huntouse design tokens, taken from the Livana kit's Figma variables
 * (file RggaUeAz90NrzCtnGsMSvj, DESIGN page). Names mirror the Figma variable names.
 * The kit is light-theme only.
 */

export const BrandName = 'Huntouse';

export const Palette = {
  /** Color/Foreground/fg-brand, Color/Text/text-brand */
  brand: '#EC6846',
  /** Color/Text/text-primary, Color/Foreground/fg-primary */
  textPrimary: '#333333',
  /** Color/Text/text-secondary */
  textSecondary: '#444444',
  /** Color/Text/text-tertiary */
  textTertiary: '#666666',
  /** Color/Text/text-quaternary */
  textQuaternary: '#8C8C8C',
  /** Color/Text/text-white */
  textWhite: '#FFFFFF',
  /** Color/Foreground/fg-senary */
  fgSenary: '#D7D7D7',
  /** Color/Background/bg-primary */
  bgPrimary: '#FFFFFF',
  /** Color/Text/text-placeholder */
  textPlaceholder: '#808080',
  /** Color/Text/text-placeholder_subtle */
  textPlaceholderSubtle: '#D7D7D7',
  /** Color/Brand/300 */
  brand300: '#FB8E72',
  /** Color/Brand/50 */
  brand50: '#FFF0ED',
  /** Color/Text/text-error */
  textError: '#D92D20',
  /** Color/Foreground/fg-disabled */
  fgDisabled: '#8C8C8C',
  /** Color/Background/bg-tertiary */
  bgTertiary: '#F2F4F7',
  /** Color/Background/bg-disabled_subtle */
  bgDisabledSubtle: '#F9FAFB',
  /** Color/Border/border-primary, Color/Border/border-disabled */
  borderPrimary: '#D0D5DD',
  /** Color/Border/border-error_subtle */
  borderErrorSubtle: '#FDA29B',
  /** Color/Border/border-secondary (also the dashed "OR" divider stroke) */
  borderSecondary: '#E4E7EC',
  /** Color/Border/border-brand */
  borderBrand: '#EC6846',
  /** Brand-tinted border used on suggestion chips. */
  brandBorderSoft: '#FFB09C',
} as const;

/** font_text = Fredoka, loaded in the root layout via @expo-google-fonts/fredoka. */
export const FontFamily = {
  regular: 'Fredoka_400Regular',
  medium: 'Fredoka_500Medium',
  semiBold: 'Fredoka_600SemiBold',
} as const;

/** Every kit text style uses letterSpacing -3% of the font size. */
const tracking = (size: number) => size * -0.03;

/** Figma text styles, named as in the kit ("Text md/Regular" -> textMdRegular). */
export const Typography = {
  displayLgMedium: { fontFamily: FontFamily.medium, fontSize: 48, lineHeight: 60, letterSpacing: tracking(48) },
  displayMdMedium: { fontFamily: FontFamily.medium, fontSize: 32, lineHeight: 38, letterSpacing: tracking(32) },
  /** Onboarding headline; Figma didn't report a style name for it. */
  headline: { fontFamily: FontFamily.medium, fontSize: 28, lineHeight: 36, letterSpacing: tracking(28) },
  displayXsMedium: { fontFamily: FontFamily.medium, fontSize: 24, lineHeight: 32, letterSpacing: tracking(24) },
  textXlMedium: { fontFamily: FontFamily.medium, fontSize: 20, lineHeight: 30, letterSpacing: tracking(20) },
  textLgMedium: { fontFamily: FontFamily.medium, fontSize: 18, lineHeight: 28, letterSpacing: tracking(18) },
  textMdMedium: { fontFamily: FontFamily.medium, fontSize: 16, lineHeight: 24, letterSpacing: tracking(16) },
  textMdRegular: { fontFamily: FontFamily.regular, fontSize: 16, lineHeight: 24, letterSpacing: tracking(16) },
  textSmMedium: { fontFamily: FontFamily.medium, fontSize: 14, lineHeight: 20, letterSpacing: tracking(14) },
  textSmRegular: { fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 20, letterSpacing: tracking(14) },
  textXsRegular: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 18, letterSpacing: tracking(12) },
} as const;

/** Figma effect styles. */
export const Shadow = {
  xs: '0px 1px 2px 0px rgba(10, 13, 18, 0.05)',
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 9999,
} as const;

/** Frame size every kit screen is drawn at. */
export const DesignFrame = { width: 375, height: 812 } as const;
