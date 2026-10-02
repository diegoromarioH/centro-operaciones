-- Run after ota_access.sql. All writes go through authenticated RPCs.
begin;
create schema if not exists private;
grant usage on schema private to authenticated;
alter table public.owner_submissions add column if not exists accommodation_id uuid references public.accommodations(id) on delete restrict;
alter table public.owner_submissions enable row level security;
drop policy if exists owner_manage_own_submissions on public.owner_submissions;
drop policy if exists listing_submission_read on public.owner_submissions;
create policy listing_submission_read on public.owner_submissions for select to authenticated using (public.is_admin() or (owner_id=auth.uid() and exists(select 1 from public.profiles p where p.id=auth.uid() and p.active and p.role='host')));
revoke insert,update,delete on public.owner_submissions from anon,authenticated;
grant select on public.owner_submissions to authenticated;

create or replace function private.validate_listing_payload(p jsonb) returns void language plpgsql set search_path='' as $$
declare k text; price numeric; deposit numeric;
begin
 if jsonb_typeof(p) <> 'object' then raise exception 'La ficha debe ser un objeto.'; end if;
 foreach k in array array['name','accommodation_type','description','address','zone','main_image_url','currency','payment_policy','cancellation_policy'] loop
  if nullif(btrim(p->>k),'') is null then raise exception 'Completa el campo %.',k; end if;
 end loop;
 price:=(p->>'price_from')::numeric;
 if price is null or price<=0 or price::text in ('NaN','Infinity','-Infinity') then raise exception 'El precio debe ser mayor que cero.'; end if;
 if p->>'currency' not in ('USD','NIO') then raise exception 'Moneda no admitida.'; end if;
 if coalesce((p->>'deposit_required')::boolean,false) then
  deposit:=(p->>'deposit_percent')::numeric;
  if deposit is null or deposit<=0 or deposit>100 or deposit::text in ('NaN','Infinity','-Infinity') then raise exception 'Depósito inválido.'; end if;
 end if;
end $$;

create or replace function private.save_listing_submission(submission_id uuid,listing_payload jsonb,send_for_review boolean default false) returns public.owner_submissions language plpgsql security definer set search_path='' as $$
declare result public.owner_submissions; clean jsonb;
begin
 if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and active and role='host') then raise exception 'Acceso de anfitrión requerido.'; end if;
 if jsonb_typeof(listing_payload) is distinct from 'object' or octet_length(listing_payload::text)>100000 then raise exception 'Ficha inválida o demasiado grande.'; end if;
 select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) into clean from jsonb_each(listing_payload) where key=any(array['name','accommodation_type','short_description','description','amenities','ideal_for','views','zone','municipality','address','latitude','longitude','map_embed_url','price_from','currency','deposit_required','deposit_percent','payment_policy','check_in_time','check_out_time','reservation_policy','cancellation_policy','refund_policy','children_policy','pet_policy','smoking_policy','events_policy','main_image_url','video_url']);
 if send_for_review then perform private.validate_listing_payload(clean); end if;
 if submission_id is null then
  insert into public.owner_submissions(owner_id,submission_type,payload,status,submitted_at) values(auth.uid(),'accommodation',clean,case when send_for_review then 'submitted' else 'draft' end,case when send_for_review then now() end) returning * into result;
 else
  select * into result from public.owner_submissions where id=submission_id and owner_id=auth.uid() and submission_type='accommodation' for update;
  if not found or result.status not in ('draft','changes_requested') then raise exception 'Esta solicitud ya no se puede editar.'; end if;
  update public.owner_submissions set payload=clean,status=case when send_for_review then 'submitted' else result.status end,submitted_at=case when send_for_review then now() else submitted_at end,updated_at=now() where id=submission_id returning * into result;
 end if;
 return result;
end $$;

create or replace function private.review_listing_submission(submission_id uuid,decision text,review_note text default '') returns uuid language plpgsql security definer set search_path='' as $$
declare item public.owner_submissions; host_id uuid; listing_id uuid; k text; assignments text[]:='{}';
begin
 if not public.is_admin() then raise exception 'Solo la OTA puede revisar alojamientos.'; end if;
 if decision not in ('approved','changes_requested','rejected') or decision is null then raise exception 'Decisión inválida.'; end if;
 if decision<>'approved' and nullif(btrim(review_note),'') is null then raise exception 'Explica la decisión al anfitrión.'; end if;
 select * into item from public.owner_submissions where id=submission_id and submission_type='accommodation' for update;
 if not found or item.status<>'submitted' then raise exception 'La solicitud ya fue revisada o no está enviada.'; end if;
 if decision='approved' then
  perform private.validate_listing_payload(item.payload);
  if not exists(select 1 from public.profiles where id=item.owner_id and active and role='host') then raise exception 'El anfitrión está inactivo.'; end if;
  select id into strict host_id from public.hosts where user_id=item.owner_id and active;
  listing_id:=gen_random_uuid();
  insert into public.accommodations(id,name,slug,currency,active) values(listing_id,item.payload->>'name','alojamiento-'||listing_id::text,item.payload->>'currency',false);
  -- Identifiers come only from a fixed whitelist. User values remain parameters.
  for k in select key from jsonb_each(item.payload) where key=any(array['name','accommodation_type','short_description','description','amenities','ideal_for','views','zone','municipality','address','latitude','longitude','map_embed_url','price_from','currency','deposit_required','deposit_percent','payment_policy','check_in_time','check_out_time','reservation_policy','cancellation_policy','refund_policy','children_policy','pet_policy','smoking_policy','events_policy','main_image_url','video_url']) loop
   assignments:=array_append(assignments,format('%I = (jsonb_populate_record(null::public.accommodations,$1)).%I',k,k));
  end loop;
  execute 'update public.accommodations set '||array_to_string(assignments,',')||' where id=$2' using item.payload,listing_id;
  insert into public.accommodation_hosts(accommodation_id,host_id,is_primary) values(listing_id,host_id,true);
 end if;
 update public.owner_submissions set status=decision,reviewer_id=auth.uid(),review_notes=left(coalesce(review_note,''),4000),reviewed_at=now(),updated_at=now(),accommodation_id=listing_id where id=submission_id;
 return listing_id;
end $$;
revoke all on function private.validate_listing_payload(jsonb) from public,anon,authenticated;
revoke all on function private.save_listing_submission(uuid,jsonb,boolean) from public,anon;
revoke all on function private.review_listing_submission(uuid,text,text) from public,anon;
grant execute on function private.save_listing_submission(uuid,jsonb,boolean) to authenticated;
grant execute on function private.review_listing_submission(uuid,text,text) to authenticated;
create or replace function public.save_listing_submission(submission_id uuid,listing_payload jsonb,send_for_review boolean default false) returns public.owner_submissions language sql security invoker set search_path='' as $$ select private.save_listing_submission(submission_id,listing_payload,send_for_review); $$;
create or replace function public.review_listing_submission(submission_id uuid,decision text,review_note text default '') returns uuid language sql security invoker set search_path='' as $$ select private.review_listing_submission(submission_id,decision,review_note); $$;
revoke all on function public.save_listing_submission(uuid,jsonb,boolean) from public,anon;
revoke all on function public.review_listing_submission(uuid,text,text) from public,anon;
grant execute on function public.save_listing_submission(uuid,jsonb,boolean) to authenticated;
grant execute on function public.review_listing_submission(uuid,text,text) to authenticated;
commit;
