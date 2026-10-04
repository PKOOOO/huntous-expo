import { File, UploadType } from 'expo-file-system';

import { apiFetch, type GetToken } from '@/services/api';

/**
 * Host verification (becoming a direct owner or an agent). Free for everyone.
 * Documents go straight from the phone to private storage via short-lived upload URLs from
 * the API; the app never sees storage credentials.
 */

export type VerificationKind = 'owner' | 'agent';
export type VerificationStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type IdType = 'national_id' | 'passport' | 'alien_id';
export type DocumentKind = 'id_front' | 'id_back' | 'selfie' | 'ownership_proof' | 'agent_license';

export type VerificationRequest = {
  id: string;
  kind: VerificationKind;
  status: VerificationStatus;
  idType: IdType | null;
  idNumberLast4: string | null;
  earbNumber: string | null;
  agencyName: string | null;
  agencyLocation: string | null;
  documents: { kind: DocumentKind; contentType: string; sizeBytes: number }[];
  requiredDocuments: DocumentKind[];
  /** What the server still needs before submit, e.g. `idNumber`, `document:SELFIE`. */
  missing: string[];
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
};

export const ID_TYPE_LABELS: Record<IdType, string> = {
  national_id: 'National ID',
  passport: 'Passport',
  alien_id: 'Alien ID',
};

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

export function listVerifications(getToken: GetToken) {
  return apiFetch<{ roles: string[]; requests: VerificationRequest[] }>(getToken, '/api/verifications');
}

/** Starts (or resumes) becoming an owner/agent. */
export function startVerification(getToken: GetToken, kind: VerificationKind) {
  return apiFetch<VerificationRequest>(getToken, '/api/verifications', {
    method: 'POST',
    body: { kind },
  });
}

export function getVerification(getToken: GetToken, id: string) {
  return apiFetch<VerificationRequest>(getToken, `/api/verifications/${id}`);
}

export function updateVerification(
  getToken: GetToken,
  id: string,
  fields: Partial<{
    idType: IdType;
    idNumber: string;
    earbNumber: string;
    agencyName: string;
    agencyLocation: string;
  }>,
) {
  return apiFetch<VerificationRequest>(getToken, `/api/verifications/${id}`, {
    method: 'PATCH',
    body: fields,
  });
}

export type PickedFile = { uri: string; mimeType: string };

/**
 * Uploads a picked photo/PDF for one document slot (replacing any previous one).
 * Uses the native file upload (raw bytes, correct Content-Length) rather than `fetch` + Blob,
 * which doesn't reliably send binary bodies/lengths from React Native.
 */
export async function uploadDocument(
  getToken: GetToken,
  id: string,
  kind: DocumentKind,
  picked: PickedFile,
) {
  const file = new File(picked.uri);
  const sizeBytes = file.size;
  if (!sizeBytes) throw new Error('Couldn’t read this file. Please try again.');
  if (sizeBytes > MAX_DOCUMENT_BYTES) {
    throw new Error('This file is larger than 10 MB. Please choose a smaller one.');
  }
  const target = await apiFetch<{ uploadUrl: string; headers: Record<string, string> }>(
    getToken,
    `/api/verifications/${id}/documents`,
    { method: 'POST', body: { kind, contentType: picked.mimeType, sizeBytes } },
  );
  const result = await file.upload(target.uploadUrl, {
    httpMethod: 'PUT',
    uploadType: UploadType.BINARY_CONTENT,
    headers: target.headers,
    mimeType: picked.mimeType,
  });
  if (result.status < 200 || result.status >= 300) {
    if (__DEV__) console.warn('[upload] storage rejected the upload', result.status, result.body);
    throw new Error(`Upload failed (HTTP ${result.status}). Please try again.`);
  }
}

export function submitVerification(getToken: GetToken, id: string) {
  return apiFetch<VerificationRequest>(getToken, `/api/verifications/${id}/submit`, {
    method: 'POST',
    body: { consent: true },
  });
}
