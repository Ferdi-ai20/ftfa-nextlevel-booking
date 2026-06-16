
REVOKE EXECUTE ON FUNCTION public.guest_booking_email_count_24h(text) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.guest_booking_email_count_24h(text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.get_slot_price(uuid) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_slot_price(uuid, numeric) FROM public, anon;

DO $$
DECLARE r RECORD;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    FOR r IN SELECT jobid, jobname FROM cron.job
             WHERE jobname ILIKE '%auto-publish%'
                OR jobname ILIKE '%auto_publish%'
                OR command  ILIKE '%auto-publish-slots%'
    LOOP
      PERFORM cron.unschedule(r.jobid);
      RAISE NOTICE 'Unscheduled cron job: % (id=%)', r.jobname, r.jobid;
    END LOOP;
  END IF;
END $$;
