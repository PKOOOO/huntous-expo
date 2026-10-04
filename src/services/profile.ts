import type { UserResource } from '@clerk/expo/types';

import { apiFetch, type GetToken, type Me } from '@/services/api';

/**
 * Profile service.
 *
 * Profile-setup answers are stored by the Huntouse API (`PUT /api/me/profile`). Name and photo
 * are Clerk-owned, so they go to the Clerk user (the webhook mirrors them into the database).
 * Clerk `unsafeMetadata.profileSetupComplete` is kept only as a fast local flag so the splash
 * can route without a network call — never put roles or verification state there.
 */

export type Goal = 'rent' | 'buy' | 'invest' | 'commercial';

export type PropertyType =
  | 'home'
  | 'apartments'
  | 'condos'
  | 'lofts'
  | 'villas'
  | 'townhouses'
  | 'studios'
  | 'penthouses';

export type ProfileDraft = {
  /** Local image picked during setup. */
  photo?: { uri: string; base64: string; mimeType: string };
  fullName: string;
  /** Country of residence (ISO code). */
  countryCode: string;
  /** Country whose dial code prefixes `phone` (ISO code). */
  phoneCountryCode: string;
  phone: string;
  /** DD/MM/YYYY as typed; validated before saving. */
  birthday: string;
  goals: Goal[];
  propertyTypes: PropertyType[];
};

export function hasCompletedProfileSetup(user: UserResource) {
  return user.unsafeMetadata.profileSetupComplete === true;
}

function splitName(fullName: string) {
  const [firstName = '', ...rest] = fullName.trim().split(/\s+/);
  return { firstName, lastName: rest.join(' ') };
}

/** DD/MM/YYYY (as typed in the wizard) → YYYY-MM-DD, or null if empty/invalid. */
function toIsoDate(ddmmyyyy: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(ddmmyyyy);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : null;
}

/** Saves the profile-setup answers for the signed-in user and marks setup complete. */
export async function saveProfile(user: UserResource, getToken: GetToken, draft: ProfileDraft) {
  if (draft.fullName.trim()) {
    await user.update(splitName(draft.fullName));
  }
  if (draft.photo) {
    await user.setProfileImage({
      file: `data:${draft.photo.mimeType};base64,${draft.photo.base64}`,
    });
  }
  const phone = draft.phone.replace(/\D/g, '');
  await apiFetch<Me>(getToken, '/api/me/profile', {
    method: 'PUT',
    body: {
      countryCode: draft.countryCode,
      phoneCountryCode: phone ? draft.phoneCountryCode : null,
      phone: phone || null,
      birthday: toIsoDate(draft.birthday),
      goals: draft.goals,
      propertyTypes: draft.propertyTypes,
      completeSetup: true,
    },
  });
  await user.updateMetadata({ unsafeMetadata: { profileSetupComplete: true } });
}
