import { useState, useEffect } from 'react';
import PassengerLayout from '@/components/passenger/PassengerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, Phone, Car, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function PassengerTrack() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: profile } = await supabase.from('profiles').select('phone').eq('id', user.id).maybeSingle();
      if (!profile) { setLoading(false); return; }
      
      const { data: activeOrder } = await supabase.from('orders').select('*')
        .eq('passenger_phone', profile.phone)
        .not('status', 'in', '("COMPLETED","CANCELLED")')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      setOrder(activeOrder);
      if (activeOrder?.accepted_by_driver_id) {
        const { data: driverData } = await supabase.from('drivers').select('*').eq('id', activeOrder.accepted_by_driver_id).maybeSingle();
        setDriver(driverData);
      }
      setLoading(false);
    };
    fetch();

    const channel = supabase
      .channel('passenger-track')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => fetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const cancelOrder = async () => {
    if (!order) return;
    await supabase.from('orders').update({ status: 'CANCELLED', cancelled_reason: "Yo'lovchi bekor qildi" }).eq('id', order.id);
    toast("Buyurtma bekor qilindi");
    navigate('/passenger');
  };

  if (loading) return <PassengerLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></PassengerLayout>;

  if (!order) {
    return (
      <PassengerLayout>
        <div className="p-4 text-center py-20 text-muted-foreground">
          <p className="text-taxi-lg">Faol buyurtma yo'q</p>
          <Button onClick={() => navigate('/passenger')} className="mt-4">Buyurtma yaratish</Button>
        </div>
      </PassengerLayout>
    );
  }

  const statusLabels: Record<string, string> = {
    CREATED: 'Haydovchi qidirilmoqda...',
    OFFERED: 'Haydovchi qidirilmoqda...',
    ACCEPTED: "Haydovchi yo'lda",
    ARRIVED: 'Haydovchi yetib keldi',
    WAITING: 'Haydovchi kutmoqda',
    IN_TRIP: 'Safar davom etmoqda',
  };

  return (
    <PassengerLayout>
      <div className="p-4 space-y-4">
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full animate-pulse">
            <Car className="w-5 h-5" />
            <span className="font-bold text-taxi-base">{statusLabels[order.status] || order.status}</span>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="h-56 bg-muted flex items-center justify-center relative">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-10 h-10 mx-auto mb-2 text-primary animate-bounce" />
              <p className="text-sm">Haydovchi joylashuvi xaritada</p>
            </div>
          </div>
        </Card>

        {driver && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                  <Car className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-taxi-base">{driver.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{driver.car_model} • {driver.car_color}</p>
                  <p className="text-sm font-medium">{driver.car_plate}</p>
                  <div className="flex items-center gap-1 mt-1"><Star className="w-3.5 h-3.5 text-primary" /><span className="text-sm">{Number(driver.rating).toFixed(1)}</span></div>
                </div>
                <a href={`tel:${driver.phone}`}>
                  <Button variant="outline" size="lg" className="rounded-full w-14 h-14"><Phone className="w-6 h-6" /></Button>
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-success" /><span className="font-medium">{order.pickup_zone}</span></div>
            {order.drop_zone && <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-destructive" /><span>{order.drop_zone}</span></div>}
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-muted-foreground">Narx</span>
              <span className="font-bold text-taxi-lg">{(order.total_price || 0).toLocaleString()} so'm</span>
            </div>
          </CardContent>
        </Card>

        {['CREATED', 'OFFERED', 'ACCEPTED'].includes(order.status) && (
          <Button variant="destructive" className="w-full" size="lg" onClick={cancelOrder}>
            Buyurtmani bekor qilish
          </Button>
        )}
      </div>
    </PassengerLayout>
  );
}
