SET check_function_bodies = false;
CREATE FUNCTION public.episodes_touch()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  new.updated_at := now();
  return new;
end;
$function$;
CREATE TABLE public.episode_goals (episode_id uuid NOT NULL, "position" smallint NOT NULL, sentence text NOT NULL, achieved_at timestamp with time zone);
ALTER TABLE public.episode_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episode_goals ADD CONSTRAINT episode_goals_pkey PRIMARY KEY (episode_id, "position");
ALTER TABLE public.episode_goals ADD CONSTRAINT episode_goals_position_range CHECK ("position" >= 1 AND "position" <= 3);
ALTER TABLE public.episode_goals ADD CONSTRAINT episode_goals_sentence_length CHECK (char_length(sentence) >= 1 AND char_length(sentence) <= 500);
REVOKE ALL ON public.episode_goals FROM anon;
REVOKE ALL ON public.episode_goals FROM authenticated;
GRANT SELECT ON public.episode_goals TO authenticated;
GRANT ALL ON public.episode_goals TO service_role;
CREATE TABLE public.episodes (id uuid DEFAULT gen_random_uuid() NOT NULL, user_id uuid NOT NULL, scenario_title text NOT NULL, scenario_description text NOT NULL, partner_role text NOT NULL, user_role text NOT NULL, status text DEFAULT 'active'::text NOT NULL, turn_limit integer NOT NULL, summary text, created_at timestamp with time zone DEFAULT now() NOT NULL, updated_at timestamp with time zone DEFAULT now() NOT NULL);
CREATE POLICY "own episode goals readable" ON public.episode_goals FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.episodes
  WHERE ((episodes.id = episode_goals.episode_id) AND (episodes.user_id = ( SELECT auth.uid() AS uid))))));
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ADD CONSTRAINT episodes_partner_role_length CHECK (char_length(partner_role) >= 1 AND char_length(partner_role) <= 200);
ALTER TABLE public.episodes ADD CONSTRAINT episodes_pkey PRIMARY KEY (id);
ALTER TABLE public.episode_goals ADD CONSTRAINT episode_goals_episode_id_fkey FOREIGN KEY (episode_id) REFERENCES public.episodes(id) ON DELETE CASCADE;
ALTER TABLE public.episodes ADD CONSTRAINT episodes_scenario_description_length CHECK (char_length(scenario_description) >= 1 AND char_length(scenario_description) <= 2000);
ALTER TABLE public.episodes ADD CONSTRAINT episodes_scenario_title_length CHECK (char_length(scenario_title) >= 1 AND char_length(scenario_title) <= 200);
ALTER TABLE public.episodes ADD CONSTRAINT episodes_status CHECK (status = ANY (ARRAY['active'::text, 'goals_met'::text, 'turns_exhausted'::text]));
ALTER TABLE public.episodes ADD CONSTRAINT episodes_summary_length CHECK (char_length(summary) >= 1 AND char_length(summary) <= 4000);
ALTER TABLE public.episodes ADD CONSTRAINT episodes_turn_limit_range CHECK (turn_limit >= 1 AND turn_limit <= 200);
ALTER TABLE public.episodes ADD CONSTRAINT episodes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.episodes ADD CONSTRAINT episodes_user_role_length CHECK (char_length(user_role) >= 1 AND char_length(user_role) <= 200);
REVOKE ALL ON public.episodes FROM anon;
REVOKE ALL ON public.episodes FROM authenticated;
GRANT DELETE, SELECT ON public.episodes TO authenticated;
GRANT ALL ON public.episodes TO service_role;
CREATE INDEX episodes_user_updated_idx ON public.episodes (user_id, updated_at DESC);
CREATE TRIGGER episodes_touch BEFORE UPDATE ON public.episodes FOR EACH ROW EXECUTE FUNCTION public.episodes_touch();
CREATE POLICY "own episodes deletable" ON public.episodes FOR DELETE TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY "own episodes readable" ON public.episodes FOR SELECT TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id));
