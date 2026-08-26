-- =========================================================================
-- MANAS RESTAURANT APP — PRODUCTION DATABASE CLEANUP SCRIPT
-- Copy & paste this script into your Supabase SQL Editor and click 'Run'.
-- =========================================================================

-- 1. Wipe all test Orders, Locations, Payments, & History records
DELETE FROM public.orders;

-- 2. Wipe all test Contact Messages
DELETE FROM public.contact_messages;

-- 3. Wipe all non-admin User Roles (Preserves Admin 'troxin694@gmail.com')
DELETE FROM public.user_roles 
WHERE user_id NOT IN (
  SELECT id FROM auth.users WHERE LOWER(email) = 'troxin694@gmail.com'
);

-- 4. Wipe all non-admin Delivery Partner records
DELETE FROM public.delivery_partners
WHERE user_id NOT IN (
  SELECT id FROM auth.users WHERE LOWER(email) = 'troxin694@gmail.com'
);

-- 5. Wipe ALL non-admin users (including 'jaichandaliya0@gmail.com') from Supabase Authentication
DELETE FROM auth.users 
WHERE LOWER(email) <> 'troxin694@gmail.com';

-- NOTE: 'public.menu_items' is 100% PRESERVED & UNTOUCHED!
