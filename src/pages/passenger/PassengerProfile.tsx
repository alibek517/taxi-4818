import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PassengerLayout from '@/components/passenger/PassengerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { User, LogOut, Loader2 } from 'lucide-react';

export default function PassengerProfile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ totalRides: 0, bonusBalance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      setProfile(prof);
      
      if (prof) {
        const { count } = await supabase.from('orders').select('id', { count: 'exact', head: true }).eq('passenger_phone', prof.phone).eq('status', 'COMPLETED');
        const { data: txns } = await supabase.from('wallet_transactions').select('amount').eq('user_id', user.id);
        const bonus = (txns || []).reduce((s: number, t: any) => s + t.amount, 0);
        setStats({ totalRides: count || 0, bonusBalance: bonus });
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleLogout = async () => { await signOut(); navigate('/login'); };

  if (loading) return <PassengerLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></PassengerLayout>;

  return (
    <PassengerLayout>
      <div className="p-4 space-y-4">
        <div className="text-center py-6">
          <div className="w-20 h-20 rounded-full bg-secondary mx-auto flex items-center justify-center mb-3">
            <User className="w-10 h-10 text-secondary-foreground" />
          </div>
          <h2 className="text-taxi-xl font-bold">{profile?.full_name || 'Foydalanuvchi'}</h2>
          <p className="text-muted-foreground">{profile?.phone || ''}</p>
        </div>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">Jami safarlar</span><span className="font-medium">{stats.totalRides}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Bonus balans</span><span className="font-bold text-primary">{stats.bonusBalance.toLocaleString()} so'm</span></div>
          </CardContent>
        </Card>

        <Button variant="destructive" className="w-full" size="lg" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Chiqish
        </Button>
      </div>
    </PassengerLayout>
  );
}
