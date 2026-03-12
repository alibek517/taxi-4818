import { Card, CardContent } from '@/components/ui/card';
import AdminLayout from '@/components/admin/AdminLayout';
import { Phone, Gift } from 'lucide-react';

const MOCK_PASSENGERS = [
  { id: 'p1', full_name: 'Nilufar Karimova', phone: '+998901111111', bonus_balance: 2400, total_rides: 15 },
  { id: 'p2', full_name: 'Akbar Toshmatov', phone: '+998902222222', bonus_balance: 890, total_rides: 8 },
  { id: 'p3', full_name: 'Dilorom Yusupova', phone: '+998904444444', bonus_balance: 5200, total_rides: 32 },
  { id: 'p4', full_name: 'Sardor Rahimov', phone: '+998905555555', bonus_balance: 0, total_rides: 2 },
];

export default function AdminPassengers() {
  return (
    <AdminLayout>
      <div className="space-y-4">
        <h2 className="text-taxi-2xl font-bold">Yo'lovchilar</h2>
        <div className="grid gap-3">
          {MOCK_PASSENGERS.map(p => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-secondary-foreground">
                  {p.full_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{p.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{p.phone}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm">
                    <Gift className="w-3.5 h-3.5 text-primary" />
                    <span className="font-medium">{p.bonus_balance.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.total_rides} safar</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
