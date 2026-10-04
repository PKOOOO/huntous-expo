import { Stack } from 'expo-router';

import { ProfileDraftProvider } from '@/components/profile-setup/profile-draft';
import { Palette } from '@/constants/theme';

// Kit screens 21–27: Set up profile wizard (details → goals → property types).
export default function ProfileSetupLayout() {
  return (
    <ProfileDraftProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Palette.bgPrimary },
        }}
      />
    </ProfileDraftProvider>
  );
}
