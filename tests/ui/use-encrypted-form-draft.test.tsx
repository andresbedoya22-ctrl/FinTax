/// <reference types="vitest/globals" />

import { renderHook, waitFor } from "@testing-library/react";

import { useEncryptedFormDraft } from "@/hooks/useEncryptedFormDraft";

describe("useEncryptedFormDraft", () => {
  it("hydrates safely even when subtle crypto is unavailable", async () => {
    const originalCrypto = window.crypto;
    Object.defineProperty(window, "crypto", {
      value: {},
      configurable: true,
    });

    try {
      const onRestore = vi.fn();
      const { result } = renderHook(() =>
        useEncryptedFormDraft({
          storageKey: "draft:test",
          value: { email: "" },
          onRestore,
        }),
      );

      await waitFor(() => expect(result.current.hydrated).toBe(true));
      expect(onRestore).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(window, "crypto", {
        value: originalCrypto,
        configurable: true,
      });
    }
  });

  it("stays hydrated when session storage access throws", async () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    try {
      const onRestore = vi.fn();
      const { result } = renderHook(() =>
        useEncryptedFormDraft({
          storageKey: "draft:test",
          value: { email: "" },
          onRestore,
        }),
      );

      await waitFor(() => expect(result.current.hydrated).toBe(true));
      expect(onRestore).not.toHaveBeenCalled();
    } finally {
      getItem.mockRestore();
    }
  });
});
