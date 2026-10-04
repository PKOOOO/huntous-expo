import { Image } from 'expo-image';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette, Radius, Typography } from '@/constants/theme';

type Option = { key: string; label: string; detail?: string };

type OptionSheetProps = {
  visible: boolean;
  title: string;
  options: Option[];
  selectedKey?: string;
  onSelect: (key: string) => void;
  onClose: () => void;
};

/** Bottom sheet with a single-choice list (country, dial code). */
export function OptionSheet({ visible, title, options, selectedKey, onSelect, onClose }: OptionSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        <FlatList
          data={options}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            const selected = item.key === selectedKey;
            return (
              <Pressable
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                onPress={() => {
                  onSelect(item.key);
                  onClose();
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected }}>
                <Text style={styles.label}>{item.label}</Text>
                {item.detail && <Text style={styles.detail}>{item.detail}</Text>}
                {selected && (
                  <Image source={require('@/assets/icons/checkbox-checked.svg')} style={styles.check} />
                )}
              </Pressable>
            );
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    maxHeight: '70%',
    paddingHorizontal: 16,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    backgroundColor: Palette.bgPrimary,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    marginTop: 8,
    borderRadius: 2,
    backgroundColor: Palette.borderPrimary,
  },
  title: {
    ...Typography.textLgMedium,
    color: Palette.textPrimary,
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Palette.borderSecondary,
  },
  rowPressed: {
    backgroundColor: Palette.bgDisabledSubtle,
  },
  label: {
    ...Typography.textMdRegular,
    flex: 1,
    color: Palette.textPrimary,
  },
  detail: {
    ...Typography.textMdRegular,
    color: Palette.textQuaternary,
  },
  check: {
    width: 16,
    height: 16,
  },
});
