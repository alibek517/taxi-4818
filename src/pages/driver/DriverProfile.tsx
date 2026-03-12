import DriverLayout from '@/components/driver/DriverLayout';
import { Card, CardContent } from '@/components/ui/card';
import { MOCK_DRIVERS } from '@/lib/types';
import { Star, Phone, Car, Wallet } from 'lucide-react';

const driver = MOCK_DRIVERS[0];

export default function DriverProfile() {
  return (
    <DriverLayout>
      <div className="p-4 space-y-4">
        <div className="text-center py-6">
          <div className="w-20 h-20 rounded-full bg-primary mx-auto flex items-center justify-center mb-3">
            <Car className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-taxi-xl font-bold">{driver.full_name}</h2>
          <p className="text-muted-foreground">{driver.phone}</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Star className="w-4 h-4 text-primary" />
            <span className="font-medium">{driver.rating}</span>
          </div>
        </div>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mashina</span>
              <span className="font-medium">{driver.car_model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Raqam</span>
              <span className="font-medium">{driver.car_plate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rang</span>
              <span className="font-medium">{driver.car_color}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bugungi safarlar</span>
              <span className="font-medium">{driver.completed_today}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Balans</span>
              <span className="font-bold text-primary">{driver.balance.toLocaleString()} so'm</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DriverLayout>
  );
}
