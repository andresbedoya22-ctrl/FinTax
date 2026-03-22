"use client";

import * as React from "react";

const ENCRYPTION_SEED = "FinTax.AuthDraft.v1";

type StoredEncryptedDraft = {
  iv: string;
  payload: string;
};

function readSessionStorage(storageKey: string) {
  try {
    return window.sessionStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function writeSessionStorage(storageKey: string, value: string) {
  try {
    window.sessionStorage.setItem(storageKey, value);
    return true;
  } catch {
    return false;
  }
}

function removeSessionStorage(storageKey: string) {
  try {
    window.sessionStorage.removeItem(storageKey);
  } catch {
    // Ignore browser storage access failures.
  }
}

function bytesToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function deriveDraftKey(storageKey: string) {
  const encoder = new TextEncoder();
  const seedKey = await crypto.subtle.importKey("raw", encoder.encode(ENCRYPTION_SEED), "PBKDF2", false, [
    "deriveKey",
  ]);

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode(`fintax:${storageKey}`),
      iterations: 120_000,
      hash: "SHA-256",
    },
    seedKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptDraftPayload<T>(storageKey: string, value: T) {
  const key = await deriveDraftKey(storageKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(value));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);

  return {
    iv: bytesToBase64(iv),
    payload: bytesToBase64(new Uint8Array(encrypted)),
  } satisfies StoredEncryptedDraft;
}

export async function decryptDraftPayload<T>(storageKey: string, value: StoredEncryptedDraft) {
  const key = await deriveDraftKey(storageKey);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(value.iv) },
    key,
    base64ToBytes(value.payload),
  );

  return JSON.parse(new TextDecoder().decode(decrypted)) as T;
}

type UseEncryptedFormDraftOptions<T> = {
  storageKey: string;
  value: T;
  enabled?: boolean;
  onRestore?: (value: Partial<T>) => void;
};

export function useEncryptedFormDraft<T>({
  storageKey,
  value,
  enabled = true,
  onRestore,
}: UseEncryptedFormDraftOptions<T>) {
  const [hydrated, setHydrated] = React.useState(false);
  const onRestoreRef = React.useRef(onRestore);

  React.useEffect(() => {
    onRestoreRef.current = onRestore;
  }, [onRestore]);

  React.useEffect(() => {
    let active = true;

    const hydrate = async () => {
      if (!enabled || typeof window === "undefined" || !window.crypto?.subtle) {
        if (active) setHydrated(true);
        return;
      }

      const raw = readSessionStorage(storageKey);
      if (!raw) {
        if (active) setHydrated(true);
        return;
      }

      try {
        const parsed = JSON.parse(raw) as StoredEncryptedDraft;
        const draft = await decryptDraftPayload<Partial<T>>(storageKey, parsed);
        if (active) onRestoreRef.current?.(draft);
      } catch {
        removeSessionStorage(storageKey);
      } finally {
        if (active) setHydrated(true);
      }
    };

    void hydrate();

    return () => {
      active = false;
    };
  }, [enabled, storageKey]);

  React.useEffect(() => {
    let active = true;

    const persist = async () => {
      if (!enabled || !hydrated || typeof window === "undefined" || !window.crypto?.subtle) return;

      try {
        const encrypted = await encryptDraftPayload(storageKey, value);
        if (active) {
          writeSessionStorage(storageKey, JSON.stringify(encrypted));
        }
      } catch {
        // Ignore client-side draft persistence failures.
      }
    };

    void persist();

    return () => {
      active = false;
    };
  }, [enabled, hydrated, storageKey, value]);

  const clearDraft = React.useCallback(() => {
    if (typeof window === "undefined") return;
    removeSessionStorage(storageKey);
  }, [storageKey]);

  return { hydrated, clearDraft };
}
