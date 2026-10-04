import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Palette, Radius, Typography } from '@/constants/theme';

type OtpInputProps = {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  autoFocus?: boolean;
};

/**
 * Kit "Verification code input field". One hidden TextInput drives the boxes so paste,
 * SMS autofill and backspace behave natively.
 */
export function OtpInput({ value, onChange, length = 4, autoFocus = true }: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <Pressable
      style={styles.row}
      onPress={() => inputRef.current?.focus()}
      accessibilityLabel={`Verification code, ${length} digits`}>
      {Array.from({ length }, (_, i) => {
        const digit = value[i];
        const isActive = focused && i === activeIndex;
        return (
          <View
            key={i}
            style={[styles.box, digit !== undefined && styles.boxFilled, isActive && styles.boxActive]}>
            {(digit !== undefined || !isActive) && (
              <Text
                style={[
                  styles.digit,
                  length > 4 && styles.digitCompact,
                  digit === undefined && styles.placeholder,
                ]}>
                {digit ?? '0'}
              </Text>
            )}
            {isActive && <View style={styles.caret} />}
          </View>
        );
      })}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        caretHidden
        style={styles.hiddenInput}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  box: {
    flex: 1,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Palette.borderPrimary,
    backgroundColor: Palette.bgPrimary,
  },
  boxFilled: {
    borderColor: Palette.brand300,
  },
  boxActive: {
    borderColor: Palette.brand300,
    // Kit draws a 4pt brand-50 ring around the focused box.
    boxShadow: `0px 0px 0px 4px ${Palette.brand50}`,
  },
  digit: {
    ...Typography.displayLgMedium,
    color: Palette.textSecondary,
    textAlign: 'center',
  },
  // The kit draws 4 boxes; Clerk codes are 6, so the digits shrink to fit the narrower boxes.
  digitCompact: {
    fontSize: 40,
    lineHeight: 52,
    letterSpacing: 40 * -0.03,
  },
  placeholder: {
    color: Palette.textPlaceholderSubtle,
  },
  caret: {
    width: 1.5,
    height: 40,
    backgroundColor: Palette.brand,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
