import PassengerLayout from '@/components/passenger/PassengerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { MOCK_ORDERS } from '@/lib/types';
import { MapPin, Clock } from 'lucide-react';

export default function PassengerHistory() {
  return (
    <PassengerLayout>
      <div className="p-4 space-y-3">
        <h2 className="text-taxi-xl font-bold">Safar tarixi</h2>
        {MOCK_ORDERS.filter(o => o.status === 'COMPLETED' || o.status === 'CANCELLED').map(order => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-medium">{order.pickup_zone} → {order.drop_zone || '—'}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(order.created_at).toLocaleDateString('uz')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{order.total_price.toLocaleString()} so'm</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === 'COMPLETED' ? 'bg-success/20 taxi-text-green' : 'bg-destructive/20 taxi-text-red'
                  }`}>{order.status === 'COMPLETED' ? 'Yakunlangan' : 'Bekor'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PassengerLayout>
  );
}
