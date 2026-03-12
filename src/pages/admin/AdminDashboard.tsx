import { Car, ClipboardList, DollarSign, Activity, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/components/admin/AdminLayout';
import { MOCK_ORDERS, MOCK_DRIVERS } from '@/lib/types';
import type { DashboardMetrics } from '@/lib/types';

const metrics: DashboardMetrics = {
  ordersToday: MOCK_ORDERS.length,
  revenueToday: MOCK_ORDERS.filter(o => o.status === 'COMPLETED').reduce((s, o) => s + o.total_price, 0),
  driversOnline: MOCK_DRIVERS.filter(d => d.is_online).length,
  activeRides: MOCK_ORDERS.filter(o => ['IN_TRIP', 'ACCEPTED', 'ARRIVED'].includes(o.status)).length,
  completedToday: MOCK_ORDERS.filter(o => o.status === 'COMPLETED').length,
  cancelledToday: MOCK_ORDERS.filter(o => o.status === 'CANCELLED').length,
};

const metricCards = [
  { label: 'Buyurtmalar', value: metrics.ordersToday, icon: ClipboardList, color: 'bg-primary' },
  { label: 'Daromad', value: `${(metrics.revenueToday / 1000).toFixed(0)}K`, icon: DollarSign, color: 'bg-success' },
  { label: 'Haydovchilar', value: metrics.driversOnline, icon: Car, color: 'bg-accent' },
  { label: 'Faol safarlar', value: metrics.activeRides, icon: Activity, color: 'taxi-gradient' },
  { label: 'Yakunlangan', value: metrics.completedToday, icon: CheckCircle, color: 'bg-success' },
  { label: 'Bekor qilingan', value: metrics.cancelledToday, icon: XCircle, color: 'bg-destructive' },
];

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-taxi-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Gurlan Taxi — bugungi statistika</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {metricCards.map(m => (
            <Card key={m.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${m.color} flex items-center justify-center`}>
                    <m.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{m.value}</p>
                    <p className="text-sm text-muted-foreground">{m.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent orders */}
        <Card>
          <CardHeader>
            <CardTitle>So'nggi buyurtmalar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_ORDERS.map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{order.pickup_zone} → {order.drop_zone || '—'}</p>
                    <p className="text-sm text-muted-foreground">{order.passenger_phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{order.total_price.toLocaleString()} so'm</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      order.status === 'COMPLETED' ? 'bg-success/20 taxi-text-green' :
                      order.status === 'CANCELLED' ? 'bg-destructive/20 taxi-text-red' :
                      order.status === 'IN_TRIP' ? 'bg-primary/20 text-primary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Online drivers */}
        <Card>
          <CardHeader>
            <CardTitle>Onlayn haydovchilar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MOCK_DRIVERS.filter(d => d.is_online).map(driver => (
                <div key={driver.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    {driver.full_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{driver.full_name}</p>
                    <p className="text-sm text-muted-foreground">{driver.car_model} • {driver.car_plate}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    driver.current_status === 'FREE' ? 'bg-success/20 taxi-text-green' :
                    driver.current_status === 'IN_TRIP' ? 'bg-primary/20 text-primary' :
                    'bg-warning/20 text-warning'
                  }`}>
                    {driver.current_status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
