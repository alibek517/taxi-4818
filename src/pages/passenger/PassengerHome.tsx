import { useState, useMemo } from 'react';
import PassengerLayout from '@/components/passenger/PassengerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GURLAN_ZONES, DEFAULT_SETTINGS } from '@/lib/types';
import { MapPin, Send, Car } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function PassengerHome() {
  const navigate = useNavigate();
  const [pickupZone, setPickupZone] = useState('');
  const [dropZone, setDropZone] = useState('');
  const [comment, setComment] = useState('');

  const estimatedPrice = useMemo(() => {
    if (!pickupZone) return null;
    // Simple estimate: 2-5 km within Gurlan
    const estimatedKm = dropZone ? 3 : 1;
    return DEFAULT_SETTINGS.start_price + estimatedKm * DEFAULT_SETTINGS.km_price;
  }, [pickupZone, dropZone]);

  const createOrder = () => {
    if (!pickupZone) {
      toast.error("Olish joyini tanlang!");
      return;
    }
    toast.success("Buyurtma yaratildi! Haydovchi qidirilmoqda...");
    navigate('/passenger/track');
  };

  return (
    <PassengerLayout>
      <div className="p-4 space-y-4">
        {/* Map placeholder */}
        <Card className="overflow-hidden">
          <div className="h-48 bg-muted flex items-center justify-center relative">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-10 h-10 mx-auto mb-2 text-primary" />
              <p className="text-sm">Gurlan xaritasi</p>
              <p className="text-xs">Yandex Maps API kalit kerak</p>
            </div>
          </div>
        </Card>

        {/* Order form */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="text-taxi-lg font-bold flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" />
              Taksi chaqirish
            </h2>

            <div>
              <Label>Qayerdan? *</Label>
              <Select value={pickupZone} onValueChange={setPickupZone}>
                <SelectTrigger className="text-taxi-base">
                  <SelectValue placeholder="Olish joyini tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {GURLAN_ZONES.filter(z => z.is_active).map(z => (
                    <SelectItem key={z.id} value={z.name}>{z.name_uz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Qayerga?</Label>
              <Select value={dropZone} onValueChange={setDropZone}>
                <SelectTrigger className="text-taxi-base">
                  <SelectValue placeholder="Ixtiyoriy" />
                </SelectTrigger>
                <SelectContent>
                  {GURLAN_ZONES.filter(z => z.is_active).map(z => (
                    <SelectItem key={z.id} value={z.name}>{z.name_uz}</SelectItem>
                  ))}
                </SelectContent>
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
