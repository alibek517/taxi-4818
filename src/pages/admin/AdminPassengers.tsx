import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AdminLayout from '@/components/admin/AdminLayout';
import { Gift, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function AdminPassengers() {
  const [passengers, setPassengers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      // Get profiles with passenger role
      const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'passenger');
      if (!roles || roles.length === 0) { setLoading(false); return; }
      const ids = roles.map(r => r.user_id);
      const { data: profiles } = await supabase.from('profiles').select('*').in('id', ids);
      
      // Get wallet balances
      const enriched = await Promise.all((profiles || []).map(async (p: any) => {
        const { data: txns } = await supabase.from('wallet_transactions').select('amount').eq('user_id', p.id);
        const bonus = (txns || []).reduce((s: number, t: any) => s + t.amount, 0);
        const { count } = await supabase.from('orders').select('id', { count: 'exact', head: true }).eq('passenger_phone', p.phone).eq('status', 'COMPLETED');
        return { ...p, bonus_balance: bonus, total_rides: count || 0 };
      }));
      
      setPassengers(enriched);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return <AdminLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h2 className="text-taxi-2xl font-bold">Yo'lovchilar</h2>
        {passengers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Yo'lovchilar topilmadi</div>
        ) : (
          <div className="grid gap-3">
            {passengers.map((p: any) => (
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
        )}
      </div>
    </AdminLayout>
  );
}
