import { useClerk } from '@clerk/expo';
import { useCallback } from 'react';

import type { GetToken } from '@/services/api';

/**
 * A session-token getter with a STABLE identity, safe to use as an effect dependency.
 * (`useAuth().getToken` changes identity every render, which made data-loading effects
 * re-run in an endless loop.) Reads the current session at call time, so it stays correct
 * across sign-in / sign-out.
 */
export function useGetToken(): GetToken {
  const clerk = useClerk();
  return useCallback(async () => (await clerk.session?.getToken()) ?? null, [clerk]);
}
