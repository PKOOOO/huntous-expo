import { Stack } from 'expo-router';

import { HostRequestProvider } from '@/components/host/host-request';
import { Palette } from '@/constants/theme';

// Become a host: role → identity → ownership proof (owner) / agency (agent) → review → status.
// No kit screens exist for this flow; built in the kit's style (§5 of AGENTS.md).
export default function HostLayout() {
  return (
    <HostRequestProvider>
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Palette.bgPrimary } }}
      />
    </HostRequestProvider>
  );
}
