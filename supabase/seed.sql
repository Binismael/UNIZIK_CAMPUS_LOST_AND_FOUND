-- Demo data: three finders, one demo student (chidi.eze@unizik.edu.ng / campus-demo-2026)
-- and 8 found items. Delete these accounts before a real launch.
do $$
declare
  u record;
begin
  for u in
    select * from (values
      ('a1111111-1111-4111-8111-111111111111'::uuid, 'ada.okafor@unizik.edu.ng', gen_random_uuid()::text,
        '{"full_name":"Ada Okafor","admission_number":"2021/LAW/0142","faculty":"Law","department":"Law","level":"300","residence":"Aroma Hostel","phone":"08031234567"}'::jsonb),
      ('b2222222-2222-4222-8222-222222222222'::uuid, 'tobe.nwosu@unizik.edu.ng', gen_random_uuid()::text,
        '{"full_name":"Tobe Nwosu","admission_number":"2020/ENG/0311","faculty":"Engineering","department":"Electrical Engineering","level":"400","residence":"Off campus","phone":"08059876543"}'::jsonb),
      ('c3333333-3333-4333-8333-333333333333'::uuid, 'ifeoma.eze@unizik.edu.ng', gen_random_uuid()::text,
        '{"full_name":"Ifeoma Eze","admission_number":"2022/SCI/0087","faculty":"Physical Sciences","department":"Computer Science","level":"200","residence":"Female Hostel A","phone":"07062223344"}'::jsonb),
      ('d4444444-4444-4444-8444-444444444444'::uuid, 'chidi.eze@unizik.edu.ng', 'campus-demo-2026',
        '{"full_name":"Chidi Eze","admission_number":"2022/SCI/0412","faculty":"Physical Sciences","department":"Computer Science","level":"300","residence":"Male Hostel A","phone":"08051112233"}'::jsonb)
    ) as t(id, email, password, meta)
  loop
    if not exists (select 1 from auth.users where id = u.id) then
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change
      ) values (
        '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
        extensions.crypt(u.password, extensions.gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}'::jsonb, u.meta, now(), now(),
        '', '', '', ''
      );
      insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      values (
        gen_random_uuid(), u.id, u.id::text,
        jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
        'email', now(), now(), now()
      );
    end if;
  end loop;
end $$;

insert into public.items (finder_id, title, category, colors, brand, marks, summary, location, status, found_at)
select * from (values
  ('b2222222-2222-4222-8222-222222222222'::uuid, 'Black Dell charger', 'Chargers', array['Black'], 'Dell', 'blue tape', 'Dell laptop charger with blue tape wrapped near the brick', 'Block C, Engineering', 'found'::public.item_status, now() - interval '2 hours'),
  ('c3333333-3333-4333-8333-333333333333'::uuid, 'Phone, cracked screen', 'Phones', array['Blue'], '', 'cracked corner', 'Smartphone in a blue case, top corner of the screen is cracked', 'Library, 2nd floor', 'found', now() - interval '5 hours'),
  ('a1111111-1111-4111-8111-111111111111'::uuid, 'Student ID card', 'IDs', array['Green'], '', 'Law faculty', 'Student ID card on a green lanyard, Law faculty', 'Main gate', 'found', now() - interval '1 day'),
  ('c3333333-3333-4333-8333-333333333333'::uuid, 'Black umbrella', 'Other', array['Black'], '', 'Wooden handle', 'Black folding umbrella with a wooden handle', 'Lecture hall 3', 'found', now() - interval '27 hours'),
  ('a1111111-1111-4111-8111-111111111111'::uuid, 'Laptop charger', 'Chargers', array['Black'], 'HP', '', 'Black HP laptop charger, round pin', 'Library, ground floor', 'found', now() - interval '3 days'),
  ('b2222222-2222-4222-8222-222222222222'::uuid, 'Phone charger', 'Chargers', array['Black'], '', 'braided cable', 'Black USB-C phone charger with braided cable', 'Hostel B gate', 'found', now() - interval '4 days'),
  ('b2222222-2222-4222-8222-222222222222'::uuid, 'Engineering Mathematics textbook', 'Books', array['Red'], 'K.A. Stroud', 'name torn off cover', 'Red Engineering Mathematics textbook, 7th edition, highlighted pages', 'Faculty of Engineering lecture theatre', 'found', now() - interval '2 days'),
  ('a1111111-1111-4111-8111-111111111111'::uuid, 'White earbuds case', 'Phones', array['White'], 'Apple', 'sticker on lid', 'White AirPods case with a small star sticker on the lid', 'Student Affairs office', 'found', now() - interval '6 hours')
) as v(finder_id, title, category, colors, brand, marks, summary, location, status, found_at)
where not exists (select 1 from public.items);
