import { useState } from 'react';
import DriverLayout from '@/components/driver/DriverLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MOCK_ORDERS, MOCK_DRIVERS } from '@/lib/types';
import { MapPin, Phone, Navigation, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function DriverTrip() {
  const navigate = useNavigate();
  const order = MOCK_ORDERS.find(o => o.accepted_by_driver_id === 'd1' && ['ACCEPTED', 'ARRIVED', 'IN_TRIP'].includes(o.status));
  const [tripStatus, setTripStatus] = useState<'ACCEPTED' | 'ARRIVED' | 'IN_TRIP'>(
    (order?.status as 'ACCEPTED' | 'ARRIVED' | 'IN_TRIP') || 'ACCEPTED'
  );

  if (!order) {
    return (
      <DriverLayout>
        <div className="p-4 text-center py-20">
          <p className="text-taxi-lg text-muted-foreground">Faol safar yo'q</p>
          <Button onClick={() => navigate('/driver/orders')} className="mt-4">Buyurtmalarga o'tish</Button>
        </div>
      </DriverLayout>
    );
  }

  const handleArrive = () => {
    setTripStatus('ARRIVED');
    toast.success("Yetib keldingiz!");
  };
  const handleStart = () => {
    setTripStatus('IN_TRIP');
    toast.success("Safar boshlandi!");
  };
  const handleComplete = () => {
    toast.success(`Safar yakunlandi! ${order.total_price.toLocaleString()} so'm`);
    navigate('/driver/history');
  };

  return (
    <DriverLayout>
      <div className="p-4 space-y-4">
        {/* Status indicator */}
        <div className={`text-center py-3 rounded-xl font-bold text-taxi-lg ${
          tripStatus === 'ACCEPTED' ? 'bg-primary/20 text-primary' :
          tripStatus === 'ARRIVED' ? 'bg-warning/20 text-warning' :
          'bg-success/20 taxi-text-green'
        }`}>
          {tripStatus === 'ACCEPTED' && 'Yo\'lovchiga yetib boring'}
          {tripStatus === 'ARRIVED' && 'Yo\'lovchini kutmoqdasiz'}
          {tripStatus === 'IN_TRIP' && 'Safar davom etmoqda'}
        </div>

        {/* Order info */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Narx</span>
              <span className="text-taxi-2xl font-bold">{order.total_price.toLocaleString()} so'm</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-taxi-base font-medium">{order.pickup_zone}</span>
              </div>
              {order.drop_zone && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-taxi-base">{order.drop_zone}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <a href={`tel:${order.passenger_phone}`} className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  <Phone className="w-5 h-5 mr-2" /> Qo'ng'iroq
                </Button>
              </a>
              <Button variant="outline" size="lg">
                <Navigation className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="space-y-3">
          {tripStatus === 'ACCEPTED' && (
            <Button onClick={handleArrive} className="w-full taxi-gradient text-primary-foreground h-16 text-taxi-lg" size="lg">
              <MapPin className="w-6 h-6 mr-2" /> Yetib keldim
            </Button>
          )}
          {tripStatus === 'ARRIVED' && (
            <Button onClick={handleStart} className="w-full bg-success text-success-foreground h-16 text-taxi-lg" size="lg">
              <Navigation className="w-6 h-6 mr-2" /> Safarni boshlash
            </Button>
          )}
          {tripStatus === 'IN_TRIP' && (
            <Button onClick={handleComplete} className="w-full bg-accent text-accent-foreground h-16 text-taxi-lg" size="lg">
              <CheckCircle className="w-6 h-6 mr-2" /> Safarni yakunlash
            </Button>
          )}
        </div>
      </div>
    </DriverLayout>
  );
}
