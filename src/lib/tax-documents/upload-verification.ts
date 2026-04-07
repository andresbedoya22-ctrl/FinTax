import { createHash } from "node:crypto";

import type { CaseRequirement } from "@/types/database";

type UploadedObjectInfo = {
  byteLength: number;
  storageContentType: string | null;
  inferredContentType: string | null;
  checksumSha256: string;
};

function normalizeMimeType(value: string | null | undefined) {
  return value?.trim().toLowerCase() || null;
}

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

function isLikelyUtf8Text(bytes: Uint8Array) {
  for (const byte of bytes) {
    if (byte === 0) return false;
  }

  return true;
}

function includesAscii(bytes: Uint8Array, pattern: string) {
  const encoded = new TextEncoder().encode(pattern);

  for (let index = 0; index <= bytes.length - encoded.length; index += 1) {
    let matches = true;

    for (let offset = 0; offset < encoded.length; offset += 1) {
      if (bytes[index + offset] !== encoded[offset]) {
        matches = false;
        break;
      }
    }

    if (matches) return true;
  }

  return false;
}

function inferMimeType(bytes: Uint8Array, fileName: string) {
  if (bytes.length >= 5 && new TextDecoder("ascii").decode(bytes.slice(0, 5)) === "%PDF-") {
    return "application/pdf";
  }

  if (bytes.length >= 8 && startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }

  if (bytes.length >= 3 && startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return "image/jpeg";
  }

  if (
    bytes.length >= 4 &&
    startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]) &&
    includesAscii(bytes, "[Content_Types].xml") &&
    includesAscii(bytes, "xl/")
  ) {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }

  if (fileName.toLowerCase().endsWith(".csv") && isLikelyUtf8Text(bytes)) {
    return "text/csv";
  }

  return null;
}

function ensureAllowedMimeType(params: {
  acceptedMimeTypes: string[];
  sessionMimeType: string | null;
  storageContentType: string | null;
  inferredContentType: string | null;
}) {
  const acceptedMimeTypes = params.acceptedMimeTypes.map((item) => normalizeMimeType(item)).filter(Boolean);
  const normalizedSessionMimeType = normalizeMimeType(params.sessionMimeType);
  const normalizedStorageContentType = normalizeMimeType(params.storageContentType);
  const normalizedInferredContentType = normalizeMimeType(params.inferredContentType);

  if (acceptedMimeTypes.length > 0) {
    const candidateMimeTypes = [
      normalizedInferredContentType,
      normalizedStorageContentType,
      normalizedSessionMimeType,
    ].filter(Boolean);

    if (!candidateMimeTypes.some((item) => acceptedMimeTypes.includes(item))) {
      throw new Error("uploaded_object_type_mismatch");
    }
  }

  if (
    normalizedInferredContentType &&
    normalizedSessionMimeType &&
    normalizedInferredContentType !== normalizedSessionMimeType
  ) {
    throw new Error("uploaded_object_type_mismatch");
  }

  if (
    normalizedInferredContentType &&
    normalizedStorageContentType &&
    normalizedInferredContentType !== normalizedStorageContentType
  ) {
    throw new Error("uploaded_object_type_mismatch");
  }
}

export async function inspectUploadedObject(params: {
  file: Blob;
  fileName: string;
  storageContentType?: string | null;
}) {
  const arrayBuffer = await params.file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  return {
    byteLength: bytes.byteLength,
    storageContentType: normalizeMimeType(params.storageContentType),
    inferredContentType: inferMimeType(bytes, params.fileName),
    checksumSha256: createHash("sha256").update(bytes).digest("hex"),
  } satisfies UploadedObjectInfo;
}

export function verifyUploadedObjectAgainstRequirement(params: {
  upload: UploadedObjectInfo;
  requirement: CaseRequirement;
  sessionMimeType: string | null;
  sessionFileSizeBytes: number;
  expectedChecksumSha256?: string;
}) {
  if (params.upload.byteLength !== params.sessionFileSizeBytes) {
    throw new Error("uploaded_object_size_mismatch");
  }

  if (params.upload.byteLength > params.requirement.max_file_size_bytes) {
    throw new Error("file_too_large");
  }

  ensureAllowedMimeType({
    acceptedMimeTypes: params.requirement.accepted_mime_types,
    sessionMimeType: params.sessionMimeType,
    storageContentType: params.upload.storageContentType,
    inferredContentType: params.upload.inferredContentType,
  });

  if (
    params.expectedChecksumSha256 &&
    params.upload.checksumSha256 !== params.expectedChecksumSha256.trim().toLowerCase()
  ) {
    throw new Error("uploaded_object_checksum_mismatch");
  }
}
