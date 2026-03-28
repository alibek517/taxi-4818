import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import type { OrderStatus } from '@/lib/types';
import { Search, Loader2 } from 'lucide-react';

const statusFilters: { label: string; value: OrderStatus | 'ALL' }[] = [
  { label: 'Hammasi', value: 'ALL' },
  { label: 'Yangi', value: 'CREATED' },
  { label: 'Qabul', value: 'ACCEPTED' },
  { label: 'Safarda', value: 'IN_TRIP' },
  { label: 'Yakunlangan', value: 'COMPLETED' },
  { label: 'Bekor', value: 'CANCELLED' },
];

export default function AdminOrders() {
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const filtered = orders.filter((o: any) => {
    if (filter !== 'ALL' && o.status !== filter) return false;
    if (search && !o.passenger_phone.includes(search) && !o.pickup_zone.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return <AdminLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h2 className="text-taxi-2xl font-bold">Buyurtmalar</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Telefon yoki zona bo'yicha qidirish..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {statusFilters.map(sf => (
              <button
                key={sf.value}
                onClick={() => setFilter(sf.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === sf.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >{sf.label}</button>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground">Buyurtma topilmadi</div>}
              {filtered.map((order: any) => (
                <div key={order.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${order.dispatch_state === 'RED_TARGETED' ? 'bg-destructive' : 'bg-success'}`} />
                        <span className="font-medium">{order.pickup_zone}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium">{order.drop_zone || '—'}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.passenger_phone} {order.passenger_name && `• ${order.passenger_name}`}</p>
                      <p className="text-xs text-muted-foreground">{order.estimated_km} km • {new Date(order.created_at).toLocaleTimeString('uz')}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-bold text-lg">{(order.total_price || 0).toLocaleString()}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        order.status === 'COMPLETED' ? 'bg-success/20 taxi-text-green' :
                        order.status === 'CANCELLED' ? 'bg-destructive/20 taxi-text-red' :
                        order.status === 'IN_TRIP' ? 'bg-primary/20 text-primary' :
                        order.status === 'ACCEPTED' ? 'bg-accent/20 text-accent' :
                        'bg-muted text-muted-foreground'
                      }`}>{order.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
