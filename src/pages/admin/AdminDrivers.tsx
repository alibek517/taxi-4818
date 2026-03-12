import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/admin/AdminLayout';
import { MOCK_DRIVERS } from '@/lib/types';
import type { AuthStatus } from '@/lib/types';
import { Search, Star, Phone, Check, X, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface DriverWithAuth {
  id: string;
  full_name: string;
  phone: string;
  car_model: string;
  car_plate: string;
  car_color: string;
  is_online: boolean;
  current_status: string;
  rating: number;
  completed_today: number;
  balance: number;
  auth_status: AuthStatus;
}

const initialDrivers: DriverWithAuth[] = [
  ...MOCK_DRIVERS.map(d => ({ ...d, auth_status: 'approved' as AuthStatus })),
  { id: 'd6', full_name: 'Nazarov Jamshid', phone: '+998901234572', car_model: 'Damas', car_plate: '01 F 678 BA', car_color: 'Oq', is_online: false, current_status: 'OFFLINE', rating: 0, completed_today: 0, balance: 0, auth_status: 'pending' as AuthStatus },
  { id: 'd7', full_name: 'Qobilov Rustam', phone: '+998901234573', car_model: 'Cobalt', car_plate: '01 G 901 BA', car_color: 'Kumush', is_online: false, current_status: 'OFFLINE', rating: 0, completed_today: 0, balance: 0, auth_status: 'pending' as AuthStatus },
];

export default function AdminDrivers() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [drivers, setDrivers] = useState(initialDrivers);

  const filtered = drivers.filter(d => {
    const matchSearch = !search || d.full_name.toLowerCase().includes(search.toLowerCase()) || d.phone.includes(search) || d.car_plate.includes(search);
    const matchFilter = filter === 'all' || d.auth_status === filter;
    return matchSearch && matchFilter;
  });

  const pendingCount = drivers.filter(d => d.auth_status === 'pending').length;

  const approve = (id: string) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, auth_status: 'approved' as AuthStatus } : d));
    toast.success("Haydovchi tasdiqlandi!");
  };

  const reject = (id: string) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, auth_status: 'rejected' as AuthStatus } : d));
    toast("Haydovchi rad etildi");
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-taxi-2xl font-bold">Haydovchilar</h2>
          {pendingCount > 0 && (
            <span className="bg-warning/20 text-warning px-3 py-1 rounded-full text-sm font-bold">
              {pendingCount} ta ariza ⏳
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {f === 'all' ? 'Hammasi' : f === 'pending' ? 'Kutilmoqda' : 'Tasdiqlangan'}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Ism, telefon yoki raqam..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="grid gap-3">
          {filtered.map(driver => (
            <Card key={driver.id} className={driver.auth_status === 'pending' ? 'border-2 border-warning' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                    driver.auth_status === 'pending' ? 'bg-warning/20 text-warning' :
                    driver.is_online ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {driver.auth_status === 'pending' ? <Clock className="w-6 h-6" /> : driver.full_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{driver.full_name}</h3>
                      {driver.auth_status === 'approved' && (
                        <span className={`w-2.5 h-2.5 rounded-full ${driver.is_online ? 'bg-success' : 'bg-muted-foreground'}`} />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{driver.car_model} • {driver.car_color} • {driver.car_plate}</p>
                    {driver.auth_status === 'approved' && (
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-sm">
                          <Star className="w-3.5 h-3.5 text-primary" /> {driver.rating}
                        </span>
                        <span className="text-sm text-muted-foreground">Bugun: {driver.completed_today} ta</span>
                        <span className="text-sm font-medium">{driver.balance.toLocaleString()} so'm</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {driver.auth_status === 'pending' ? (
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => approve(driver.id)} className="bg-success text-success-foreground h-8">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => reject(driver.id)} className="h-8">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          driver.current_status === 'FREE' ? 'bg-success/20 taxi-text-green' :
                          driver.current_status === 'IN_TRIP' ? 'bg-primary/20 text-primary' :
                          driver.current_status === 'BUSY' ? 'bg-warning/20 text-warning' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {driver.current_status}
                        </span>
                        <a href={`tel:${driver.phone}`} className="p-2 rounded-full hover:bg-muted transition-colors">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
