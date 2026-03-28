import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { OrderType } from '@/lib/types';
import { Car, Headphones, LogOut, Calculator, Send, Phone, MapPin, Clock, Package, Users } from 'lucide-react';
import { toast } from 'sonner';
import zippyLogo from '@/assets/zippy-logo.png';

export default function OperatorDashboard() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [orderType, setOrderType] = useState<OrderType>('TAXI');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [pickupZone, setPickupZone] = useState('');
  const [dropZone, setDropZone] = useState('');
  const [estimatedKm, setEstimatedKm] = useState('');
  const [operatorAdd, setOperatorAdd] = useState('0');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [deliveryDesc, setDeliveryDesc] = useState('');

  const [zones, setZones] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ start_price: 3000, km_price: 5000 });

  useEffect(() => {
    const fetchAll = async () => {
      const [zonesRes, driversRes, ordersRes, settingsRes] = await Promise.all([
        supabase.from('zones').select('*').eq('is_active', true),
        supabase.from('drivers').select('*').eq('auth_status', 'approved').eq('is_online', true),
        supabase.from('orders').select('*').not('status', 'in', '("COMPLETED","CANCELLED")').order('created_at', { ascending: false }),
        supabase.from('system_settings').select('*').limit(1).maybeSingle(),
      ]);
      setZones(zonesRes.data || []);
      setDrivers(driversRes.data || []);
      setActiveOrders(ordersRes.data || []);
      if (settingsRes.data) setSettings(settingsRes.data);
    };
    fetchAll();

    // Subscribe to order changes
    const channel = supabase
      .channel('operator-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        supabase.from('orders').select('*').not('status', 'in', '("COMPLETED","CANCELLED")').order('created_at', { ascending: false })
          .then(({ data }) => setActiveOrders(data || []));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const price = useMemo(() => {
    const km = parseFloat(estimatedKm) || 0;
    const add = parseFloat(operatorAdd) || 0;
    if (orderType === 'DELIVERY') {
      const total = km * settings.km_price;
      return { startPrice: 0, kmTotal: total, total };
    }
    const startPrice = settings.start_price + add;
    const total = startPrice + (km * settings.km_price);
    return { startPrice, kmTotal: km * settings.km_price, total };
  }, [estimatedKm, operatorAdd, orderType, settings]);

  const eligibleDrivers = drivers.filter((d: any) => d.current_status === 'FREE' && !d.is_blocked);

  const createOrder = async () => {
    if (!passengerPhone || !pickupZone) {
      toast.error("Telefon va olish zonasi majburiy!");
      return;
    }
    if (orderType === 'DELIVERY' && !dropZone) {
      toast.error("Dostavka uchun tushish zonasi majburiy!");
      return;
    }

    const km = parseFloat(estimatedKm) || 0;
    const add = parseFloat(operatorAdd) || 0;

    const { error } = await supabase.from('orders').insert({
      order_type: orderType,
      passenger_phone: passengerPhone,
      pickup_zone: pickupZone,
      drop_zone: dropZone || null,
      estimated_km: km,
      start_price: orderType === 'TAXI' ? settings.start_price : 0,
      km_price: settings.km_price,
      operator_add: orderType === 'TAXI' ? add : 0,
      total_price: price.total,
      delivery_description: orderType === 'DELIVERY' ? deliveryDesc : null,
      targeted_driver_id: selectedDriver && selectedDriver !== 'auto' ? selectedDriver : null,
      dispatch_state: selectedDriver && selectedDriver !== 'auto' ? 'RED_TARGETED' : 'GREEN_PUBLIC',
      created_by: user?.id || null,
    });

    if (error) {
      toast.error("Buyurtma yaratishda xatolik");
      return;
    }

    const typeLabel = orderType === 'DELIVERY' ? '📦 Dostavka' : '🚕 Taksi';
    toast.success(`${typeLabel} buyurtma yaratildi! Jami: ${price.total.toLocaleString()} so'm`);
    setPassengerPhone('');
    setPickupZone('');
    setDropZone('');
    setEstimatedKm('');
    setOperatorAdd('0');
    setSelectedDriver('');
    setDeliveryDesc('');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3">
        <img src={zippyLogo} alt="Zippy" className="w-8 h-8 rounded-lg object-cover" />
        <h1 className="font-bold text-lg">Operator</h1>
        <Badge variant="secondary" className="text-xs">{activeOrders.length} faol</Badge>
        <div className="flex-1" />
        <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-foreground">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <div className="max-w-6xl mx-auto p-4 grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <Tabs value={orderType} onValueChange={v => setOrderType(v as OrderType)}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="TAXI" className="gap-1.5"><Car className="w-4 h-4" /> Taksi</TabsTrigger>
              <TabsTrigger value="DELIVERY" className="gap-1.5"><Package className="w-4 h-4" /> Dostavka</TabsTrigger>
            </TabsList>
          </Tabs>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div>
                <Label className="flex items-center gap-1 text-xs mb-1"><Phone className="w-3 h-3" /> Telefon</Label>
                <Input placeholder="+998 90 123 45 67" value={passengerPhone} onChange={e => setPassengerPhone(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="flex items-center gap-1 text-xs mb-1"><MapPin className="w-3 h-3" /> Qayerdan *</Label>
                  <Select value={pickupZone} onValueChange={setPickupZone}>
                    <SelectTrigger className="text-sm"><SelectValue placeholder="Zona" /></SelectTrigger>
                    <SelectContent>
                      {zones.map((z: any) => (<SelectItem key={z.id} value={z.name}>{z.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="flex items-center gap-1 text-xs mb-1"><MapPin className="w-3 h-3" /> Qayerga {orderType === 'DELIVERY' ? '*' : ''}</Label>
                  <Select value={dropZone} onValueChange={setDropZone}>
                    <SelectTrigger className="text-sm"><SelectValue placeholder="Zona" /></SelectTrigger>
                    <SelectContent>
                      {zones.map((z: any) => (<SelectItem key={z.id} value={z.name}>{z.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {orderType === 'DELIVERY' && (
                <div>
                  <Label className="text-xs mb-1">Nima yetkaziladi</Label>
                  <Textarea placeholder="Dori-darmon, ovqat, hujjat..." value={deliveryDesc} onChange={e => setDeliveryDesc(e.target.value)} className="h-16 text-sm" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs mb-1">Km</Label>
                  <Input type="number" placeholder="0" value={estimatedKm} onChange={e => setEstimatedKm(e.target.value)} />
                </div>
                {orderType === 'TAXI' && (
                  <div>
                    <Label className="text-xs mb-1">Qo'shimcha</Label>
                    <Input type="number" placeholder="0" value={operatorAdd} onChange={e => setOperatorAdd(e.target.value)} />
                  </div>
                )}
              </div>

              <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Narx</span>
                  {orderType === 'DELIVERY' && <Badge variant="outline" className="text-xs ml-auto">📦 faqat km</Badge>}
                </div>
                <div className="space-y-1 text-sm">
                  {orderType === 'TAXI' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Boshlang'ich:</span>
                      <span>{settings.start_price.toLocaleString()} {(parseFloat(operatorAdd) || 0) > 0 && `+ ${(parseFloat(operatorAdd) || 0).toLocaleString()}`}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{estimatedKm || 0} km × {settings.km_price.toLocaleString()}:</span>
                    <span>{price.kmTotal.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-border pt-1 flex justify-between font-bold text-lg">
                    <span>Jami:</span>
                    <span className="text-primary">{price.total.toLocaleString()} so'm</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-1 text-xs mb-1"><Car className="w-3 h-3" /> Haydovchi</Label>
                <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                  <SelectTrigger className="text-sm"><SelectValue placeholder="Avtomatik" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">🔄 Avtomatik</SelectItem>
                    {eligibleDrivers.map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>{d.full_name} — {d.car_model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={createOrder} className="w-full taxi-gradient text-primary-foreground" size="lg">
                <Send className="w-4 h-4 mr-2" />
                {orderType === 'DELIVERY' ? '📦 Dostavka yaratish' : '🚕 Buyurtma yaratish'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Faol buyurtmalar</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              {eligibleDrivers.length} bo'sh haydovchi
            </div>
          </div>

          {activeOrders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">Hozircha faol buyurtma yo'q</div>
          )}

          {activeOrders.map((order: any) => (
            <Card key={order.id} className={`border-l-4 transition-all hover:shadow-md ${
              order.dispatch_state === 'RED_TARGETED' ? 'border-l-destructive' : 'border-l-success'
            }`}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant={order.order_type === 'DELIVERY' ? 'outline' : 'secondary'} className="text-xs">
                        {order.order_type === 'DELIVERY' ? '📦' : '🚕'}
                      </Badge>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        order.dispatch_state === 'RED_TARGETED' ? 'bg-destructive/20 taxi-text-red' : 'bg-success/20 taxi-text-green'
                      }`}>{order.dispatch_state === 'RED_TARGETED' ? '🔴' : '🟢'}</span>
                      <Badge variant="outline" className={`text-xs ${
                        order.status === 'IN_TRIP' ? 'border-primary text-primary' :
                        order.status === 'ACCEPTED' ? 'border-accent text-accent' : ''
                      }`}>{order.status}</Badge>
                    </div>
                    <p className="font-medium text-sm">{order.pickup_zone} → {order.drop_zone || '—'}</p>
                    {order.order_type === 'DELIVERY' && order.delivery_description && (
                      <p className="text-xs text-muted-foreground bg-muted rounded px-2 py-1">📦 {order.delivery_description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{order.passenger_phone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold">{(order.total_price || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{order.estimated_km} km</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(order.created_at).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
