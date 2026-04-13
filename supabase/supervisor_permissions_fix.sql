-- =====================================================================
-- BúhoOps — Corrección de Permisos de Supervisor
-- Objetivo: Habilitar la gestión completa de propiedades para el rol 'supervisor'.
-- =====================================================================

-- 1. Actualizar fn_has_property_access para que los supervisores tengan acceso total a todas las propiedades
create or replace function fn_has_property_access(p_property uuid)
returns boolean language sql stable security definer
set search_path = public as $$
  select case
    when fn_is_supervisor_or_higher() then true
    else exists (
      select 1 from property_assignments
      where property_id = p_property
        and user_id = auth.uid()
        and unassigned_at is null
    )
  end;
$$;

-- 2. Permitir que supervisores puedan INSERTAR, ACTUALIZAR y ELIMINAR propiedades
-- (Previamente solo permitido para admin y super_admin)
drop policy if exists properties_write on properties;
create policy properties_write on properties
  for all using (fn_is_supervisor_or_higher())
  with check (fn_is_supervisor_or_higher());

-- 3. Permitir que supervisores gestionen las ASIGNACIONES de personal (Cleaners/Maintenance)
drop policy if exists assignments_write on property_assignments;
create policy assignments_write on property_assignments
  for all using (fn_is_supervisor_or_higher())
  with check (fn_is_supervisor_or_higher());

-- 4. Permitir que supervisores vean los PERFILES de todo el equipo 
-- (Necesario para poder seleccionar personal en las asignaciones)
drop policy if exists profiles_select_self_or_admin on profiles;
create policy profiles_select_all_for_supervisor on profiles
  for select using (id = auth.uid() or fn_is_supervisor_or_higher());

-- 5. Permitir que supervisores gestionen FOTOS de las propiedades
drop policy if exists property_photos_admin_modify on property_photos;
create policy property_photos_supervisor_modify on property_photos
  for update using (fn_is_supervisor_or_higher()) with check (fn_is_supervisor_or_higher());

drop policy if exists property_photos_admin_delete on property_photos;
create policy property_photos_supervisor_delete on property_photos
  for delete using (fn_is_supervisor_or_higher());

-- 6. Asegurar que los supervisores puedan gestionar TICKETS y OCUPACIONES 
-- (Estas ya estaban mayoritariamente cubiertas, pero reforzamos consistencia)
-- No se requieren cambios adicionales pues usan fn_is_supervisor_or_higher() en all_migrations.sql
