
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'operator', 'driver', 'passenger');
CREATE TYPE public.auth_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.order_status AS ENUM ('CREATED', 'OFFERED', 'ACCEPTED', 'ARRIVED', 'WAITING', 'IN_TRIP', 'COMPLETED', 'CANCELLED');
CREATE TYPE public.dispatch_state AS ENUM ('RED_TARGETED', 'GREEN_PUBLIC');
CREATE TYPE public.order_type AS ENUM ('TAXI', 'DELIVERY');
CREATE TYPE public.driver_status AS ENUM ('FREE', 'BUSY', 'IN_TRIP', 'OFFLINE');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Zones table
CREATE TABLE public.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_uz TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Zones are publicly readable" ON public.zones FOR SELECT USING (true);
CREATE POLICY "Admins can manage zones" ON public.zones FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Drivers table
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  car_model TEXT NOT NULL,
  car_plate TEXT NOT NULL,
  car_color TEXT NOT NULL DEFAULT '',
  is_online BOOLEAN NOT NULL DEFAULT false,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  current_status driver_status NOT NULL DEFAULT 'OFFLINE',
  rating NUMERIC(2,1) NOT NULL DEFAULT 5.0,
  completed_today INT NOT NULL DEFAULT 0,
  balance BIGINT NOT NULL DEFAULT 0,
  auth_status auth_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers can view own data" ON public.drivers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Drivers can update own data" ON public.drivers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Drivers can insert own data" ON public.drivers FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all drivers" ON public.drivers FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage drivers" ON public.drivers FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Operators can view drivers" ON public.drivers FOR SELECT USING (public.has_role(auth.uid(), 'operator'));

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_type order_type NOT NULL DEFAULT 'TAXI',
  passenger_phone TEXT NOT NULL,
  passenger_name TEXT,
  pickup_zone TEXT NOT NULL,
  drop_zone TEXT,
  estimated_km NUMERIC(6,1) NOT NULL DEFAULT 0,
  start_price INT NOT NULL DEFAULT 0,
  km_price INT NOT NULL DEFAULT 0,
  operator_add INT NOT NULL DEFAULT 0,
  total_price INT NOT NULL DEFAULT 0,
  bonus_used INT NOT NULL DEFAULT 0,
  status order_status NOT NULL DEFAULT 'CREATED',
  dispatch_state dispatch_state NOT NULL DEFAULT 'RED_TARGETED',
  targeted_driver_id UUID REFERENCES public.drivers(id),
  accepted_by_driver_id UUID REFERENCES public.drivers(id),
  delivery_description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  cancelled_reason TEXT
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Operators can manage orders" ON public.orders FOR ALL USING (public.has_role(auth.uid(), 'operator'));
CREATE POLICY "Drivers can view targeted or public orders" ON public.orders FOR SELECT USING (
  auth.uid() = targeted_driver_id OR 
  auth.uid() = accepted_by_driver_id OR 
  dispatch_state = 'GREEN_PUBLIC'
);
CREATE POLICY "Drivers can update accepted orders" ON public.orders FOR UPDATE USING (auth.uid() = accepted_by_driver_id);

-- Wallet transactions
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bonus', 'deduction', 'payment', 'topup')),
  description TEXT,
  order_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage transactions" ON public.wallet_transactions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- System settings
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_price INT NOT NULL DEFAULT 3000,
  km_price INT NOT NULL DEFAULT 5000,
  waiting_price_per_minute INT NOT NULL DEFAULT 500,
  passenger_bonus_percent INT NOT NULL DEFAULT 3,
  driver_bonus_per_order INT NOT NULL DEFAULT 500,
  driver_bonus_mode TEXT NOT NULL DEFAULT 'GIVE' CHECK (driver_bonus_mode IN ('GIVE', 'TAKE')),
  green_after_seconds INT NOT NULL DEFAULT 12,
  offer_expires_seconds INT NOT NULL DEFAULT 45,
  max_targeted_attempts INT NOT NULL DEFAULT 3,
  decline_cooldown_seconds INT NOT NULL DEFAULT 60,
  w_distance NUMERIC(3,1) NOT NULL DEFAULT 1.0,
  w_queue NUMERIC(3,1) NOT NULL DEFAULT 0.5,
  w_recent NUMERIC(3,1) NOT NULL DEFAULT 0.3,
  w_cancel NUMERIC(3,1) NOT NULL DEFAULT 0.8,
  w_idle NUMERIC(3,1) NOT NULL DEFAULT -0.4,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings readable by authenticated" ON public.system_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can update settings" ON public.system_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.system_settings (start_price, km_price, waiting_price_per_minute) VALUES (3000, 5000, 500);

INSERT INTO public.zones (name, name_uz) VALUES 
  ('Gurlan Markaz', 'Gurlan Markaz'),
  ('Bozor', 'Bozor'),
  ('Shifoxona', 'Shifoxona'),
  ('Temiryo''l', 'Temiryo''l'),
  ('Yangi massiv', 'Yangi massiv'),
  ('Maktab', 'Maktab'),
  ('Beruniy', 'Beruniy'),
  ('Poliklinika', 'Poliklinika');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
