Design system: Yellow taxi (#FFAB00 / HSL 45 100% 51%), dark sidebar, Inter font, 18px min font.
Locale: Uzbek (O'zbek) for all UI labels.
Zones: Gurlan city zones (Markaz, Bozor, Shifoxona, Temiryo'l, Yangi massiv, Maktab, Beruniy, Poliklinika)
Pricing: start_price 3000 + km*5000 + operator_add + waiting_cost
Waiting: waiting_price_per_minute (admin configurable, default 500 so'm/min)
Dispatch: RED_TARGETED (12s) → GREEN_PUBLIC, weighted scoring for driver selection
Bonus: Passenger 3% of total, Driver 500 so'm per order
Driver app: Single page with tab navigation (home/orders/trip/history/profile)
Auth: Phone OTP login, driver registration requires admin approval
KM tracking: Starts counting when driver begins trip (IN_TRIP status)
