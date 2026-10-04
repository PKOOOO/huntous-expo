import { Image } from 'expo-image';
import { useState, type ReactNode, type Ref } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Palette, Radius, Typography } from '@/constants/theme';

type FieldSize = 'sm' | 'md';

type FieldFrameProps = {
  label: string;
  required?: boolean;
  error?: string;
  /** md: 14/10 padding (login, register). sm: 12/8 padding (set new password, profile). */
  size?: FieldSize;
  children: ReactNode;
};

/** Label (with optional red asterisk), bordered input box, optional error message. */
function FieldFrame({ label, required, error, size = 'md', children }: FieldFrameProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={[styles.input, size === 'sm' && styles.inputSm, !!error && styles.inputError]}>
        {children}
      </View>
      {!!error && (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}

type TextFieldProps = Omit<TextInputProps, 'style' | 'secureTextEntry'> & {
  label: string;
  required?: boolean;
  error?: string;
  /** Renders a password field with the kit's eye toggle. */
  secure?: boolean;
  size?: FieldSize;
  /** Content before the text, e.g. the phone dial-code dropdown. */
  leading?: ReactNode;
  ref?: Ref<TextInput>;
};

/** Kit "Input field". */
export function TextField({
  label,
  required,
  error,
  secure = false,
  size = 'md',
  leading,
  ref,
  ...inputProps
}: TextFieldProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <FieldFrame label={label} required={required} error={error} size={size}>
      {leading}
      <TextInput
        ref={ref}
        style={styles.text}
        placeholderTextColor={Palette.textPlaceholder}
        secureTextEntry={secure && !revealed}
        accessibilityLabel={label}
        aria-invalid={!!error}
        {...inputProps}
      />
      {secure && (
        <Pressable
          onPress={() => setRevealed((v) => !v)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={revealed ? 'Hide password' : 'Show password'}>
          <Image
            source={
              revealed ? require('@/assets/icons/eye-closed.svg') : require('@/assets/icons/eye.svg')
            }
            style={styles.icon}
          />
        </Pressable>
      )}
    </FieldFrame>
  );
}

type SelectFieldProps = {
  label: string;
  placeholder: string;
  value?: string;
  onPress: () => void;
  required?: boolean;
  error?: string;
  size?: FieldSize;
};

/** Input-styled dropdown trigger (kit "Input field" with a caret). */
export function SelectField({ label, placeholder, value, onPress, required, error, size = 'md' }: SelectFieldProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}: ${value ?? placeholder}`}>
      <FieldFrame label={label} required={required} error={error} size={size}>
        <Text style={[styles.text, !value && styles.placeholder]} numberOfLines={1}>
          {value ?? placeholder}
        </Text>
        <Image source={require('@/assets/icons/caret-down.svg')} style={styles.icon} />
      </FieldFrame>
    </Pressable>
  );
}

/** Dial-code dropdown shown at the start of a phone-number TextField. */
export function DialCodeButton({ code, onPress }: { code: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.dialCode}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={`Country code ${code}`}>
      <Text style={styles.dialCodeText}>{code}</Text>
      <Image source={require('@/assets/icons/caret-down-sm.svg')} style={styles.icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    alignSelf: 'stretch',
    gap: 6,
  },
  label: {
    ...Typography.textSmMedium,
    color: Palette.textSecondary,
  },
  required: {
    color: Palette.textError,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    // Figma strokes sit inside the box; subtract the 1pt border from the 14/10 padding.
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Palette.borderPrimary,
    backgroundColor: Palette.bgPrimary,
  },
  inputSm: {
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  inputError: {
    borderColor: Palette.borderErrorSubtle,
  },
  text: {
    ...Typography.textMdRegular,
    flex: 1,
    // TextInput adds its own vertical padding on Android; the 24pt line height sets the size.
    paddingVertical: 0,
    height: Typography.textMdRegular.lineHeight,
    color: Palette.textPrimary,
  },
  placeholder: {
    color: Palette.textPlaceholder,
  },
  icon: {
    width: 16,
    height: 16,
  },
  dialCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    // Kit spaces the number 10pt after the caret; the row gap supplies 8.
    marginRight: 2,
  },
  dialCodeText: {
    ...Typography.textMdRegular,
    color: Palette.textSecondary,
  },
  error: {
    ...Typography.textSmRegular,
    color: Palette.textError,
  },
});
