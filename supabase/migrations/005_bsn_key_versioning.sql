ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bsn_key_id TEXT,
  ADD COLUMN IF NOT EXISTS bsn_ciphertext TEXT;

UPDATE public.profiles
SET
  bsn_key_id = COALESCE(bsn_key_id, 'v1'),
  bsn_ciphertext = COALESCE(
    bsn_ciphertext,
    CASE
      WHEN bsn_encrypted LIKE 'v1:%' THEN substring(bsn_encrypted FROM 4)
      ELSE bsn_encrypted
    END
  )
WHERE bsn_encrypted IS NOT NULL;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_bsn_key_ciphertext_consistency;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_bsn_key_ciphertext_consistency CHECK (
    (bsn_key_id IS NULL AND bsn_ciphertext IS NULL)
    OR
    (bsn_key_id IS NOT NULL AND bsn_ciphertext IS NOT NULL)
  );
