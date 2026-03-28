import { useState, useEffect } from 'react';
import PassengerLayout from '@/components/passenger/PassengerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Clock, Loader2 } from 'lucide-react';

export default function PassengerHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: profile } = await supabase.from('profiles').select('phone').eq('id', user.id).maybeSingle();
      if (!profile) { setLoading(false); return; }
      const { data } = await supabase.from('orders').select('*')
        .eq('passenger_phone', profile.phone)
        .in('status', ['COMPLETED', 'CANCELLED'])
        .order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (loading) return <PassengerLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></PassengerLayout>;

  return (
    <PassengerLayout>
      <div className="p-4 space-y-3">
        <h2 className="text-taxi-xl font-bold">Safar tarixi</h2>
        {orders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Safar tarixi bo'sh</div>
        ) : orders.map((order: any) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-medium">{order.pickup_zone} → {order.drop_zone || '—'}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(order.created_at).toLocaleDateString('uz')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{(order.total_price || 0).toLocaleString()} so'm</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'COMPLETED' ? 'bg-success/20 taxi-text-green' : 'bg-destructive/20 taxi-text-red'}`}>
                    {order.status === 'COMPLETED' ? 'Yakunlangan' : 'Bekor'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PassengerLayout>
  );
}
