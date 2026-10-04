import { useUser } from '@clerk/expo';
import { createContext, use, useState, type ReactNode } from 'react';

import { DEFAULT_COUNTRY } from '@/constants/countries';
import type { ProfileDraft } from '@/services/profile';

const INITIAL_DRAFT: ProfileDraft = {
  fullName: '',
  countryCode: DEFAULT_COUNTRY.code,
  phoneCountryCode: DEFAULT_COUNTRY.code,
  phone: '',
  birthday: '',
  goals: [],
  propertyTypes: [],
};

type ProfileDraftContextValue = {
  draft: ProfileDraft;
  update: (patch: Partial<ProfileDraft>) => void;
};

const ProfileDraftContext = createContext<ProfileDraftContextValue | null>(null);

/** Holds the profile-setup answers while the user moves between wizard steps. */
export function ProfileDraftProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  // Social sign-up (Google/Apple) already knows the user's name; start from it.
  const [draft, setDraft] = useState<ProfileDraft>(() => ({
    ...INITIAL_DRAFT,
    fullName: user?.fullName ?? '',
  }));
  const update = (patch: Partial<ProfileDraft>) => setDraft((d) => ({ ...d, ...patch }));
  return <ProfileDraftContext value={{ draft, update }}>{children}</ProfileDraftContext>;
}

export function useProfileDraft() {
  const ctx = use(ProfileDraftContext);
  if (!ctx) throw new Error('useProfileDraft must be used inside ProfileDraftProvider');
  return ctx;
}

/** Adds the value if missing, removes it if present. */
export function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
