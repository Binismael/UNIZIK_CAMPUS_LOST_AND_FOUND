alter table public.items
  add column location_lat double precision check (location_lat between -90 and 90),
  add column location_lng double precision check (location_lng between -180 and 180),
  add constraint items_pin_both_or_neither check ((location_lat is null) = (location_lng is null));
