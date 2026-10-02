-- Execute after ota_access.sql inside a transaction. Always roll back these fixtures.
do $$
declare
  owner_user uuid; admin_user uuid; other_user uuid;
  own_hotel uuid := gen_random_uuid(); other_hotel uuid := gen_random_uuid(); host_id uuid := gen_random_uuid();
  affected integer;
  own_request uuid := gen_random_uuid(); other_request uuid := gen_random_uuid();
  own_reservation uuid := gen_random_uuid(); other_reservation uuid := gen_random_uuid();
  policy_expression text; allowed boolean;
begin
  select id into owner_user from public.profiles where role='host' and active limit 1;
  select id into other_user from public.profiles where role='host' and active and id <> owner_user limit 1;
  select id into admin_user from public.profiles where role in ('admin','super_admin') and active limit 1;
  if owner_user is null or admin_user is null or other_user is null then raise exception 'Missing test role fixtures'; end if;
  insert into public.accommodations(id,name,slug,active) values
    (own_hotel,'OTA test own','ota-test-' || own_hotel,false),
    (other_hotel,'OTA test other','ota-test-' || other_hotel,false);
  insert into public.rooms(accommodation_id,name,slug,active) values(other_hotel,'Other existing room','ota-existing-room-' || other_hotel,true);
  insert into public.hosts(id,display_name,user_id,active) values(host_id,'OTA test owner',owner_user,true);
  insert into public.accommodation_hosts(accommodation_id,host_id) values(own_hotel,host_id);
  insert into public.requests(id,request_type,customer_name,customer_email,customer_whatsapp,target_type,target_id,target_slug) values
    (own_request,'accommodation','OTA fixture','fixture@example.test','000','accommodation',own_hotel,'ota-test-' || other_hotel),
    (other_request,'accommodation','OTA fixture','fixture@example.test','000','accommodation',other_hotel,'ota-test-' || own_hotel);
  insert into public.reservations(id,target_type,target_id,target_slug) values
    (own_reservation,'accommodation',own_hotel,'ota-test-' || other_hotel),
    (other_reservation,'accommodation',other_hotel,'ota-test-' || own_hotel);
  perform set_config('request.jwt.claim.sub', owner_user::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub',owner_user,'role','authenticated')::text,true);
  set local role authenticated;
  if public.is_admin() or not public.is_host_for_accommodation(own_hotel) or public.is_host_for_accommodation(other_hotel) then raise exception 'FAIL owner assignment'; end if;
  if (select count(*) from public.accommodations where id in (own_hotel,other_hotel)) <> 1 then raise exception 'FAIL private hotel isolation'; end if;
  update public.accommodations set name='OTA own edited' where id=own_hotel;
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'FAIL owner update'; end if;
  update public.accommodations set name='Unauthorized' where id=other_hotel;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'FAIL cross hotel update'; end if;
  begin
    update public.accommodations set featured=true where id=own_hotel;
    raise exception 'FAIL host changed ranking';
  exception when insufficient_privilege then null;
  end;
  insert into public.rooms(accommodation_id,name,slug,active) values(own_hotel,'Own room','ota-room-' || own_hotel,false);
  begin
    insert into public.rooms(accommodation_id,name,slug,active) values(other_hotel,'Unauthorized room','ota-room-' || other_hotel,false);
    raise exception 'FAIL cross hotel room';
  exception when insufficient_privilege then null;
  end;
  if (select count(*) from public.requests where id in (own_request,other_request)) <> 1 then raise exception 'FAIL requests UUID scope'; end if;
  if (select count(*) from public.reservations where id in (own_reservation,other_reservation)) <> 1 then raise exception 'FAIL reservations UUID scope'; end if;
  insert into public.calendar_blocks(target_type,target_id,starts_on,ends_on) values('accommodation',own_hotel,'2030-01-01','2030-01-02');
  begin
    insert into public.calendar_blocks(target_type,target_id,starts_on,ends_on) values('accommodation',other_hotel,'2030-01-01','2030-01-02');
    raise exception 'FAIL cross hotel calendar block';
  exception when insufficient_privilege then null;
  end;
  insert into public.owner_submissions(submission_type,status,payload) values('accommodation','draft','{}');
  begin
    insert into public.owner_submissions(submission_type,status,payload) values('accommodation','approved','{}');
    raise exception 'FAIL self-approved submission';
  exception when insufficient_privilege then null;
  end;
  select with_check into policy_expression from pg_policies where schemaname='storage' and policyname='ota_catalog_insert';
  execute 'select ' || policy_expression || ' from (select ''rooms''::text as bucket_id, $1::text as name) objects'
    into allowed using 'users/' || owner_user || '/rooms/test.jpg';
  if not allowed then raise exception 'FAIL own storage folder'; end if;
  execute 'select ' || policy_expression || ' from (select ''rooms''::text as bucket_id, $1::text as name) objects'
    into allowed using 'users/' || other_user || '/rooms/test.jpg';
  if allowed then raise exception 'FAIL other storage folder'; end if;
  select qual into policy_expression from pg_policies where schemaname='storage' and policyname='ota_private_documents_read';
  execute 'select ' || policy_expression || ' from (select ''documents''::text as bucket_id, $1::text as owner_id) objects'
    into allowed using other_user::text;
  if allowed then raise exception 'FAIL other private document'; end if;
  reset role;
  update public.hosts set active=false where id=host_id;
  set local role authenticated;
  if public.is_host_for_accommodation(own_hotel) then raise exception 'FAIL disabled responsible'; end if;
  if exists(select 1 from public.reservations where id=own_reservation) then raise exception 'FAIL inactive host reservation access'; end if;
  reset role;
  update public.hosts set active=true where id=host_id;
  update public.profiles set active=false where id=owner_user;
  set local role authenticated;
  if public.is_host_for_accommodation(own_hotel) then raise exception 'FAIL disabled account'; end if;
  update public.accommodations set name='Disabled edit' where id=own_hotel;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'FAIL disabled update'; end if;
  reset role;
  perform set_config('request.jwt.claim.sub', admin_user::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub',admin_user,'role','authenticated')::text,true);
  set local role authenticated;
  if not public.is_admin() then raise exception 'FAIL administrator'; end if;
  if (select count(*) from public.accommodations where id in (own_hotel,other_hotel)) <> 2 then raise exception 'FAIL admin hotel visibility'; end if;
  update public.accommodations set featured=true,active=true where id=own_hotel;
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'FAIL admin publication'; end if;
  reset role;
  perform set_config('request.jwt.claim.sub','',true);
  perform set_config('request.jwt.claims','{}',true);
  set local role anon;
  begin
    perform public.is_admin();
    raise exception 'FAIL anonymous RPC privilege';
  exception when insufficient_privilege then null;
  end;
  if (select count(*) from public.accommodations where id in (own_hotel,other_hotel)) <> 1 then raise exception 'FAIL public catalog'; end if;
  if exists(select 1 from public.rooms where accommodation_id=other_hotel) then raise exception 'FAIL unpublished hotel rooms'; end if;
  reset role;
end;
$$;
