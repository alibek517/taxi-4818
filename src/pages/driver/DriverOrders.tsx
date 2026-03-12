import { useState } from 'react';
import DriverLayout from '@/components/driver/DriverLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MOCK_ORDERS, MOCK_DRIVERS } from '@/lib/types';
import type { Order } from '@/lib/types';
import { MapPin, Clock, Lock, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const currentDriverId = 'd1'; // Simulated logged-in driver
const currentDriver = MOCK_DRIVERS.find(d => d.id === currentDriverId)!;

export default function DriverOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>(
    MOCK_ORDERS.filter(o => ['CREATED', 'OFFERED'].includes(o.status) || 
      (o.accepted_by_driver_id === currentDriverId && ['ACCEPTED', 'ARRIVED', 'IN_TRIP'].includes(o.status)))
  );

  const isDriverBusy = orders.some(o => 
    o.accepted_by_driver_id === currentDriverId && ['ACCEPTED', 'ARRIVED', 'IN_TRIP'].includes(o.status)
  );

  const acceptOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: 'ACCEPTED', accepted_by_driver_id: currentDriverId, dispatch_state: 'GREEN_PUBLIC' } : o
    ));
    toast.success("Buyurtma qabul qilindi!");
    navigate('/driver/trip');
  };

  const declineOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    toast("Buyurtma rad etildi");
  };

  return (
    <DriverLayout>
      <div className="p-4 space-y-3">
        <h2 className="text-taxi-xl font-bold">Buyurtmalar</h2>

        {orders.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-taxi-lg">Hozircha buyurtma yo'q</p>
            <p className="text-sm">Yangi buyurtma kutilmoqda...</p>
          </div>
        )}

        {orders.map(order => {
          const isTargeted = order.dispatch_state === 'RED_TARGETED';
          const isMyTarget = isTargeted && order.targeted_driver_id === currentDriverId;
          const isRed = isTargeted && !isMyTarget;
          const canAccept = !isDriverBusy && (isMyTarget || order.dispatch_state === 'GREEN_PUBLIC');
          const isMyActive = order.accepted_by_driver_id === currentDriverId && ['ACCEPTED', 'ARRIVED', 'IN_TRIP'].includes(order.status);

          return (
            <Card 
              key={order.id} 
              className={`border-2 ${
                isMyActive ? 'border-primary bg-primary/5' :
                isRed ? 'taxi-card-red' : 
                'taxi-card-green'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {isRed && <Lock className="w-4 h-4 text-destructive" />}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      isRed ? 'bg-destructive/20 taxi-text-red' : 
                      isMyActive ? 'bg-primary/20 text-primary' :
                      'bg-success/20 taxi-text-green'
                    }`}>
                      {isMyActive ? order.status : isRed ? 'BAND' : 'BARCHAGA'}
                    </span>
                  </div>
                  <p className="text-taxi-xl font-bold">{order.total_price.toLocaleString()}</p>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-success" />
                    <span className="text-taxi-base font-medium">{order.pickup_zone}</span>
                  </div>
                  {order.drop_zone && (
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
                      <span className="text-taxi-base">{order.drop_zone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {order.estimated_km} km</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(order.created_at).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {isRed && (
                  <p className="text-sm taxi-text-red mb-2">Band. Hozir boshqa taksiga yuborilgan.</p>
                )}

                {isMyActive ? (
                  <Button onClick={() => navigate('/driver/trip')} className="w-full" size="lg">
                    Safarni ko'rish
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => acceptOrder(order.id)} 
                      disabled={!canAccept}
                      className="flex-1 taxi-gradient text-primary-foreground" 
                      size="lg"
                    >
                      <Check className="w-5 h-5 mr-1" /> Qabul
                    </Button>
                    <Button 
                      onClick={() => declineOrder(order.id)} 
                      variant="outline" 
                      size="lg"
                      disabled={isRed}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DriverLayout>
  );
}
