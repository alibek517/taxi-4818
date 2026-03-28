import { useState, useEffect } from 'react';
import PassengerLayout from '@/components/passenger/PassengerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Gift, ArrowDown, ArrowUp, Loader2 } from 'lucide-react';

export default function PassengerBonus() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase.from('wallet_transactions').select('*')
        .eq('user_id', user.id).order('created_at', { ascending: false });
      setTransactions(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const balance = transactions.reduce((sum, t) => sum + t.amount, 0);

  if (loading) return <PassengerLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></PassengerLayout>;

  return (
    <PassengerLayout>
      <div className="p-4 space-y-4">
        <Card className="taxi-gradient">
          <CardContent className="p-6 text-center text-primary-foreground">
            <Gift className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm opacity-80">Bonus hisobingiz</p>
            <p className="text-taxi-3xl font-bold">{balance.toLocaleString()} so'm</p>
            <p className="text-xs opacity-70 mt-1">Har safar 3% bonus yig'iladi</p>
          </CardContent>
        </Card>

        <h3 className="font-bold text-taxi-base">Bonus tarixi</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Bonus tarixi bo'sh</div>
        ) : transactions.map((t: any) => (
          <Card key={t.id}>
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.amount > 0 ? 'bg-success/20' : 'bg-destructive/20'}`}>
                  {t.amount > 0 ? <ArrowDown className="w-4 h-4 taxi-text-green" /> : <ArrowUp className="w-4 h-4 taxi-text-red" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.description || (t.amount > 0 ? 'Bonus' : "To'lov")}</p>
                  <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString('uz')}</p>
                </div>
              </div>
              <span className={`font-bold ${t.amount > 0 ? 'taxi-text-green' : 'taxi-text-red'}`}>
                {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </PassengerLayout>
  );
}
