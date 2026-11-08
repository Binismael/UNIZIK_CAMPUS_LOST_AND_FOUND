-- Item photos are private: only the finder and a claimant whose claim was
-- approved can open them. Everyone else verifies ownership from the text listing.
drop policy if exists "Signed-in users view item photos" on storage.objects;

create policy "Finders and approved claimants view item photos" on storage.objects
  for select to authenticated using (
    bucket_id = 'item-photos'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or exists (
        select 1
        from public.items i
        join public.claims c on c.item_id = i.id
        where i.photo_path = storage.objects.name
          and c.claimant_id = (select auth.uid())
          and c.status = 'approved'
      )
    )
  );

create index if not exists items_photo_path_idx on public.items (photo_path) where photo_path is not null;
