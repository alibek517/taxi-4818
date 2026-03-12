import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/components/admin/AdminLayout';
import { MOCK_DRIVERS } from '@/lib/types';
import { Search, Star, Phone } from 'lucide-react';

export default function AdminDrivers() {
  const [search, setSearch] = useState('');
  
  const filtered = MOCK_DRIVERS.filter(d => 
    !search || d.full_name.toLowerCase().includes(search.toLowerCase()) || d.phone.includes(search) || d.car_plate.includes(search)
  );

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h2 className="text-taxi-2xl font-bold">Haydovchilar</h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Ism, telefon yoki raqam..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="grid gap-3">
          {filtered.map(driver => (
            <Card key={driver.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                    driver.is_online ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {driver.full_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{driver.full_name}</h3>
                      <span className={`w-2.5 h-2.5 rounded-full ${driver.is_online ? 'bg-success' : 'bg-muted-foreground'}`} />
                    </div>
                    <p className="text-sm text-muted-foreground">{driver.car_model} • {driver.car_color} • {driver.car_plate}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-sm">
                        <Star className="w-3.5 h-3.5 text-primary" /> {driver.rating}
                      </span>
                      <span className="text-sm text-muted-foreground">Bugun: {driver.completed_today} ta</span>
                      <span className="text-sm font-medium">{driver.balance.toLocaleString()} so'm</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
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
