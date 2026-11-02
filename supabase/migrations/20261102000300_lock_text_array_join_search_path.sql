-- Silence the mutable search_path advisor warning on the search helper.
alter function public.text_array_join(text[]) set search_path = '';
