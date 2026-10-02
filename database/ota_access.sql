-- Reviewed OTA access patch. Proposed Supabase migration name: ota_hotel_access.
-- Execute atomically with the matching UI and Edge Function release; not yet applied to production.
-- Existing public catalog reads remain available. No records are deleted.
create schema if not exists private;
grant usage on schema private to authenticated, anon;

create unique index if not exists ota_one_host_per_account on public.hosts(user_id) where user_id is not null;
create unique index if not exists ota_one_primary_per_hotel on public.accommodation_hosts(accommodation_id) where is_primary;
create index if not exists ota_hotel_host_lookup on public.accommodation_hosts(host_id,accommodation_id);

create or replace function private.panel_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.profiles where id = auth.uid() and active and role in ('admin','super_admin')
  );
$$;
create or replace function private.active_host_for_accommodation(acc_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.accommodation_hosts ah
    join public.hosts h on h.id = ah.host_id
    join public.profiles p on p.id = h.user_id
    where ah.accommodation_id = acc_id and h.user_id = auth.uid()
      and h.active and p.active and p.role = 'host'
  );
$$;
create or replace function private.active_profile()
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (select 1 from public.profiles where id = auth.uid() and active);
$$;
revoke all on function private.panel_admin(), private.active_host_for_accommodation(uuid), private.active_profile() from public;
grant execute on function private.panel_admin(), private.active_host_for_accommodation(uuid), private.active_profile() to authenticated, anon;

-- Keep existing policy dependencies; the exposed wrappers no longer run with elevated privileges.
create or replace function public.is_admin()
returns boolean language sql stable security invoker set search_path = '' as $$
  select private.panel_admin();
$$;
create or replace function public.is_host_for_accommodation(acc_id uuid)
returns boolean language sql stable security invoker set search_path = '' as $$
  select private.active_host_for_accommodation(acc_id);
$$;

create policy ota_rooms_public_parent on public.rooms as restrictive for select to anon using (
  exists(select 1 from public.accommodations a where a.id=rooms.accommodation_id and a.active)
);
create policy ota_rooms_authenticated_parent on public.rooms as restrictive for select to authenticated using (
  public.is_admin() or public.is_host_for_accommodation(accommodation_id)
    or exists(select 1 from public.accommodations a where a.id=rooms.accommodation_id and a.active)
);

-- Publication, ranking and attribution remain administrator-controlled even via direct API calls.
create or replace function private.guard_hotel_admin_fields()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare editable text[] := array[
  'name','accommodation_type','short_description','description','amenities','ideal_for','views',
  'zone','municipality','address','latitude','longitude','map_embed_url','price_from','currency',
  'deposit_required','deposit_percent','payment_policy','check_in_time','check_out_time',
  'reservation_policy','cancellation_policy','refund_policy','children_policy','pet_policy',
  'smoking_policy','events_policy','main_image_url','video_url','updated_at'
];
begin
  if current_user in ('postgres','service_role','supabase_admin') or private.panel_admin() then return new; end if;
  if (to_jsonb(new) - editable) is distinct from (to_jsonb(old) - editable) then
    raise exception 'Solo un administrador puede modificar publicación, slug, ranking o datos internos.' using errcode = '42501';
  end if;
  return new;
end;
$$;
revoke all on function private.guard_hotel_admin_fields() from public;
drop trigger if exists guard_hotel_admin_fields on public.accommodations;
create trigger guard_hotel_admin_fields before update on public.accommodations for each row execute function private.guard_hotel_admin_fields();

-- Deny private operational data to disabled accounts, regardless of old permissive policies.
create policy ota_active_requests on public.requests as restrictive for select to authenticated using (private.active_profile());
create policy ota_active_reservations on public.reservations as restrictive for select to authenticated using (private.active_profile());
create policy ota_active_host_links on public.accommodation_hosts as restrictive for select to authenticated using (private.active_profile());

-- Resolve requests by UUID first; slug fallback is only for legacy rows without UUIDs.
alter policy host_read_own_requests on public.requests using (
  target_type = 'accommodation' and exists (
    select 1 from public.accommodations a
    where (a.id = requests.target_id or (requests.target_id is null and a.slug = requests.target_slug))
      and public.is_host_for_accommodation(a.id)
  )
);

-- Restrict catalog writes in Storage without changing public image URLs or unrelated private buckets.
create policy ota_catalog_insert on storage.objects as restrictive for insert to authenticated with check (
  bucket_id <> all(array['branding','home','gallery','accommodations','rooms','experiences','blog','events','media','guides','destinations'])
  or public.is_admin()
  or (bucket_id in ('accommodations','rooms') and private.active_profile()
    and exists (select 1 from public.hosts h where h.user_id = auth.uid() and h.active)
    and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text)
);
create policy ota_catalog_update on storage.objects as restrictive for update to authenticated using (
  bucket_id <> all(array['branding','home','gallery','accommodations','rooms','experiences','blog','events','media','guides','destinations'])
  or public.is_admin()
  or (bucket_id in ('accommodations','rooms') and private.active_profile()
    and exists (select 1 from public.hosts h where h.user_id = auth.uid() and h.active)
    and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text)
) with check (
  bucket_id <> all(array['branding','home','gallery','accommodations','rooms','experiences','blog','events','media','guides','destinations'])
  or public.is_admin()
  or (bucket_id in ('accommodations','rooms') and private.active_profile()
    and exists (select 1 from public.hosts h where h.user_id = auth.uid() and h.active)
    and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text)
);
create policy ota_catalog_delete on storage.objects as restrictive for delete to authenticated using (
  bucket_id <> all(array['branding','home','gallery','accommodations','rooms','experiences','blog','events','media','guides','destinations'])
  or public.is_admin()
  or (bucket_id in ('accommodations','rooms') and private.active_profile()
    and exists (select 1 from public.hosts h where h.user_id = auth.uid() and h.active)
    and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text)
);

create or replace function private.owns_target(kind text, target uuid, slug text default null)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.profiles p where p.id=auth.uid() and p.active and p.role='host'
  ) and case kind
    when 'accommodation' then exists (
      select 1 from public.accommodations a where
        (a.id=target or (target is null and a.slug=slug)) and private.active_host_for_accommodation(a.id)
    )
    when 'room' then exists (
      select 1 from public.rooms r where r.id=target and private.active_host_for_accommodation(r.accommodation_id)
    )
    when 'experience' then exists (
      select 1 from public.experiences e join public.experience_hosts eh on eh.experience_id=e.id
      join public.hosts h on h.id=eh.host_id
      where (e.id=target or (target is null and e.slug=slug)) and h.user_id=auth.uid() and h.active
    )
    else false end;
$$;
revoke all on function private.owns_target(text,uuid,text) from public;
grant execute on function private.owns_target(text,uuid,text) to authenticated;

-- Old ownership policies must also respect active hotel assignments.
create policy ota_request_scope on public.requests as restrictive for select to authenticated using (
  public.is_admin() or user_id=auth.uid() or private.owns_target(target_type,target_id,target_slug)
);
create policy ota_reservation_scope on public.reservations as restrictive for select to authenticated using (
  public.is_admin() or private.owns_target(target_type,target_id,target_slug)
);
create policy ota_calendar_connections on public.calendar_connections as restrictive for all to authenticated using (
  public.is_admin() or (owner_id=auth.uid() and private.owns_target(target_type,target_id))
) with check (
  public.is_admin() or (owner_id=auth.uid() and private.owns_target(target_type,target_id))
);
create policy ota_calendar_blocks on public.calendar_blocks as restrictive for all to authenticated using (
  public.is_admin() or (owner_id=auth.uid() and private.owns_target(target_type,target_id))
) with check (
  public.is_admin() or (owner_id=auth.uid() and private.owns_target(target_type,target_id)
    and (connection_id is null or exists (
      select 1 from public.calendar_connections c where c.id=connection_id
        and c.owner_id=auth.uid() and c.target_id=calendar_blocks.target_id and c.target_type=calendar_blocks.target_type
    )))
);

-- An owner may submit a draft but cannot approve their own application.
create policy ota_submission_insert on public.owner_submissions as restrictive for insert to authenticated with check (
  public.is_admin() or (private.active_profile() and owner_id=auth.uid() and status in ('draft','submitted')
    and reviewer_id is null and review_notes is null and reviewed_at is null)
);
create policy ota_submission_update on public.owner_submissions as restrictive for update to authenticated using (
  public.is_admin() or (private.active_profile() and owner_id=auth.uid() and status in ('draft','submitted','changes_requested','rejected'))
) with check (
  public.is_admin() or (private.active_profile() and owner_id=auth.uid() and status in ('draft','submitted'))
);
create policy ota_submission_delete on public.owner_submissions as restrictive for delete to authenticated using (
  public.is_admin() or (private.active_profile() and owner_id=auth.uid() and status='draft')
);
create or replace function private.guard_submission_review()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if current_user in ('postgres','service_role','supabase_admin') or private.panel_admin() then return new; end if;
  if new.reviewer_id is distinct from old.reviewer_id or new.review_notes is distinct from old.review_notes
    or new.reviewed_at is distinct from old.reviewed_at or new.owner_id is distinct from old.owner_id then
    raise exception 'La revisión de la solicitud corresponde al administrador.' using errcode='42501';
  end if;
  return new;
end;
$$;
revoke all on function private.guard_submission_review() from public;
create trigger ota_guard_submission_review before update on public.owner_submissions for each row execute function private.guard_submission_review();

-- Private documents must never inherit the broad authenticated Storage read policy.
create policy ota_private_documents_read on storage.objects as restrictive for select to authenticated using (
  bucket_id <> 'documents' or public.is_admin() or (private.active_profile() and owner_id=auth.uid()::text)
);
create policy ota_private_documents_insert on storage.objects as restrictive for insert to authenticated with check (
  bucket_id <> 'documents' or public.is_admin() or (private.active_profile()
    and (storage.foldername(name))[1]='users' and (storage.foldername(name))[2]=auth.uid()::text)
);
create policy ota_private_documents_update on storage.objects as restrictive for update to authenticated using (
  bucket_id <> 'documents' or public.is_admin() or (private.active_profile() and owner_id=auth.uid()::text)
) with check (
  bucket_id <> 'documents' or public.is_admin() or (private.active_profile() and owner_id=auth.uid()::text
    and (storage.foldername(name))[1]='users' and (storage.foldername(name))[2]=auth.uid()::text)
);
create policy ota_private_documents_delete on storage.objects as restrictive for delete to authenticated using (
  bucket_id <> 'documents' or public.is_admin() or (private.active_profile() and owner_id=auth.uid()::text)
);
