// Gurlan Taxi - Core Types

export type UserRole = 'admin' | 'operator' | 'driver' | 'passenger';

export type OrderStatus = 'CREATED' | 'OFFERED' | 'ACCEPTED' | 'ARRIVED' | 'WAITING' | 'IN_TRIP' | 'COMPLETED' | 'CANCELLED';
export type DispatchState = 'RED_TARGETED' | 'GREEN_PUBLIC';
export type OrderType = 'TAXI' | 'DELIVERY';

export interface Zone {
  id: string;
  name: string;
  name_uz: string;
  is_active: boolean;
}

export interface Driver {
  id: string;
  full_name: string;
  phone: string;
  car_model: string;
  car_plate: string;
  car_color: string;
  is_online: boolean;
  is_blocked: boolean;
  current_status: 'FREE' | 'BUSY' | 'IN_TRIP' | 'OFFLINE';
  rating: number;
  completed_today: number;
  balance: number;
}

export interface Passenger {
  id: string;
  full_name: string;
  phone: string;
  bonus_balance: number;
  total_rides: number;
}

export interface Order {
  id: string;
  order_type: OrderType;
  passenger_phone: string;
  passenger_name?: string;
  pickup_zone: string;
  drop_zone?: string;
  estimated_km: number;
  start_price: number;
  km_price: number;
  operator_add: number;
  total_price: number;
  bonus_used: number;
  status: OrderStatus;
  dispatch_state: DispatchState;
  targeted_driver_id?: string;
  accepted_by_driver_id?: string;
  driver?: Driver;
  created_at: string;
  completed_at?: string;
  cancelled_reason?: string;
  delivery_description?: string;
}

export interface SystemSettings {
  start_price: number;
  km_price: number;
  waiting_price_per_minute: number;
  passenger_bonus_percent: number;
  driver_bonus_per_order: number;
  driver_bonus_mode: 'GIVE' | 'TAKE';
  green_after_seconds: number;
  offer_expires_seconds: number;
  max_targeted_attempts: number;
  decline_cooldown_seconds: number;
  w_distance: number;
  w_queue: number;
  w_recent: number;
  w_cancel: number;
  w_idle: number;
}

export type AuthStatus = 'pending' | 'approved' | 'rejected';

export interface UserAccount {
  id: string;
  phone: string;
  full_name: string;
  role: UserRole;
  auth_status: AuthStatus;
  created_at: string;
}

export interface DashboardMetrics {
  ordersToday: number;
  revenueToday: number;
  driversOnline: number;
  activeRides: number;
  completedToday: number;
  cancelledToday: number;
}

// Default zones for Gurlan
export const GURLAN_ZONES: Zone[] = [
  { id: '1', name: 'Gurlan Markaz', name_uz: 'Gurlan Markaz', is_active: true },
  { id: '2', name: 'Bozor', name_uz: 'Bozor', is_active: true },
  { id: '3', name: 'Shifoxona', name_uz: 'Shifoxona', is_active: true },
  { id: '4', name: "Temiryo'l", name_uz: "Temiryo'l", is_active: true },
  { id: '5', name: 'Yangi massiv', name_uz: 'Yangi massiv', is_active: true },
  { id: '6', name: 'Maktab', name_uz: 'Maktab', is_active: true },
  { id: '7', name: 'Beruniy', name_uz: 'Beruniy', is_active: true },
  { id: '8', name: 'Poliklinika', name_uz: 'Poliklinika', is_active: true },
];

export const DEFAULT_SETTINGS: SystemSettings = {
  start_price: 3000,
  km_price: 5000,
  waiting_price_per_minute: 500,
  passenger_bonus_percent: 3,
  driver_bonus_per_order: 500,
  driver_bonus_mode: 'GIVE',
  green_after_seconds: 12,
  offer_expires_seconds: 45,
  max_targeted_attempts: 3,
  decline_cooldown_seconds: 60,
  w_distance: 1.0,
  w_queue: 0.5,
  w_recent: 0.3,
  w_cancel: 0.8,
  w_idle: -0.4,
};

// Mock data generators
export const MOCK_DRIVERS: Driver[] = [
  { id: 'd1', full_name: 'Abdullayev Jasur', phone: '+998901234567', car_model: 'Cobalt', car_plate: '01 A 123 BA', car_color: 'Oq', is_online: true, is_blocked: false, current_status: 'FREE', rating: 4.8, completed_today: 5, balance: 25000 },
  { id: 'd2', full_name: 'Karimov Sardor', phone: '+998901234568', car_model: 'Nexia 3', car_plate: '01 B 456 BA', car_color: 'Qora', is_online: true, is_blocked: false, current_status: 'IN_TRIP', rating: 4.5, completed_today: 8, balance: 42000 },
  { id: 'd3', full_name: 'Rahimov Botir', phone: '+998901234569', car_model: 'Gentra', car_plate: '01 C 789 BA', car_color: 'Kumush', is_online: true, is_blocked: false, current_status: 'FREE', rating: 4.9, completed_today: 3, balance: 15000 },
  { id: 'd4', full_name: 'Toshmatov Anvar', phone: '+998901234570', car_model: 'Spark', car_plate: '01 D 012 BA', car_color: 'Ko\'k', is_online: false, is_blocked: false, current_status: 'OFFLINE', rating: 4.2, completed_today: 0, balance: 8000 },
  { id: 'd5', full_name: 'Yusupov Sherzod', phone: '+998901234571', car_model: 'Cobalt', car_plate: '01 E 345 BA', car_color: 'Oq', is_online: true, is_blocked: false, current_status: 'BUSY', rating: 4.7, completed_today: 6, balance: 31000 },
];

export const MOCK_ORDERS: Order[] = [
  { id: 'o1', order_type: 'TAXI', passenger_phone: '+998901111111', passenger_name: 'Nilufar', pickup_zone: 'Gurlan Markaz', drop_zone: 'Bozor', estimated_km: 2, start_price: 3000, km_price: 5000, operator_add: 0, total_price: 13000, bonus_used: 0, status: 'COMPLETED', dispatch_state: 'GREEN_PUBLIC', accepted_by_driver_id: 'd1', created_at: new Date().toISOString(), completed_at: new Date().toISOString() },
  { id: 'o2', order_type: 'TAXI', passenger_phone: '+998902222222', passenger_name: 'Akbar', pickup_zone: 'Shifoxona', drop_zone: "Temiryo'l", estimated_km: 5, start_price: 3000, km_price: 5000, operator_add: 2000, total_price: 30000, bonus_used: 0, status: 'IN_TRIP', dispatch_state: 'RED_TARGETED', targeted_driver_id: 'd2', accepted_by_driver_id: 'd2', created_at: new Date().toISOString() },
  { id: 'o3', order_type: 'DELIVERY', passenger_phone: '+998903333333', pickup_zone: 'Yangi massiv', drop_zone: 'Bozor', estimated_km: 3, start_price: 0, km_price: 5000, operator_add: 0, total_price: 15000, bonus_used: 0, status: 'CREATED', dispatch_state: 'RED_TARGETED', targeted_driver_id: 'd3', created_at: new Date().toISOString(), delivery_description: 'Dori-darmon yetkazish' },
  { id: 'o4', order_type: 'TAXI', passenger_phone: '+998904444444', passenger_name: 'Dilorom', pickup_zone: 'Maktab', drop_zone: 'Gurlan Markaz', estimated_km: 4, start_price: 3000, km_price: 5000, operator_add: 1000, total_price: 24000, bonus_used: 600, status: 'ACCEPTED', dispatch_state: 'GREEN_PUBLIC', accepted_by_driver_id: 'd5', created_at: new Date().toISOString() },
  { id: 'o5', order_type: 'TAXI', passenger_phone: '+998905555555', pickup_zone: 'Beruniy', drop_zone: 'Poliklinika', estimated_km: 6, start_price: 3000, km_price: 5000, operator_add: 0, total_price: 33000, bonus_used: 0, status: 'CANCELLED', dispatch_state: 'GREEN_PUBLIC', created_at: new Date().toISOString(), cancelled_reason: 'Yo\'lovchi bekor qildi' },
];
