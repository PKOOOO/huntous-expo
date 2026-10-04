import { useAuth } from '@clerk/expo';
import { createContext, use, useState, type ReactNode } from 'react';

import { getVerification, type VerificationRequest } from '@/services/verification';

type HostRequestContextValue = {
  /** The verification request being filled in (set by the role picker). */
  request: VerificationRequest | null;
  setRequest: (request: VerificationRequest) => void;
  /** Re-fetches the request from the API (e.g. after a document upload). */
  refresh: () => Promise<VerificationRequest | null>;
};

const HostRequestContext = createContext<HostRequestContextValue | null>(null);

export function HostRequestProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();
  const [request, setRequest] = useState<VerificationRequest | null>(null);

  const refresh = async () => {
    if (!request) return null;
    const fresh = await getVerification(getToken, request.id);
    setRequest(fresh);
    return fresh;
  };

  return <HostRequestContext value={{ request, setRequest, refresh }}>{children}</HostRequestContext>;
}

export function useHostRequest() {
  const ctx = use(HostRequestContext);
  if (!ctx) throw new Error('useHostRequest must be used inside HostRequestProvider');
  return ctx;
}

/** Whether a document of this kind is on file for the request. */
export function hasDocument(request: VerificationRequest | null, kind: string) {
  return request?.documents.some((d) => d.kind === kind) ?? false;
}
