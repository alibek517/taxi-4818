import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MOCK_ORDERS, MOCK_DRIVERS, DEFAULT_SETTINGS } from '@/lib/types';
import type { Order } from '@/lib/types';
import { 
  Car, Wallet, MapPin, Phone, Navigation, CheckCircle, 
  Clock, Lock, Check, X, ArrowDown, ArrowUp, Star, 
  User, ClipboardList, LogOut, Power
} from 'lucide-react';
import { toast } from 'sonner';

const currentDriverId = 'd1';
const driver = MOCK_DRIVERS.find(d => d.id === currentDriverId)!;

type Section = 'home' | 'orders' | 'trip' | 'history' | 'profile';

export default function DriverDashboard() {
  const [section, setSection] = useState<Section>('home');
  const [isOnline, setIsOnline] = useState(true);
  const [orders, setOrders] = useState<Order[]>(
    MOCK_ORDERS.filter(o => ['CREATED', 'OFFERED'].includes(o.status) || 
      (o.accepted_by_driver_id === currentDriverId && ['ACCEPTED', 'ARRIVED', 'IN_TRIP'].includes(o.status)))
  );
  const [tripStatus, setTripStatus] = useState<'ACCEPTED' | 'ARRIVED' | 'WAITING' | 'IN_TRIP' | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  
  // Trip tracking
  const [tripKm, setTripKm] = useState(0);
  const [waitingSeconds, setWaitingSeconds] = useState(0);
  const [waitingCost, setWaitingCost] = useState(0);
  const tripInterval = useRef<NodeJS.Timeout | null>(null);
  const waitInterval = useRef<NodeJS.Timeout | null>(null);

  // Simulate km counting during IN_TRIP
  useEffect(() => {
    if (tripStatus === 'IN_TRIP') {
      tripInterval.current = setInterval(() => {
        setTripKm(prev => +(prev + 0.1).toFixed(1));
      }, 3000); // ~0.1 km every 3 seconds for demo
    } else {
      if (tripInterval.current) clearInterval(tripInterval.current);
    }
    return () => { if (tripInterval.current) clearInterval(tripInterval.current); };
  }, [tripStatus]);

  // Waiting timer
  useEffect(() => {
    if (tripStatus === 'WAITING') {
      waitInterval.current = setInterval(() => {
        setWaitingSeconds(prev => prev + 1);
        setWaitingCost(prev => {
          const perSec = DEFAULT_SETTINGS.waiting_price_per_minute / 60;
          return Math.round(prev + perSec);
        });
      }, 1000);
    } else {
      if (waitInterval.current) clearInterval(waitInterval.current);
    }
    return () => { if (waitInterval.current) clearInterval(waitInterval.current); };
  }, [tripStatus]);

  const isDriverBusy = !!activeOrder;

  const acceptOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setActiveOrder({ ...order, status: 'ACCEPTED', accepted_by_driver_id: currentDriverId });
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: 'ACCEPTED', accepted_by_driver_id: currentDriverId } : o
      ));
      setTripStatus('ACCEPTED');
      setSection('trip');
      toast.success("Buyurtma qabul qilindi!");
    }
  };

  const declineOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    toast("Buyurtma rad etildi");
  };

  const handleArrive = () => {
    setTripStatus('WAITING');
    toast.success("Yetib keldingiz! Kutish boshlanadi...");
  };

  const handlePassengerIn = () => {
    setTripStatus('IN_TRIP');
    setTripKm(0);
    toast.success("Safar boshlandi! Kilometr hisoblanmoqda...");
  };

  const handleComplete = () => {
    const kmCost = Math.round(tripKm * DEFAULT_SETTINGS.km_price);
    const totalCost = DEFAULT_SETTINGS.start_price + kmCost + waitingCost + (activeOrder?.operator_add || 0);
    toast.success(`Safar yakunlandi!\n${tripKm} km = ${kmCost.toLocaleString()} so'm\nKutish: ${waitingCost.toLocaleString()} so'm\nJami: ${totalCost.toLocaleString()} so'm`);
    setActiveOrder(null);
    setTripStatus(null);
    setTripKm(0);
    setWaitingSeconds(0);
    setWaitingCost(0);
    setSection('home');
  };

  const formatWaitTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg taxi-gradient flex items-center justify-center">
          <Car className="w-4 h-4 text-primary-foreground" />
        </div>
        <h1 className="font-bold text-taxi-base">Gurlan Taxi</h1>
        <button 
          onClick={() => setIsOnline(!isOnline)}
          className={`ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
            isOnline ? 'bg-success/20 taxi-text-green' : 'bg-muted text-muted-foreground'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          {isOnline ? 'ONLAYN' : 'OFLAYN'}
        </button>
      </header>

      {/* Content - scrollable */}
      <main className="flex-1 overflow-auto pb-16">
        {/* Active trip banner */}
        {activeOrder && section !== 'trip' && (
          <button 
            onClick={() => setSection('trip')}
            className="w-full p-3 taxi-gradient text-primary-foreground font-bold text-center animate-pulse"
          >
            🚗 Faol safar • {tripStatus === 'WAITING' ? `Kutish: ${formatWaitTime(waitingSeconds)}` : tripStatus === 'IN_TRIP' ? `${tripKm} km` : 'Yo\'lovchiga boring'} → Bosing
          </button>
        )}

        {/* === HOME SECTION === */}
        {section === 'home' && (
          <div className="p-4 space-y-4">
            <Card className="taxi-gradient">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center">
                    <Car className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-primary-foreground">
                    <h2 className="text-taxi-lg font-bold">{driver.full_name}</h2>
                    <p className="text-sm opacity-80">{driver.car_model} • {driver.car_plate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <ClipboardList className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-taxi-lg font-bold">{driver.completed_today}</p>
                  <p className="text-xs text-muted-foreground">Safarlar</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <Star className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-taxi-lg font-bold">{driver.rating}</p>
                  <p className="text-xs text-muted-foreground">Reyting</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <Wallet className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-taxi-lg font-bold">{(driver.balance / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-muted-foreground">Balans</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent orders preview */}
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-taxi-base">Yangi buyurtmalar</h3>
              <button onClick={() => setSection('orders')} className="text-sm text-primary font-medium">Hammasi →</button>
            </div>
            {orders.filter(o => !o.accepted_by_driver_id).slice(0, 2).map(order => (
              <Card key={order.id} className="taxi-card-green border-2">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{order.pickup_zone} → {order.drop_zone || '—'}</p>
                    <p className="text-xs text-muted-foreground">{order.estimated_km} km</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-taxi-base">{order.total_price.toLocaleString()}</p>
                    <Button size="sm" onClick={() => acceptOrder(order.id)} disabled={isDriverBusy} className="mt-1 taxi-gradient text-primary-foreground">
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* === ORDERS SECTION === */}
        {section === 'orders' && (
          <div className="p-4 space-y-3">
            <h2 className="text-taxi-xl font-bold">Buyurtmalar</h2>
            {orders.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-taxi-lg">Hozircha buyurtma yo'q</p>
                <p className="text-sm">Yangi buyurtma kutilmoqda...</p>
              </div>
            )}
            {orders.map(order => {
              const isTargeted = order.dispatch_state === 'RED_TARGETED';
              const isMyTarget = isTargeted && order.targeted_driver_id === currentDriverId;
              const isRed = isTargeted && !isMyTarget;
              const canAccept = !isDriverBusy && (isMyTarget || order.dispatch_state === 'GREEN_PUBLIC');
              const isMyActive = order.accepted_by_driver_id === currentDriverId;

              return (
                <Card key={order.id} className={`border-2 ${isMyActive ? 'border-primary bg-primary/5' : isRed ? 'taxi-card-red' : 'taxi-card-green'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {isRed && <Lock className="w-4 h-4 text-destructive" />}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          isRed ? 'bg-destructive/20 taxi-text-red' : isMyActive ? 'bg-primary/20 text-primary' : 'bg-success/20 taxi-text-green'
                        }`}>
                          {isMyActive ? order.status : isRed ? 'BAND' : 'BARCHAGA'}
                        </span>
                      </div>
                      <p className="text-taxi-xl font-bold">{order.total_price.toLocaleString()}</p>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-success" />
                        <span className="text-taxi-base font-medium">{order.pickup_zone}</span>
                      </div>
                      {order.drop_zone && (
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
                          <span className="text-taxi-base">{order.drop_zone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {order.estimated_km} km</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(order.created_at).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    {isRed && <p className="text-sm taxi-text-red mb-2">Band. Boshqa taksiga yuborilgan.</p>}
                    {isMyActive ? (
                      <Button onClick={() => setSection('trip')} className="w-full" size="lg">Safarni ko'rish</Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={() => acceptOrder(order.id)} disabled={!canAccept} className="flex-1 taxi-gradient text-primary-foreground" size="lg">
                          <Check className="w-5 h-5 mr-1" /> Qabul
                        </Button>
                        <Button onClick={() => declineOrder(order.id)} variant="outline" size="lg" disabled={isRed}>
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* === TRIP SECTION === */}
        {section === 'trip' && activeOrder && (
          <div className="p-4 space-y-4">
            <div className={`text-center py-3 rounded-xl font-bold text-taxi-lg ${
              tripStatus === 'ACCEPTED' ? 'bg-primary/20 text-primary' :
              tripStatus === 'WAITING' ? 'bg-warning/20 text-warning' :
              tripStatus === 'IN_TRIP' ? 'bg-success/20 taxi-text-green' :
              'bg-muted text-muted-foreground'
            }`}>
              {tripStatus === 'ACCEPTED' && "Yo'lovchiga yetib boring"}
              {tripStatus === 'WAITING' && `Yo'lovchini kutmoqdasiz • ${formatWaitTime(waitingSeconds)}`}
              {tripStatus === 'IN_TRIP' && `Safar davom etmoqda • ${tripKm} km`}
            </div>

            {/* Live stats */}
            <div className="grid grid-cols-3 gap-2">
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">Kilometr</p>
                  <p className="text-taxi-xl font-bold">{tripKm}</p>
                  <p className="text-xs text-muted-foreground">km</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">Kutish</p>
                  <p className="text-taxi-xl font-bold">{formatWaitTime(waitingSeconds)}</p>
                  <p className="text-xs text-muted-foreground">{waitingCost.toLocaleString()} so'm</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">Jami</p>
                  <p className="text-taxi-xl font-bold">
                    {(DEFAULT_SETTINGS.start_price + Math.round(tripKm * DEFAULT_SETTINGS.km_price) + waitingCost + (activeOrder.operator_add || 0)).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">so'm</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-taxi-base font-medium">{activeOrder.pickup_zone}</span>
                  </div>
                  {activeOrder.drop_zone && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <span className="text-taxi-base">{activeOrder.drop_zone}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <a href={`tel:${activeOrder.passenger_phone}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="lg">
                      <Phone className="w-5 h-5 mr-2" /> Qo'ng'iroq
                    </Button>
                  </a>
                  <Button variant="outline" size="lg">
                    <Navigation className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {tripStatus === 'ACCEPTED' && (
                <Button onClick={handleArrive} className="w-full taxi-gradient text-primary-foreground h-16 text-taxi-lg" size="lg">
                  <MapPin className="w-6 h-6 mr-2" /> Yetib keldim
                </Button>
              )}
              {tripStatus === 'WAITING' && (
                <div className="space-y-2">
                  <div className="text-center p-2 bg-warning/10 rounded-lg">
                    <p className="text-sm text-warning font-medium">
                      Kutish narxi: {DEFAULT_SETTINGS.waiting_price_per_minute} so'm/min
                    </p>
                    <p className="text-taxi-lg font-bold text-warning">{waitingCost.toLocaleString()} so'm</p>
                  </div>
                  <Button onClick={handlePassengerIn} className="w-full bg-success text-success-foreground h-16 text-taxi-lg" size="lg">
                    <Navigation className="w-6 h-6 mr-2" /> Yo'lovchi chiqdi — Safarni boshlash
                  </Button>
                </div>
              )}
              {tripStatus === 'IN_TRIP' && (
                <Button onClick={handleComplete} className="w-full bg-accent text-accent-foreground h-16 text-taxi-lg" size="lg">
                  <CheckCircle className="w-6 h-6 mr-2" /> Safarni yakunlash
                </Button>
              )}
            </div>
          </div>
        )}

        {section === 'trip' && !activeOrder && (
          <div className="p-4 text-center py-20">
            <p className="text-taxi-lg text-muted-foreground">Faol safar yo'q</p>
            <Button onClick={() => setSection('orders')} className="mt-4">Buyurtmalarga o'tish</Button>
          </div>
        )}

        {/* === HISTORY SECTION === */}
        {section === 'history' && (
          <div className="p-4 space-y-3">
            <h2 className="text-taxi-xl font-bold">Tarix</h2>
            {[
              ...MOCK_ORDERS.filter(o => o.status === 'COMPLETED').map(o => ({
                type: 'income' as const,
                label: `${o.pickup_zone} → ${o.drop_zone || '—'}`,
                amount: o.total_price,
                time: o.completed_at || o.created_at,
              })),
              { type: 'expense' as const, label: "Xizmat to'lovi", amount: -500, time: new Date().toISOString() },
              { type: 'income' as const, label: 'Bonus', amount: 500, time: new Date().toISOString() },
            ].map((item, i) => (
              <Card key={i} className={`border-l-4 ${item.type === 'income' ? 'border-l-success' : 'border-l-destructive'}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.type === 'income' ? 'bg-success/20' : 'bg-destructive/20'}`}>
                      {item.type === 'income' ? <ArrowDown className="w-4 h-4 taxi-text-green" /> : <ArrowUp className="w-4 h-4 taxi-text-red" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{new Date(item.time).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <span className={`font-bold text-taxi-base ${item.type === 'income' ? 'taxi-text-green' : 'taxi-text-red'}`}>
                    {item.type === 'income' ? '+' : ''}{Math.abs(item.amount).toLocaleString()}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* === PROFILE SECTION === */}
        {section === 'profile' && (
          <div className="p-4 space-y-4">
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-full bg-primary mx-auto flex items-center justify-center mb-3">
                <Car className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-taxi-xl font-bold">{driver.full_name}</h2>
              <p className="text-muted-foreground">{driver.phone}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Star className="w-4 h-4 text-primary" />
                <span className="font-medium">{driver.rating}</span>
              </div>
            </div>
            <Card>
              <CardContent className="p-4 space-y-3">
                {[
                  ['Mashina', driver.car_model],
                  ['Raqam', driver.car_plate],
                  ['Rang', driver.car_color],
                  ['Bugungi safarlar', driver.completed_today],
                  ['Balans', `${driver.balance.toLocaleString()} so'm`],
                ].map(([label, val]) => (
                  <div key={String(label)} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{val}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Button variant="outline" className="w-full" size="lg">
              <LogOut className="w-5 h-5 mr-2" /> Chiqish
            </Button>
          </div>
        )}
      </main>

      {/* Bottom tabs */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex z-50">
        {([
          { id: 'home' as const, icon: Car, label: 'Asosiy' },
          { id: 'orders' as const, icon: ClipboardList, label: 'Buyurtmalar' },
          { id: 'history' as const, icon: Clock, label: 'Tarix' },
          { id: 'profile' as const, icon: User, label: 'Profil' },
        ]).map(tab => {
          const isActive = section === tab.id;
          const hasNotif = tab.id === 'orders' && orders.filter(o => !o.accepted_by_driver_id).length > 0;
          return (
            <button
              key={tab.id}
              onClick={() => setSection(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors relative ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
              {hasNotif && (
                <span className="absolute top-1 right-1/4 w-2.5 h-2.5 bg-destructive rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
