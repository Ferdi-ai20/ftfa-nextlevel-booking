
-- Recreate training_type enum with correct values
ALTER TYPE public.training_type RENAME TO training_type_old;

CREATE TYPE public.training_type AS ENUM (
  'one_on_one', 'duo', 'small_group', 'bvo_small_group', 'trial'
);

-- Update the column on training_slots to use new enum.
-- Since there's no data, a USING expression with a fallback works.
ALTER TABLE public.training_slots
  ALTER COLUMN training_type TYPE public.training_type
  USING (
    CASE training_type::text
      WHEN '1-on-1' THEN 'one_on_one'
      WHEN 'Duo' THEN 'duo'
      WHEN 'Group' THEN 'small_group'
      ELSE 'one_on_one'
    END
  )::public.training_type;

DROP TYPE public.training_type_old;
