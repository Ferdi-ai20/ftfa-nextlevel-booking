REVOKE ALL ON FUNCTION public.auto_create_application_from_guest_booking() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auto_create_application_from_guest_booking() FROM anon;
REVOKE ALL ON FUNCTION public.auto_create_application_from_guest_booking() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.auto_create_application_from_guest_booking() TO service_role;