import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Palette, Radius, Typography } from '@/constants/theme';

type PrimaryButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  title: string;
  /** lg: onboarding CTA (Text lg, 12pt padding). md: form submit (Text md, 10pt padding). */
  size?: 'lg' | 'md';
  /** primary: brand fill. secondary: white with a light border (e.g. "Skip"). */
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

const PADDING_Y = { lg: 12, md: 10 } as const;

/** Kit "Button" component: brand fill, with the kit's disabled variant. */
export function PrimaryButton({
  title,
  size = 'lg',
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...rest
}: PrimaryButtonProps) {
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: loading }}
      disabled={inactive}
      style={({ pressed }) => [
        styles.button,
        // Figma strokes sit inside the box, so take the border width out of the padding.
        { paddingVertical: PADDING_Y[size] - (disabled || variant === 'secondary' ? 1 : 2) },
        variant === 'secondary' && styles.secondary,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? Palette.textSecondary : Palette.textWhite} style={size === 'md' ? styles.spinnerMd : styles.spinnerLg} />
      ) : (
        <Text
          style={[
            size === 'md' ? styles.titleMd : styles.title,
            variant === 'secondary' && styles.titleSecondary,
            disabled && styles.titleDisabled,
          ]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.17)',
    backgroundColor: Palette.brand,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 20px -8px rgba(0, 0, 0, 0.1)',
  },
  secondary: {
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: Palette.borderSecondary,
    backgroundColor: Palette.bgPrimary,
    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
  },
  disabled: {
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: Palette.borderPrimary,
    backgroundColor: Palette.bgDisabledSubtle,
    boxShadow: [],
  },
  pressed: {
    opacity: 0.85,
  },
  title: {
    ...Typography.textLgMedium,
    color: Palette.textWhite,
  },
  titleMd: {
    ...Typography.textMdMedium,
    color: Palette.textWhite,
  },
  titleSecondary: {
    color: Palette.textSecondary,
  },
  titleDisabled: {
    color: Palette.fgDisabled,
  },
  spinnerLg: {
    height: Typography.textLgMedium.lineHeight,
  },
  spinnerMd: {
    height: Typography.textMdMedium.lineHeight,
  },
});
