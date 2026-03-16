import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MOCK_ORDERS, MOCK_DRIVERS, DEFAULT_SETTINGS } from '@/lib/types';
import type { Order } from '@/lib/types';
import { 
  Car, Wallet, MapPin, Phone, Navigation, CheckCircle, 
  Clock, Lock, Check, X, ArrowDown, ArrowUp, Star, 
  User, ClipboardList, LogOut, Power, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

const currentDriverId = 'd1';
const driver = MOCK_DRIVERS.find(d => d.id === currentDriverId)!;

export default function DriverDashboard() {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(true);
  const [orders, setOrders] = useState<Order[]>(
    MOCK_ORDERS.filter(o => ['CREATED', 'OFFERED'].includes(o.status) || 
      (o.accepted_by_driver_id === currentDriverId && ['ACCEPTED', 'ARRIVED', 'IN_TRIP'].includes(o.status)))
  );
  const [tripStatus, setTripStatus] = useState<'ACCEPTED' | 'ARRIVED' | 'WAITING' | 'IN_TRIP' | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  
  // Collapsible sections
  const [showHistory, setShowHistory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // Trip tracking
  const [tripKm, setTripKm] = useState(0);
  const [waitingSeconds, setWaitingSeconds] = useState(0);
  const [waitingCost, setWaitingCost] = useState(0);
  const tripInterval = useRef<NodeJS.Timeout | null>(null);
  const waitInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (tripStatus === 'IN_TRIP') {
      tripInterval.current = setInterval(() => {
        setTripKm(prev => +(prev + 0.1).toFixed(1));
      }, 3000);
    } else {
      if (tripInterval.current) clearInterval(tripInterval.current);
    }
    return () => { if (tripInterval.current) clearInterval(tripInterval.current); };
  }, [tripStatus]);

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
  };

  const formatWaitTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const totalPrice = activeOrder 
    ? DEFAULT_SETTINGS.start_price + Math.round(tripKm * DEFAULT_SETTINGS.km_price) + waitingCost + (activeOrder.operator_add || 0)
    : 0;

  const availableOrders = orders.filter(o => !o.accepted_by_driver_id);

  const historyItems = [
    ...MOCK_ORDERS.filter(o => o.status === 'COMPLETED').map(o => ({
      type: 'income' as const,
      label: `${o.pickup_zone} → ${o.drop_zone || '—'}`,
      amount: o.total_price,
      time: o.completed_at || o.created_at,
    })),
    { type: 'expense' as const, label: "Xizmat to'lovi", amount: -500, time: new Date().toISOString() },
    { type: 'income' as const, label: 'Bonus', amount: 500, time: new Date().toISOString() },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 h-14 border-b border-border bg-card flex items-center px-4 gap-3">
        <div className="w-8 h-8 rounded-lg taxi-gradient flex items-center justify-center">
          <Car className="w-4 h-4 text-primary-foreground" />
        </div>
        <h1 className="font-bold text-taxi-base">Gurlan Taxi</h1>
        <div className="ml-auto flex items-center gap-2">
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              isOnline ? 'bg-success/20 taxi-text-green' : 'bg-muted text-muted-foreground'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {isOnline ? 'ONLAYN' : 'OFLAYN'}
          </button>
          <button onClick={() => setShowProfile(!showProfile)} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </header>

      {/* Profile dropdown */}
      {showProfile && (
        <div className="border-b border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Car className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-taxi-base">{driver.full_name}</h3>
              <p className="text-sm text-muted-foreground">{driver.phone}</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Star className="w-4 h-4 text-primary" />
              <span className="font-medium">{driver.rating}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between bg-muted/50 p-2 rounded">
              <span className="text-muted-foreground">Mashina</span>
              <span className="font-medium">{driver.car_model} {driver.car_color}</span>
            </div>
            <div className="flex justify-between bg-muted/50 p-2 rounded">
              <span className="text-muted-foreground">Raqam</span>
              <span className="font-medium">{driver.car_plate}</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/login')}>
            <LogOut className="w-4 h-4 mr-2" /> Chiqish
          </Button>
        </div>
      )}

      <main className="p-4 space-y-4">
        {/* === STATS ROW === */}
        <div className="grid grid-cols-3 gap-2">
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

        {/* === ACTIVE TRIP === */}
        {activeOrder && (
          <Card className="border-2 border-primary">
            <CardContent className="p-4 space-y-3">
              <div className={`text-center py-2 rounded-lg font-bold text-taxi-base ${
                tripStatus === 'ACCEPTED' ? 'bg-primary/20 text-primary' :
                tripStatus === 'WAITING' ? 'bg-warning/20 text-warning' :
                tripStatus === 'IN_TRIP' ? 'bg-success/20 taxi-text-green' :
                'bg-muted text-muted-foreground'
              }`}>
                {tripStatus === 'ACCEPTED' && "🚗 Yo'lovchiga yetib boring"}
                {tripStatus === 'WAITING' && `⏳ Kutmoqdasiz • ${formatWaitTime(waitingSeconds)}`}
                {tripStatus === 'IN_TRIP' && `🛣 Safar • ${tripKm} km`}
              </div>

              {/* Live stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted/50 p-2 rounded">
                  <p className="text-xs text-muted-foreground">KM</p>
                  <p className="text-taxi-lg font-bold">{tripKm}</p>
                </div>
                <div className="bg-muted/50 p-2 rounded">
                  <p className="text-xs text-muted-foreground">Kutish</p>
                  <p className="text-taxi-lg font-bold">{formatWaitTime(waitingSeconds)}</p>
                  <p className="text-[10px] text-muted-foreground">{waitingCost.toLocaleString()}</p>
                </div>
                <div className="bg-muted/50 p-2 rounded">
                  <p className="text-xs text-muted-foreground">Jami</p>
                  <p className="text-taxi-lg font-bold">{totalPrice.toLocaleString()}</p>
                </div>
              </div>

              {/* Route */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-success" />
                  <span className="font-medium">{activeOrder.pickup_zone}</span>
                </div>
                {activeOrder.drop_zone && (
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
                    <span>{activeOrder.drop_zone}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <a href={`tel:${activeOrder.passenger_phone}`} className="flex-1">
                  <Button variant="outline" className="w-full" size="lg">
                    <Phone className="w-5 h-5 mr-1" /> Qo'ng'iroq
                  </Button>
                </a>
                <Button variant="outline" size="lg">
                  <Navigation className="w-5 h-5" />
                </Button>
              </div>

              {tripStatus === 'ACCEPTED' && (
                <Button onClick={handleArrive} className="w-full taxi-gradient text-primary-foreground h-14 text-taxi-lg" size="lg">
                  <MapPin className="w-6 h-6 mr-2" /> Yetib keldim
                </Button>
              )}
              {tripStatus === 'WAITING' && (
                <div className="space-y-2">
                  <div className="text-center p-2 bg-warning/10 rounded-lg">
                    <p className="text-sm text-warning font-medium">Kutish: {DEFAULT_SETTINGS.waiting_price_per_minute} so'm/min</p>
                    <p className="text-taxi-lg font-bold text-warning">{waitingCost.toLocaleString()} so'm</p>
                  </div>
                  <Button onClick={handlePassengerIn} className="w-full bg-success text-success-foreground h-14 text-taxi-lg" size="lg">
                    <Navigation className="w-6 h-6 mr-2" /> Safarni boshlash
                  </Button>
                </div>
              )}
              {tripStatus === 'IN_TRIP' && (
                <Button onClick={handleComplete} className="w-full bg-accent text-accent-foreground h-14 text-taxi-lg" size="lg">
                  <CheckCircle className="w-6 h-6 mr-2" /> Yakunlash
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* === ORDERS LIST === */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-taxi-lg font-bold flex items-center gap-2">
              <ClipboardList className="w-5 h-5" /> Buyurtmalar
              {availableOrders.length > 0 && (
                <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                  {availableOrders.length}
                </span>
              )}
            </h2>
          </div>

          {availableOrders.length === 0 && !activeOrder && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Yangi buyurtma kutilmoqda...</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {orders.filter(o => o.accepted_by_driver_id !== currentDriverId).map(order => {
              const isTargeted = order.dispatch_state === 'RED_TARGETED';
              const isMyTarget = isTargeted && order.targeted_driver_id === currentDriverId;
              const isRed = isTargeted && !isMyTarget;
              const canAccept = !isDriverBusy && (isMyTarget || order.dispatch_state === 'GREEN_PUBLIC');

              return (
                <Card key={order.id} className={`border-2 ${isRed ? 'taxi-card-red' : 'taxi-card-green'}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isRed && <Lock className="w-3.5 h-3.5 text-destructive" />}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          isRed ? 'bg-destructive/20 taxi-text-red' : 'bg-success/20 taxi-text-green'
                        }`}>
                          {isRed ? 'BAND' : 'BARCHAGA'}
                        </span>
                      </div>
                      <p className="text-taxi-lg font-bold">{order.total_price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <span className="text-sm font-medium">{order.pickup_zone}</span>
                      {order.drop_zone && (
                        <>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-sm">{order.drop_zone}</span>
                        </>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">{order.estimated_km} km</span>
                    </div>
                    {isRed ? (
                      <p className="text-xs taxi-text-red">Band. Boshqa taksiga yuborilgan.</p>
                    ) : (
                      <div className="flex gap-2 mt-2">
                        <Button onClick={() => acceptOrder(order.id)} disabled={!canAccept} className="flex-1 taxi-gradient text-primary-foreground" size="sm">
                          <Check className="w-4 h-4 mr-1" /> Qabul
                        </Button>
                        <Button onClick={() => declineOrder(order.id)} variant="outline" size="sm">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* === HISTORY (collapsible) === */}
        <div>
          <button 
            onClick={() => setShowHistory(!showHistory)} 
            className="w-full flex items-center justify-between py-2"
          >
            <h2 className="text-taxi-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5" /> Tarix
            </h2>
            {showHistory ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </button>
          {showHistory && (
            <div className="space-y-2">
              {historyItems.map((item, i) => (
                <Card key={i} className={`border-l-4 ${item.type === 'income' ? 'border-l-success' : 'border-l-destructive'}`}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${item.type === 'income' ? 'bg-success/20' : 'bg-destructive/20'}`}>
                        {item.type === 'income' ? <ArrowDown className="w-3.5 h-3.5 taxi-text-green" /> : <ArrowUp className="w-3.5 h-3.5 taxi-text-red" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{new Date(item.time).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <span className={`font-bold ${item.type === 'income' ? 'taxi-text-green' : 'taxi-text-red'}`}>
                      {item.type === 'income' ? '+' : ''}{Math.abs(item.amount).toLocaleString()}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
