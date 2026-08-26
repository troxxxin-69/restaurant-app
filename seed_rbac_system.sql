-- =========================================================================
-- COMPLETE RBAC & DELIVERY SYSTEM SQL SCRIPT FOR MANAS RESTAURANT APP
-- Copy and paste this script into the Supabase SQL Editor and click 'Run'.
-- =========================================================================

-- 1. Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('customer', 'restaurant_admin', 'delivery_partner')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create delivery_partners table
CREATE TABLE IF NOT EXISTS public.delivery_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  vehicle_number TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2b. Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Update orders table columns for delivery lifecycle
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'placed';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_boy_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_boy_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS ready_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS lat NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS lng NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS street_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS landmark TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pincode TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Enable Realtime publication for orders, menu_items, and delivery_partners
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_partners;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'delivery_partners'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_partners;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'menu_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
  END IF;
END $$;
-- 4. Helper Function: get_user_role(p_user_id UUID)
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM public.user_roles WHERE user_id = p_user_id LIMIT 1;
  RETURN COALESCE(v_role, 'customer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger Function: Automatically assign 'customer' role on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- 6. Set up Row Level Security (RLS) Policies
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if any
DROP POLICY IF EXISTS "Everyone can insert contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins manage contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Users view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Delivery partners view and update own profile" ON public.delivery_partners;
DROP POLICY IF EXISTS "Delivery partners update own status" ON public.delivery_partners;
DROP POLICY IF EXISTS "Admins insert delivery partners" ON public.delivery_partners;
DROP POLICY IF EXISTS "Everyone can read menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Admins manage menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Customers view own orders" ON public.orders;
DROP POLICY IF EXISTS "Customers insert orders" ON public.orders;
DROP POLICY IF EXISTS "Admins manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Delivery partners view assigned orders" ON public.orders;
DROP POLICY IF EXISTS "Delivery partners update assigned orders" ON public.orders;

-- user_roles policies
CREATE POLICY "Users view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'restaurant_admin');

CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (get_user_role(auth.uid()) = 'restaurant_admin');

-- delivery_partners policies
CREATE POLICY "Delivery partners view and update own profile" ON public.delivery_partners
  FOR SELECT USING (user_id = auth.uid() OR get_user_role(auth.uid()) = 'restaurant_admin');

CREATE POLICY "Delivery partners update own status" ON public.delivery_partners
  FOR UPDATE USING (user_id = auth.uid() OR get_user_role(auth.uid()) = 'restaurant_admin');

CREATE POLICY "Admins insert delivery partners" ON public.delivery_partners
  FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'restaurant_admin' OR user_id = auth.uid());

-- menu_items policies
CREATE POLICY "Everyone can read menu items" ON public.menu_items
  FOR SELECT USING (true);

CREATE POLICY "Admins manage menu items" ON public.menu_items
  FOR ALL USING (get_user_role(auth.uid()) = 'restaurant_admin');

-- orders policies
CREATE POLICY "Customers view own orders" ON public.orders
  FOR SELECT USING (user_id = auth.uid() OR get_user_role(auth.uid()) = 'restaurant_admin');

CREATE POLICY "Customers insert orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins manage all orders" ON public.orders
  FOR ALL USING (get_user_role(auth.uid()) = 'restaurant_admin');

CREATE POLICY "Delivery partners view assigned orders" ON public.orders
  FOR SELECT USING (
    assigned_delivery_partner_id IN (
      SELECT id FROM public.delivery_partners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Delivery partners update assigned orders" ON public.orders
  FOR UPDATE USING (
    assigned_delivery_partner_id IN (
      SELECT id FROM public.delivery_partners WHERE user_id = auth.uid()
    )
  );

-- contact_messages policies
CREATE POLICY "Everyone can insert contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins manage contact messages" ON public.contact_messages
  FOR ALL USING (get_user_role(auth.uid()) = 'restaurant_admin');
