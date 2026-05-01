-- Fix user registration trigger: explicitly set search_path and use public.exam_class

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, exam_class, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'exam_class', '')::public.exam_class, 'dakhil'::public.exam_class),
    FALSE
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    exam_class = EXCLUDED.exam_class;

  INSERT INTO public.user_roles (user_id, role) 
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
