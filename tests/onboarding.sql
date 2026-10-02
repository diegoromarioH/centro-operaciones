\set ON_ERROR_STOP on
create role anon;
create role authenticated;
create schema auth;
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth to authenticated;
create table profiles(id uuid primary key,role text,active boolean);
create table hosts(id uuid primary key,user_id uuid,active boolean);
create table accommodations(id uuid primary key default gen_random_uuid(),name text not null,slug text unique not null,currency text default 'USD',active boolean default true,accommodation_type text,description text,address text,zone text,main_image_url text,payment_policy text,cancellation_policy text,price_from numeric,deposit_required boolean,deposit_percent numeric);
create table accommodation_hosts(accommodation_id uuid references accommodations,host_id uuid references hosts,is_primary boolean);
create table owner_submissions(id uuid primary key default gen_random_uuid(),owner_id uuid,submission_type text,status text default 'draft',payload jsonb,reviewer_id uuid,review_notes text,submitted_at timestamptz,reviewed_at timestamptz,created_at timestamptz default now(),updated_at timestamptz default now());
create function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.profiles where id=auth.uid() and active and role='admin')$$;
grant select on profiles to authenticated;
\i database/ota_onboarding.sql
insert into profiles values ('00000000-0000-0000-0000-000000000001','host',true),('00000000-0000-0000-0000-000000000002','host',true),('00000000-0000-0000-0000-000000000003','admin',true);
insert into hosts values('00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001',true);
set role authenticated;
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000001';
select (public.save_listing_submission(null,'{"name":"Casa","accommodation_type":"Casa","description":"Casa Ometepe","address":"Moyogalpa","zone":"Moyogalpa","main_image_url":"https://example.com/foto.jpg","currency":"USD","price_from":40,"payment_policy":"Efectivo al llegar","cancellation_policy":"48 horas","active":true}',true)).id as submission_id \gset
select set_config('test.submission_id',:'submission_id',false);
do $$begin
 if exists(select 1 from owner_submissions where payload ? 'active') then raise exception 'Host injected visibility';end if;
 begin perform public.review_listing_submission(current_setting('test.submission_id')::uuid,'approved','');raise exception 'Host approved own listing';exception when raise_exception then if SQLERRM='Host approved own listing' then raise;end if;end;
 begin update owner_submissions set status='approved';raise exception 'Direct update allowed';exception when insufficient_privilege then null;end;
end$$;
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000002';
do $$begin
 if exists(select 1 from owner_submissions) then raise exception 'Other host read draft';end if;
 begin perform public.save_listing_submission(current_setting('test.submission_id')::uuid,'{}',false);raise exception 'Other host edited draft';exception when raise_exception then if SQLERRM='Other host edited draft' then raise;end if;end;
end$$;
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000003';
select public.review_listing_submission(:'submission_id','approved','Ficha aprobada');
do $$begin
 begin perform public.review_listing_submission(current_setting('test.submission_id')::uuid,'approved','');raise exception 'Duplicate approval allowed';exception when raise_exception then if SQLERRM='Duplicate approval allowed' then raise;end if;end;
end$$;
reset role;
do $$begin
 if (select count(*) from accommodations)<>1 or exists(select 1 from accommodations where active) or (select count(*) from accommodation_hosts)<>1 then raise exception 'Approval did not create one hidden linked listing';end if;
 if has_function_privilege('anon','public.review_listing_submission(uuid,text,text)','EXECUTE') then raise exception 'Anonymous RPC allowed';end if;
end$$;
select 'Onboarding permission and approval checks passed' as result;
