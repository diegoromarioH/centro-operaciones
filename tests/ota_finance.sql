-- Execute ota_access.sql + ota_finance.sql + this file in one transaction, then ROLLBACK.
do $$
declare admin_user uuid; host_user uuid; accommodation uuid; reservation uuid:=gen_random_uuid(); charge uuid; payment uuid;
begin
 select id into admin_user from public.profiles where active and role in ('admin','super_admin') limit 1;
 select id into host_user from public.profiles where active and role='host' limit 1;
 select id into accommodation from public.accommodations limit 1;
 perform set_config('request.jwt.claim.sub',admin_user::text,true);
 perform set_config('request.jwt.claims',json_build_object('sub',admin_user,'role','authenticated')::text,true);
 set local role authenticated;
 insert into public.reservations(id,target_type,target_id,customer_name,starts_on,ends_on,total_amount,commission_percent,currency,status)
 values(reservation,'accommodation',accommodation,'Finance test','2030-01-01','2030-01-02',100,10,'USD','completed');
 if (select commission_amount from public.reservations where id=reservation)<>10 then raise exception 'FAIL commission'; end if;
 insert into public.ota_commission_charges(reservation_id,due_on) values(reservation,'2030-01-03') returning id into charge;
 if (select amount from public.ota_commission_charges where id=charge)<>10 then raise exception 'FAIL charge snapshot'; end if;
 begin
  insert into public.ota_commission_charges(reservation_id,due_on) values(reservation,'2030-01-03');
  raise exception 'FAIL duplicate';
 exception when unique_violation then null; end;
 insert into public.ota_commission_payments(charge_id,amount,paid_on,method,reference) values(charge,4,'2030-01-03','cash','receipt test') returning id into payment;
 begin
  insert into public.ota_commission_payments(charge_id,amount,paid_on,method,reference) values(charge,7,'2030-01-03','cash','overpay test');
  raise exception 'FAIL overpay';
 exception when raise_exception then if SQLERRM like 'FAIL%' then raise; end if; end;
 begin
  update public.reservations set total_amount=120 where id=reservation;
  raise exception 'FAIL mutate billed reservation';
 exception when raise_exception then if SQLERRM like 'FAIL%' then raise; end if; end;
 begin
  delete from public.reservations where id=reservation;
  raise exception 'FAIL delete reservation';
 exception when raise_exception then if SQLERRM like 'FAIL%' then raise; end if; end;
 begin
  update public.ota_commission_charges set status='void',void_reason='test' where id=charge;
  raise exception 'FAIL void with payment';
 exception when raise_exception then if SQLERRM like 'FAIL%' then raise; end if; end;
 begin
  update public.ota_commission_payments set amount=1 where id=payment;
  raise exception 'FAIL edit payment';
 exception when raise_exception then if SQLERRM like 'FAIL%' then raise; end if; end;
 begin
  update public.ota_commission_payments set status='void' where id=payment;
  raise exception 'FAIL no void reason';
 exception when check_violation then null; end;
 update public.ota_commission_payments set status='void',void_reason='Test reversal' where id=payment;
 insert into public.ota_commission_payments(charge_id,amount,paid_on,method,reference) values(charge,10,'2030-01-03','transfer','test full settlement');
 reset role;
 perform set_config('request.jwt.claim.sub',host_user::text,true);
 perform set_config('request.jwt.claims',json_build_object('sub',host_user,'role','authenticated')::text,true);
 set local role authenticated;
 if exists(select 1 from public.ota_commission_charges) or exists(select 1 from public.ota_commission_payments) then raise exception 'FAIL host finance access'; end if;
 begin
  insert into public.ota_commission_charges(reservation_id,due_on) values(reservation,'2030-01-03');
  raise exception 'FAIL host finance write';
 exception when insufficient_privilege then null; end;
 reset role;
 set local role anon;
 begin
  perform * from public.ota_commission_charges;
  raise exception 'FAIL anon finance';
 exception when insufficient_privilege then null; end;
 reset role;
end $$;
select 'Finance checks passed; rollback follows' as result;
