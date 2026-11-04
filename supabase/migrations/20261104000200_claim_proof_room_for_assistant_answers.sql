alter table public.claims drop constraint claims_proof_text_check;
alter table public.claims add constraint claims_proof_text_check check (char_length(proof_text) between 20 and 1500);
