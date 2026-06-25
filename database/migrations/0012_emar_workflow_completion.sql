ALTER TABLE medication_administrations
  ADD COLUMN IF NOT EXISTS prn_effectiveness text,
  ADD COLUMN IF NOT EXISTS barcode_scanned text,
  ADD COLUMN IF NOT EXISTS barcode_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS controlled_substance_witness uuid REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS controlled_substance_count integer;

CREATE INDEX IF NOT EXISTS idx_medication_administrations_order
  ON medication_administrations (medication_order_id, administered_at DESC);

CREATE INDEX IF NOT EXISTS idx_medication_administrations_controlled_substance
  ON medication_administrations (controlled_substance_witness)
  WHERE controlled_substance_witness IS NOT NULL;
