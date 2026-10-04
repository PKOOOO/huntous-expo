import { useAuth } from '@clerk/expo';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { Palette, Radius, Typography } from '@/constants/theme';
import { uploadDocument, type DocumentKind, type PickedFile } from '@/services/verification';

type Source = 'camera' | 'selfie' | 'library' | 'file';

type DocumentTileProps = {
  requestId: string;
  kind: DocumentKind;
  label: string;
  hint?: string;
  /** Already uploaded on the server (e.g. resuming a draft). */
  uploaded: boolean;
  /** Which pick actions to offer. */
  sources: Source[];
  onUploaded: () => void;
};

const ACTION_LABELS: Record<Source, string> = {
  camera: 'Take photo',
  selfie: 'Take selfie',
  library: 'Choose photo',
  file: 'Upload file',
};

async function pick(source: Source): Promise<PickedFile | null> {
  if (source === 'file') {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/jpeg', 'image/png'],
      copyToCacheDirectory: true,
    });
    const asset = result.canceled ? undefined : result.assets[0];
    return asset ? { uri: asset.uri, mimeType: asset.mimeType ?? 'application/pdf' } : null;
  }
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7 };
  if (source === 'library') {
    const result = await ImagePicker.launchImageLibraryAsync(options);
    const asset = result.canceled ? undefined : result.assets[0];
    return asset ? { uri: asset.uri, mimeType: asset.mimeType ?? 'image/jpeg' } : null;
  }
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Camera access needed', 'Allow camera access in Settings to take this photo.');
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({
    ...options,
    cameraType: source === 'selfie' ? ImagePicker.CameraType.front : ImagePicker.CameraType.back,
  });
  const asset = result.canceled ? undefined : result.assets[0];
  return asset ? { uri: asset.uri, mimeType: asset.mimeType ?? 'image/jpeg' } : null;
}

/** A document slot: pick from camera / gallery / files, upload straight to private storage. */
export function DocumentTile({ requestId, kind, label, hint, uploaded, sources, onUploaded }: DocumentTileProps) {
  const { getToken } = useAuth();
  const [preview, setPreview] = useState<PickedFile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const done = uploaded || preview !== null;

  const choose = async (source: Source) => {
    if (busy) return;
    setError(undefined);
    const file = await pick(source);
    if (!file) return;
    setBusy(true);
    try {
      await uploadDocument(getToken, requestId, kind, file);
      setPreview(file);
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.tile, done && styles.tileDone, !!error && styles.tileError]}>
        <View style={styles.thumb}>
          {busy ? (
            <ActivityIndicator color={Palette.brand} />
          ) : preview && preview.mimeType.startsWith('image/') ? (
            <Image source={{ uri: preview.uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : preview ? (
            <Text style={styles.pdf}>PDF</Text>
          ) : (
            <Image source={require('@/assets/icons/upload-simple.svg')} style={styles.icon} />
          )}
          {done && !busy && (
            <Image source={require('@/assets/icons/checkbox-checked.svg')} style={styles.badge} />
          )}
        </View>
        <View style={styles.body}>
          <Text style={styles.label}>{label}</Text>
          {hint && <Text style={styles.hint}>{hint}</Text>}
          <View style={styles.actions}>
            {sources.map((source) => (
              <Text
                key={source}
                style={[styles.action, busy && styles.actionDisabled]}
                onPress={() => choose(source)}
                accessibilityRole="button"
                accessibilityLabel={`${ACTION_LABELS[source]}: ${label}`}>
                {done && sources.length === 1 ? 'Retake' : ACTION_LABELS[source]}
              </Text>
            ))}
          </View>
        </View>
      </View>
      {error && (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  tile: {
    flexDirection: 'row',
    gap: 12,
    padding: 11,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Palette.borderPrimary,
    backgroundColor: Palette.bgDisabledSubtle,
  },
  tileDone: {
    borderStyle: 'solid',
    borderColor: Palette.brand300,
    backgroundColor: Palette.bgPrimary,
  },
  tileError: {
    borderColor: Palette.borderErrorSubtle,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    backgroundColor: Palette.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
  },
  pdf: {
    ...Typography.textSmMedium,
    color: Palette.textSecondary,
  },
  badge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 16,
    height: 16,
    borderRadius: 3,
    backgroundColor: Palette.bgPrimary,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    ...Typography.textMdMedium,
    color: Palette.textPrimary,
  },
  hint: {
    ...Typography.textXsRegular,
    color: Palette.textQuaternary,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  action: {
    ...Typography.textSmMedium,
    color: Palette.brand,
  },
  actionDisabled: {
    opacity: 0.4,
  },
  error: {
    ...Typography.textSmRegular,
    color: Palette.textError,
  },
});
