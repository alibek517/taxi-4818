import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GURLAN_ZONES, MOCK_DRIVERS, DEFAULT_SETTINGS, MOCK_ORDERS } from '@/lib/types';
import { Car, Headphones, LogOut, Calculator, Send, User, Phone, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function OperatorDashboard() {
  const [passengerPhone, setPassengerPhone] = useState('');
  const [pickupZone, setPickupZone] = useState('');
  const [dropZone, setDropZone] = useState('');
  const [estimatedKm, setEstimatedKm] = useState('');
  const [operatorAdd, setOperatorAdd] = useState('0');
  const [selectedDriver, setSelectedDriver] = useState('');

  const price = useMemo(() => {
    const km = parseFloat(estimatedKm) || 0;
    const add = parseFloat(operatorAdd) || 0;
    const startPrice = DEFAULT_SETTINGS.start_price + add;
    const total = startPrice + (km * DEFAULT_SETTINGS.km_price);
    return { startPrice, kmTotal: km * DEFAULT_SETTINGS.km_price, total };
  }, [estimatedKm, operatorAdd]);

  const eligibleDrivers = MOCK_DRIVERS.filter(d => d.is_online && d.current_status === 'FREE' && !d.is_blocked);

  const createOrder = () => {
    if (!passengerPhone || !pickupZone) {
      toast.error("Telefon va olish zonasi majburiy!");
      return;
    }
    toast.success(`Buyurtma yaratildi! Jami: ${price.total.toLocaleString()} so'm`);
    setPassengerPhone('');
    setPickupZone('');
    setDropZone('');
    setEstimatedKm('');
    setOperatorAdd('0');
    setSelectedDriver('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3">
        <div className="w-8 h-8 rounded-lg taxi-gradient flex items-center justify-center">
          <Headphones className="w-4 h-4 text-primary-foreground" />
        </div>
        <h1 className="font-bold">Gurlan Taxi — Operator</h1>
        <div className="flex-1" />
        <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">Admin</Link>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          <LogOut className="w-4 h-4" />
        </Link>
      </header>

      <div className="max-w-5xl mx-auto p-4 grid lg:grid-cols-5 gap-4">
        {/* Order creation form */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                Yangi buyurtma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Telefon raqami</Label>
                <Input 
                  placeholder="+998 90 123 45 67" 
                  value={passengerPhone} 
                  onChange={e => setPassengerPhone(e.target.value)}
                  className="text-taxi-base"
                />
              </div>

              <div>
                <Label className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Olish zonasi *</Label>
                <Select value={pickupZone} onValueChange={setPickupZone}>
                  <SelectTrigger><SelectValue placeholder="Zonani tanlang" /></SelectTrigger>
                  <SelectContent>
                    {GURLAN_ZONES.filter(z => z.is_active).map(z => (
                      <SelectItem key={z.id} value={z.name}>{z.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Tushish zonasi</Label>
                <Select value={dropZone} onValueChange={setDropZone}>
                  <SelectTrigger><SelectValue placeholder="Ixtiyoriy" /></SelectTrigger>
                  <SelectContent>
                    {GURLAN_ZONES.filter(z => z.is_active).map(z => (
                      <SelectItem key={z.id} value={z.name}>{z.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Taxminiy km</Label>
                  <Input type="number" placeholder="0" value={estimatedKm} onChange={e => setEstimatedKm(e.target.value)} />
                </div>
                <div>
                  <Label>Qo'shimcha narx</Label>
                  <Input type="number" placeholder="0" value={operatorAdd} onChange={e => setOperatorAdd(e.target.value)} />
                </div>
              </div>

              {/* Price calculator */}
              <Card className="border-2 border-primary/30 bg-primary/5">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">Narx kalkulyator</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Boshlang'ich:</span>
                      <span>{DEFAULT_SETTINGS.start_price.toLocaleString()} + {(parseFloat(operatorAdd) || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Km ({estimatedKm || 0} × {DEFAULT_SETTINGS.km_price.toLocaleString()}):</span>
                      <span>{price.kmTotal.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-border pt-1 flex justify-between font-bold text-taxi-lg">
                      <span>Jami:</span>
                      <span className="text-primary">{price.total.toLocaleString()} so'm</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Driver selection */}
              <div>
                <Label className="flex items-center gap-1"><Car className="w-3.5 h-3.5" /> Haydovchi tanlash</Label>
                <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                  <SelectTrigger><SelectValue placeholder="Avtomatik yoki tanlang" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">🔄 Avtomatik (eng yaqin)</SelectItem>
                    {eligibleDrivers.map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.full_name} — {d.car_model} ({d.car_plate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={createOrder} className="w-full taxi-gradient text-primary-foreground" size="lg">
                <Send className="w-4 h-4 mr-2" /> Buyurtma yaratish
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Active orders */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="font-bold text-taxi-lg">Faol buyurtmalar</h3>
          {MOCK_ORDERS.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status)).map(order => (
            <Card key={order.id} className={`border-l-4 ${
              order.dispatch_state === 'RED_TARGETED' ? 'border-l-destructive' : 'border-l-success'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        order.dispatch_state === 'RED_TARGETED' ? 'bg-destructive/20 taxi-text-red' : 'bg-success/20 taxi-text-green'
                      }`}>
                        {order.dispatch_state === 'RED_TARGETED' ? '🔴 RED' : '🟢 GREEN'}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        order.status === 'IN_TRIP' ? 'bg-primary/20 text-primary' :
                        order.status === 'ACCEPTED' ? 'bg-accent/20 text-accent' :
                        'bg-muted text-muted-foreground'
                      }`}>{order.status}</span>
                    </div>
                    <p className="font-medium">{order.pickup_zone} → {order.drop_zone || '—'}</p>
                    <p className="text-sm text-muted-foreground">{order.passenger_phone} {order.passenger_name && `• ${order.passenger_name}`}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(order.created_at).toLocaleTimeString('uz')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{order.total_price.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{order.estimated_km} km</p>
                    {order.accepted_by_driver_id && (
                      <p className="text-xs text-muted-foreground mt-1">
                        🚗 {MOCK_DRIVERS.find(d => d.id === order.accepted_by_driver_id)?.full_name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1">🟢 GREEN ga o'tkazish</Button>
                  <Button variant="destructive" size="sm">Bekor</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
