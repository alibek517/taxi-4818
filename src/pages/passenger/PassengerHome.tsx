import { useState, useMemo, useEffect } from 'react';
import PassengerLayout from '@/components/passenger/PassengerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, Send, Car } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function PassengerHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pickupZone, setPickupZone] = useState('');
  const [dropZone, setDropZone] = useState('');
  const [comment, setComment] = useState('');
  const [zones, setZones] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ start_price: 3000, km_price: 5000 });
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetch = async () => {
      const [zonesRes, settingsRes] = await Promise.all([
        supabase.from('zones').select('*').eq('is_active', true),
        supabase.from('system_settings').select('*').limit(1).maybeSingle(),
      ]);
      setZones(zonesRes.data || []);
      if (settingsRes.data) setSettings(settingsRes.data);
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        setProfile(data);
      }
    };
    fetch();
  }, [user]);

  const estimatedPrice = useMemo(() => {
    if (!pickupZone) return null;
    const estimatedKm = dropZone ? 3 : 1;
    return settings.start_price + estimatedKm * settings.km_price;
  }, [pickupZone, dropZone, settings]);

  const createOrder = async () => {
    if (!pickupZone) { toast.error("Olish joyini tanlang!"); return; }
    const estimatedKm = dropZone ? 3 : 1;
    const totalPrice = settings.start_price + estimatedKm * settings.km_price;

    const { error } = await supabase.from('orders').insert({
      order_type: 'TAXI',
      passenger_phone: profile?.phone || '',
      passenger_name: profile?.full_name || null,
      pickup_zone: pickupZone,
      drop_zone: dropZone || null,
      estimated_km: estimatedKm,
      start_price: settings.start_price,
      km_price: settings.km_price,
      total_price: totalPrice,
      created_by: user?.id || null,
    });

    if (error) { toast.error("Buyurtma yaratishda xatolik"); return; }
    toast.success("Buyurtma yaratildi! Haydovchi qidirilmoqda...");
    navigate('/passenger/track');
  };

  return (
    <PassengerLayout>
      <div className="p-4 space-y-4">
        <Card className="overflow-hidden">
          <div className="h-48 bg-muted flex items-center justify-center relative">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-10 h-10 mx-auto mb-2 text-primary" />
              <p className="text-sm">Zippy xaritasi</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="text-taxi-lg font-bold flex items-center gap-2"><Car className="w-5 h-5 text-primary" /> Taksi chaqirish</h2>
            <div>
              <Label>Qayerdan? *</Label>
              <Select value={pickupZone} onValueChange={setPickupZone}>
                <SelectTrigger className="text-taxi-base"><SelectValue placeholder="Olish joyini tanlang" /></SelectTrigger>
                <SelectContent>{zones.map((z: any) => <SelectItem key={z.id} value={z.name}>{z.name_uz}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Qayerga?</Label>
              <Select value={dropZone} onValueChange={setDropZone}>
                <SelectTrigger className="text-taxi-base"><SelectValue placeholder="Ixtiyoriy" /></SelectTrigger>
                <SelectContent>{zones.map((z: any) => <SelectItem key={z.id} value={z.name}>{z.name_uz}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Input placeholder="Izoh (ixtiyoriy)" value={comment} onChange={e => setComment(e.target.value)} />
            {estimatedPrice && (
              <div className="bg-primary/10 rounded-xl p-3 text-center">
                <p className="text-sm text-muted-foreground">Taxminiy narx</p>
                <p className="text-taxi-2xl font-bold text-primary">{estimatedPrice.toLocaleString()} so'm</p>
              </div>
            )}
            <Button onClick={createOrder} className="w-full taxi-gradient text-primary-foreground h-14 text-taxi-lg" size="lg">
              <Send className="w-5 h-5 mr-2" /> Taksi chaqirish
            </Button>
          </CardContent>
        </Card>
      </div>
    </PassengerLayout>
  );
}
