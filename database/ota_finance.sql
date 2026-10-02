-- Apply after ota_access.sql, as a single transaction before deploying frontend.
-- No existing reservation, payment, operator or commercial agreement is inferred.
alter table public.boat_schedules add column operator_id uuid references public.boat_operators(id) on delete restrict;
create index boat_schedules_operator_route_idx on public.boat_schedules(operator_id,route_id,departure_time);
create table public.ota_commission_charges (
 id uuid primary key default gen_random_uuid(),
 reservation_id uuid not null unique references public.reservations(id) on delete restrict,
 accommodation_id uuid not null references public.accommodations(id) on delete restrict,
 amount numeric(14,2) not null check(amount > 0),
 currency text not null check(currency in ('USD','NIO')),
 due_on date not null,
 status text not null default 'open' check(status in ('open','void')),
 void_reason text,
 voided_by uuid references auth.users(id),
 voided_at timestamptz,
 created_by uuid not null default auth.uid() references auth.users(id),
 created_at timestamptz not null default now(),
 check(status <> 'void' or (void_reason is not null and length(trim(void_reason)) > 0))
);
create index ota_charges_accommodation_idx on public.ota_commission_charges(accommodation_id,due_on);
create index ota_charges_voided_by_idx on public.ota_commission_charges(voided_by);
create index ota_charges_created_by_idx on public.ota_commission_charges(created_by);
create table public.ota_commission_payments (
 id uuid primary key default gen_random_uuid(),
 charge_id uuid not null references public.ota_commission_charges(id) on delete restrict,
 amount numeric(14,2) not null check(amount > 0),
 paid_on date not null,
 method text not null check(method in ('transfer','cash','deposit')),
 reference text not null check(length(trim(reference)) > 0),
 status text not null default 'confirmed' check(status in ('confirmed','void')),
 void_reason text,
 voided_by uuid references auth.users(id),
 voided_at timestamptz,
 created_by uuid not null default auth.uid() references auth.users(id),
 created_at timestamptz not null default now(),
 check(status <> 'void' or (void_reason is not null and length(trim(void_reason)) > 0))
);
create index ota_payments_charge_idx on public.ota_commission_payments(charge_id);
create index ota_payments_voided_by_idx on public.ota_commission_payments(voided_by);
create index ota_payments_created_by_idx on public.ota_commission_payments(created_by);
alter table public.ota_commission_charges enable row level security;
alter table public.ota_commission_payments enable row level security;
revoke all on public.ota_commission_charges, public.ota_commission_payments from anon, authenticated;
grant select,insert,update on public.ota_commission_charges, public.ota_commission_payments to authenticated;
create policy ota_charges_admin on public.ota_commission_charges to authenticated using(public.is_admin()) with check(public.is_admin());
create policy ota_payments_admin on public.ota_commission_payments to authenticated using(public.is_admin()) with check(public.is_admin());

create function private.guard_ota_reservation() returns trigger language plpgsql set search_path = '' as $$
begin
 if TG_OP = 'DELETE' then raise exception 'Las reservas no se eliminan. Usa el estado cancelled.'; end if;
 if TG_OP = 'UPDATE' and exists(select 1 from public.ota_commission_charges where reservation_id=old.id) then
  if (to_jsonb(new) - 'updated_at' - 'payment_status') is distinct from (to_jsonb(old) - 'updated_at' - 'payment_status') then
   raise exception 'Reserva con cobro emitido: conserva su base histórica. Anula el cobro con motivo para corregir fuera de este flujo.';
  end if;
  return new;
 end if;
 if TG_OP='INSERT' and new.request_id is not null then
  perform 1 from public.requests where id=new.request_id for update;
  if exists(select 1 from public.reservations where request_id=new.request_id) then raise exception 'Esta solicitud ya tiene una reserva registrada.'; end if;
 end if;
 if new.target_type='accommodation' and (new.target_id is null or new.customer_name is null or trim(new.customer_name)='' or new.starts_on is null or new.ends_on is null or new.total_amount is null) then
  raise exception 'La reserva requiere alojamiento, huésped, fechas y monto.';
 end if;
 if new.total_amount < 0 or new.commission_percent < 0 or new.commission_percent > 100 then raise exception 'Monto o porcentaje inválido.'; end if;
 if new.ends_on < new.starts_on then raise exception 'La salida no puede ser anterior a la llegada.'; end if;
 new.commission_amount := round(coalesce(new.total_amount,0)*coalesce(new.commission_percent,0)/100,2);
 return new;
end $$;
revoke all on function private.guard_ota_reservation() from public;
create trigger guard_ota_reservation before insert or update or delete on public.reservations for each row execute function private.guard_ota_reservation();

create function private.guard_ota_charge() returns trigger language plpgsql set search_path = '' as $$
declare r public.reservations;
begin
 if TG_OP='UPDATE' then
  if (to_jsonb(new)-'status'-'void_reason') is distinct from (to_jsonb(old)-'status'-'void_reason') or old.status='void' or new.status<>'void' then raise exception 'El cobro es inmutable; solo puede anularse con motivo.'; end if;
  if exists(select 1 from public.ota_commission_payments where charge_id=old.id and status='confirmed') then raise exception 'Anula primero los abonos del cobro.'; end if;
  new.voided_by:=auth.uid(); new.voided_at:=now();
  return new;
 end if;
 select * into r from public.reservations where id=new.reservation_id for update;
 if r.id is null or r.target_type<>'accommodation' or r.target_id is null or r.status<>'completed' then raise exception 'Completa la reserva y vincula el alojamiento antes de emitir el cobro.'; end if;
 if not exists(select 1 from public.accommodations where id=r.target_id) then raise exception 'Alojamiento inexistente.'; end if;
 new.accommodation_id:=r.target_id;
 new.amount:=round(coalesce(r.total_amount,0)*coalesce(r.commission_percent,0)/100,2);
 new.currency:=upper(r.currency);
 new.created_by:=auth.uid(); new.created_at:=now(); new.status:='open'; new.void_reason:=null; new.voided_by:=null; new.voided_at:=null;
 return new;
end $$;
revoke all on function private.guard_ota_charge() from public;
create trigger guard_ota_charge before insert or update on public.ota_commission_charges for each row execute function private.guard_ota_charge();

create function private.guard_ota_payment() returns trigger language plpgsql set search_path = '' as $$
declare c public.ota_commission_charges; paid numeric;
begin
 -- Lock parent for inserts AND reversals, serializing overpayment and void operations.
 select * into c from public.ota_commission_charges where id=coalesce(new.charge_id,old.charge_id) for update;
 if TG_OP='UPDATE' then
  if (to_jsonb(new)-'status'-'void_reason') is distinct from (to_jsonb(old)-'status'-'void_reason') or old.status='void' or new.status<>'void' then raise exception 'El abono es inmutable; solo puede anularse con motivo.'; end if;
  new.voided_by:=auth.uid(); new.voided_at:=now();
  return new;
 end if;
 if c.id is null or c.status<>'open' then raise exception 'El cobro no está abierto.'; end if;
 select coalesce(sum(amount),0) into paid from public.ota_commission_payments where charge_id=c.id and status='confirmed';
 if new.amount<=0 or new.amount>c.amount-paid then raise exception 'El abono debe ser positivo y no superar el saldo pendiente.'; end if;
 new.created_by:=auth.uid(); new.created_at:=now(); new.status:='confirmed'; new.void_reason:=null; new.voided_by:=null; new.voided_at:=null;
 return new;
end $$;
revoke all on function private.guard_ota_payment() from public;
create trigger guard_ota_payment before insert or update on public.ota_commission_payments for each row execute function private.guard_ota_payment();
