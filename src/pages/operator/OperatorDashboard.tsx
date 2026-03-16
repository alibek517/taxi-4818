import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { GURLAN_ZONES, MOCK_DRIVERS, DEFAULT_SETTINGS, MOCK_ORDERS } from '@/lib/types';
import type { OrderType } from '@/lib/types';
import { Car, Headphones, LogOut, Calculator, Send, Phone, MapPin, Clock, Package, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function OperatorDashboard() {
  const [orderType, setOrderType] = useState<OrderType>('TAXI');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [pickupZone, setPickupZone] = useState('');
  const [dropZone, setDropZone] = useState('');
  const [estimatedKm, setEstimatedKm] = useState('');
  const [operatorAdd, setOperatorAdd] = useState('0');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [deliveryDesc, setDeliveryDesc] = useState('');

  const price = useMemo(() => {
    const km = parseFloat(estimatedKm) || 0;
    const add = parseFloat(operatorAdd) || 0;
    if (orderType === 'DELIVERY') {
      // Delivery: faqat km * km_price
      const total = km * DEFAULT_SETTINGS.km_price;
      return { startPrice: 0, kmTotal: total, total };
    }
    const startPrice = DEFAULT_SETTINGS.start_price + add;
    const total = startPrice + (km * DEFAULT_SETTINGS.km_price);
    return { startPrice, kmTotal: km * DEFAULT_SETTINGS.km_price, total };
  }, [estimatedKm, operatorAdd, orderType]);

  const eligibleDrivers = MOCK_DRIVERS.filter(d => d.is_online && d.current_status === 'FREE' && !d.is_blocked);

  const createOrder = () => {
    if (!passengerPhone || !pickupZone) {
      toast.error("Telefon va olish zonasi majburiy!");
      return;
    }
    if (orderType === 'DELIVERY' && !dropZone) {
      toast.error("Dostavka uchun tushish zonasi majburiy!");
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

  const activeOrders = MOCK_ORDERS.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3">
        <div className="w-8 h-8 rounded-lg taxi-gradient flex items-center justify-center">
          <Headphones className="w-4 h-4 text-primary-foreground" />
        </div>
        <h1 className="font-bold text-lg">Operator</h1>
        <Badge variant="secondary" className="text-xs">{activeOrders.length} faol</Badge>
        <div className="flex-1" />
        <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">Admin</Link>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          <LogOut className="w-4 h-4" />
        </Link>
      </header>

      <div className="max-w-6xl mx-auto p-4 grid lg:grid-cols-5 gap-4">
        {/* Order creation form */}
        <div className="lg:col-span-2 space-y-3">
          {/* Order type toggle */}
          <Tabs value={orderType} onValueChange={v => setOrderType(v as OrderType)}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="TAXI" className="gap-1.5">
                <Car className="w-4 h-4" /> Taksi
              </TabsTrigger>
              <TabsTrigger value="DELIVERY" className="gap-1.5">
                <Package className="w-4 h-4" /> Dostavka
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div>
                <Label className="flex items-center gap-1 text-xs mb-1"><Phone className="w-3 h-3" /> Telefon</Label>
                <Input 
                  placeholder="+998 90 123 45 67" 
                  value={passengerPhone} 
                  onChange={e => setPassengerPhone(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="flex items-center gap-1 text-xs mb-1"><MapPin className="w-3 h-3" /> Qayerdan *</Label>
                  <Select value={pickupZone} onValueChange={setPickupZone}>
                    <SelectTrigger className="text-sm"><SelectValue placeholder="Zona" /></SelectTrigger>
                    <SelectContent>
                      {GURLAN_ZONES.filter(z => z.is_active).map(z => (
                        <SelectItem key={z.id} value={z.name}>{z.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="flex items-center gap-1 text-xs mb-1"><MapPin className="w-3 h-3" /> Qayerga {orderType === 'DELIVERY' ? '*' : ''}</Label>
                  <Select value={dropZone} onValueChange={setDropZone}>
                    <SelectTrigger className="text-sm"><SelectValue placeholder="Zona" /></SelectTrigger>
                    <SelectContent>
                      {GURLAN_ZONES.filter(z => z.is_active).map(z => (
                        <SelectItem key={z.id} value={z.name}>{z.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {orderType === 'DELIVERY' && (
                <div>
                  <Label className="text-xs mb-1">Nima yetkaziladi</Label>
                  <Textarea 
                    placeholder="Dori-darmon, ovqat, hujjat..." 
                    value={deliveryDesc} 
                    onChange={e => setDeliveryDesc(e.target.value)}
                    className="h-16 text-sm"
                  />
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

              {/* Price calculator */}
              <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Narx</span>
                  {orderType === 'DELIVERY' && (
                    <Badge variant="outline" className="text-xs ml-auto">📦 faqat km</Badge>
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  {orderType === 'TAXI' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Boshlang'ich:</span>
                      <span>{DEFAULT_SETTINGS.start_price.toLocaleString()} {(parseFloat(operatorAdd) || 0) > 0 && `+ ${(parseFloat(operatorAdd) || 0).toLocaleString()}`}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{estimatedKm || 0} km × {DEFAULT_SETTINGS.km_price.toLocaleString()}:</span>
                    <span>{price.kmTotal.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-border pt-1 flex justify-between font-bold text-lg">
                    <span>Jami:</span>
                    <span className="text-primary">{price.total.toLocaleString()} so'm</span>
                  </div>
                </div>
              </div>

              {/* Driver selection */}
              <div>
                <Label className="flex items-center gap-1 text-xs mb-1"><Car className="w-3 h-3" /> Haydovchi</Label>
                <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                  <SelectTrigger className="text-sm"><SelectValue placeholder="Avtomatik" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">🔄 Avtomatik</SelectItem>
                    {eligibleDrivers.map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.full_name} — {d.car_model}
                      </SelectItem>
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

        {/* Active orders */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Faol buyurtmalar</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              {eligibleDrivers.length} bo'sh haydovchi
            </div>
          </div>

          {activeOrders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Hozircha faol buyurtma yo'q
            </div>
          )}

          {activeOrders.map(order => (
            <Card key={order.id} className={`border-l-4 transition-all hover:shadow-md ${
              order.dispatch_state === 'RED_TARGETED' ? 'border-l-destructive' : 'border-l-success'
            }`}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Order type badge */}
                      <Badge variant={order.order_type === 'DELIVERY' ? 'outline' : 'secondary'} className="text-xs">
                        {order.order_type === 'DELIVERY' ? '📦' : '🚕'}
                      </Badge>
                      {/* Dispatch state */}
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        order.dispatch_state === 'RED_TARGETED' ? 'bg-destructive/20 taxi-text-red' : 'bg-success/20 taxi-text-green'
                      }`}>
                        {order.dispatch_state === 'RED_TARGETED' ? '🔴' : '🟢'}
                      </span>
                      {/* Status */}
                      <Badge variant="outline" className={`text-xs ${
                        order.status === 'IN_TRIP' ? 'border-primary text-primary' :
                        order.status === 'ACCEPTED' ? 'border-accent text-accent' :
                        ''
                      }`}>{order.status}</Badge>
                    </div>
                    <p className="font-medium text-sm">{order.pickup_zone} → {order.drop_zone || '—'}</p>
                    {order.order_type === 'DELIVERY' && order.delivery_description && (
                      <p className="text-xs text-muted-foreground bg-muted rounded px-2 py-1">📦 {order.delivery_description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{order.passenger_phone} {order.passenger_name && `• ${order.passenger_name}`}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold">{order.total_price.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{order.estimated_km} km</p>
                    {order.accepted_by_driver_id && (
                      <p className="text-xs text-muted-foreground">
                        🚗 {MOCK_DRIVERS.find(d => d.id === order.accepted_by_driver_id)?.full_name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(order.created_at).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-8">🟢 GREEN</Button>
                  <Button variant="destructive" size="sm" className="text-xs h-8">Bekor</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
