SET check_function_bodies = false;
CREATE FUNCTION public.set_app_version_policy_timestamps()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  new.created_at := old.created_at;
  if row(new.platform, new.distribution, new.minimum_version, new.install_url)
    is distinct from row(old.platform, old.distribution, old.minimum_version, old.install_url) then
    new.updated_at := clock_timestamp();
  else
    new.updated_at := old.updated_at;
  end if;
  return new;
end;
$function$;
COMMENT ON FUNCTION public.set_app_version_policy_timestamps() IS 'Keeps policy creation time fixed and stamps actual policy changes.';
REVOKE ALL ON FUNCTION public.set_app_version_policy_timestamps() FROM PUBLIC, anon, authenticated, service_role;
ALTER TABLE public.app_version_policies ADD COLUMN created_at timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE public.app_version_policies ADD COLUMN updated_at timestamp with time zone DEFAULT now() NOT NULL;
CREATE TRIGGER app_version_policies_set_timestamps BEFORE UPDATE ON public.app_version_policies FOR EACH ROW EXECUTE FUNCTION public.set_app_version_policy_timestamps();
