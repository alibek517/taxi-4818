import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Car, Wallet, MapPin, Phone, Navigation, CheckCircle, 
  Clock, Lock, Check, X, ArrowDown, ArrowUp, Star, 
  User, ClipboardList, LogOut, Power, ChevronDown, ChevronUp,
  Volume2, Users
} from 'lucide-react';
import { toast } from 'sonner';
import zippyLogo from '@/assets/zippy-logo.png';

const playOrderSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playTone = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start); osc.stop(ctx.currentTime + start + dur);
    };
    playTone(880, 0, 0.2); playTone(1100, 0.25, 0.2); playTone(1320, 0.5, 0.4);
  } catch {}
};

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [driver, setDriver] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [tripStatus, setTripStatus] = useState<'ACCEPTED' | 'ARRIVED' | 'WAITING' | 'IN_TRIP' | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [tripKm, setTripKm] = useState(0);
  const [waitingSeconds, setWaitingSeconds] = useState(0);
  const [waitingCost, setWaitingCost] = useState(0);
  const [settings, setSettings] = useState<any>({ start_price: 3000, km_price: 5000, waiting_price_per_minute: 500 });
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const tripInterval = useRef<NodeJS.Timeout | null>(null);
  const waitInterval = useRef<NodeJS.Timeout | null>(null);
  const notifiedOrders = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [driverRes, settingsRes] = await Promise.all([
        supabase.from('drivers').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('system_settings').select('*').limit(1).maybeSingle(),
      ]);
      if (driverRes.data) setDriver(driverRes.data);
      if (settingsRes.data) setSettings(settingsRes.data);
      
      // Fetch available orders
      fetchOrders();
      // Fetch history
      const { data: histData } = await supabase.from('orders').select('*')
        .eq('accepted_by_driver_id', user.id).in('status', ['COMPLETED', 'CANCELLED'])
        .order('completed_at', { ascending: false }).limit(20);
      setHistoryItems((histData || []).map((o: any) => ({
        type: o.status === 'COMPLETED' ? 'income' as const : 'expense' as const,
        label: `${o.pickup_zone} → ${o.drop_zone || '—'}`,
        amount: o.status === 'COMPLETED' ? o.total_price : 0,
        time: o.completed_at || o.created_at,
      })));
    };
    fetchData();

    // Subscribe to new orders
    const channel = supabase
      .channel('driver-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    const { data } = await supabase.from('orders').select('*')
      .in('status', ['CREATED', 'OFFERED'])
      .order('created_at', { ascending: false });
    
    // Also check for my active order
    const { data: myActive } = await supabase.from('orders').select('*')
      .eq('accepted_by_driver_id', user.id)
      .in('status', ['ACCEPTED', 'ARRIVED', 'WAITING', 'IN_TRIP'])
      .maybeSingle();
    
    if (myActive) {
      setActiveOrder(myActive);
      setTripStatus(myActive.status as any);
    }
    
    setOrders(data || []);
  };

  // Sound for targeted orders
  useEffect(() => {
    if (!user) return;
    orders.forEach(order => {
      if (order.dispatch_state === 'RED_TARGETED' && order.targeted_driver_id === user.id && !notifiedOrders.current.has(order.id)) {
        notifiedOrders.current.add(order.id);
        playOrderSound();
        toast("🔔 Yangi buyurtma sizga tayinlandi!", {
          description: `${order.pickup_zone} → ${order.drop_zone || '—'} • ${(order.total_price || 0).toLocaleString()} so'm`,
          duration: 8000,
        });
      }
    });
  }, [orders, user]);

  useEffect(() => {
    if (tripStatus === 'IN_TRIP') {
      tripInterval.current = setInterval(() => setTripKm(prev => +(prev + 0.1).toFixed(1)), 3000);
    } else { if (tripInterval.current) clearInterval(tripInterval.current); }
    return () => { if (tripInterval.current) clearInterval(tripInterval.current); };
  }, [tripStatus]);

  useEffect(() => {
    if (tripStatus === 'WAITING') {
      waitInterval.current = setInterval(() => {
        setWaitingSeconds(prev => prev + 1);
        setWaitingCost(prev => Math.round(prev + settings.waiting_price_per_minute / 60));
      }, 1000);
    } else { if (waitInterval.current) clearInterval(waitInterval.current); }
    return () => { if (waitInterval.current) clearInterval(waitInterval.current); };
  }, [tripStatus, settings]);

  const toggleOnline = async () => {
    if (!user) return;
    const newStatus = !isOnline;
    await supabase.from('drivers').update({ is_online: newStatus, current_status: newStatus ? 'FREE' : 'OFFLINE' }).eq('id', user.id);
    setIsOnline(newStatus);
    setDriver((prev: any) => prev ? { ...prev, is_online: newStatus } : prev);
  };

  const acceptOrder = async (orderId: string) => {
    if (!user) return;
    const { error } = await supabase.from('orders').update({
      status: 'ACCEPTED', accepted_by_driver_id: user.id, dispatch_state: 'GREEN_PUBLIC'
    }).eq('id', orderId);
    if (error) { toast.error("Qabul qilishda xatolik"); return; }
    await supabase.from('drivers').update({ current_status: 'BUSY' }).eq('id', user.id);
    const order = orders.find(o => o.id === orderId);
    if (order) { setActiveOrder({ ...order, status: 'ACCEPTED', accepted_by_driver_id: user.id }); setTripStatus('ACCEPTED'); }
    toast.success("Buyurtma qabul qilindi!");
    fetchOrders();
  };

  const declineOrder = async (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    toast("Buyurtma rad etildi");
  };

  const handleArrive = async () => {
    if (!activeOrder) return;
    await supabase.from('orders').update({ status: 'WAITING' }).eq('id', activeOrder.id);
    setTripStatus('WAITING');
    toast.success("Yetib keldingiz! Kutish boshlanadi...");
  };

  const handlePassengerIn = async () => {
    if (!activeOrder) return;
    await supabase.from('orders').update({ status: 'IN_TRIP' }).eq('id', activeOrder.id);
    await supabase.from('drivers').update({ current_status: 'IN_TRIP' }).eq('id', user!.id);
    setTripStatus('IN_TRIP');
    setTripKm(0);
    toast.success("Safar boshlandi!");
  };

  const handleComplete = async () => {
    if (!activeOrder || !user) return;
    const kmCost = Math.round(tripKm * settings.km_price);
    const totalCost = settings.start_price + kmCost + waitingCost + (activeOrder.operator_add || 0);
    await supabase.from('orders').update({ status: 'COMPLETED', total_price: totalCost, completed_at: new Date().toISOString() }).eq('id', activeOrder.id);
    await supabase.from('drivers').update({ current_status: 'FREE', completed_today: (driver?.completed_today || 0) + 1 }).eq('id', user.id);
    toast.success(`Safar yakunlandi! Jami: ${totalCost.toLocaleString()} so'm`);
    setActiveOrder(null); setTripStatus(null); setTripKm(0); setWaitingSeconds(0); setWaitingCost(0);
    fetchOrders();
  };

  const formatWaitTime = (secs: number) => `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;
  const totalPrice = activeOrder ? settings.start_price + Math.round(tripKm * settings.km_price) + waitingCost + (activeOrder.operator_add || 0) : 0;
  const availableOrders = orders.filter(o => !o.accepted_by_driver_id);

  const handleLogout = async () => { await signOut(); navigate('/login'); };

  if (!driver) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 h-14 border-b border-border bg-card flex items-center px-4 gap-3">
        <img src={zippyLogo} alt="Zippy" className="w-8 h-8 rounded-lg object-cover" />
        <h1 className="font-bold text-taxi-base">Zippy</h1>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={toggleOnline} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${isOnline ? 'bg-success/20 taxi-text-green' : 'bg-muted text-muted-foreground'}`}>
            <Power className="w-3.5 h-3.5" /> {isOnline ? 'ONLAYN' : 'OFLAYN'}
          </button>
          <button onClick={() => setShowProfile(!showProfile)} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </header>

      {showProfile && (
        <div className="border-b border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center"><Car className="w-6 h-6 text-primary-foreground" /></div>
            <div>
              <h3 className="font-bold text-taxi-base">{driver.full_name}</h3>
              <p className="text-sm text-muted-foreground">{driver.phone}</p>
            </div>
            <div className="ml-auto flex items-center gap-1"><Star className="w-4 h-4 text-primary" /><span className="font-medium">{Number(driver.rating).toFixed(1)}</span></div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between bg-muted/50 p-2 rounded"><span className="text-muted-foreground">Mashina</span><span className="font-medium">{driver.car_model} {driver.car_color}</span></div>
            <div className="flex justify-between bg-muted/50 p-2 rounded"><span className="text-muted-foreground">Raqam</span><span className="font-medium">{driver.car_plate}</span></div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" /> Chiqish</Button>
        </div>
      )}

      <main className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Card><CardContent className="p-3 text-center"><ClipboardList className="w-5 h-5 mx-auto text-primary mb-1" /><p className="text-taxi-lg font-bold">{driver.completed_today}</p><p className="text-xs text-muted-foreground">Safarlar</p></CardContent></Card>
          <Card><CardContent className="p-3 text-center"><Star className="w-5 h-5 mx-auto text-primary mb-1" /><p className="text-taxi-lg font-bold">{Number(driver.rating).toFixed(1)}</p><p className="text-xs text-muted-foreground">Reyting</p></CardContent></Card>
          <Card><CardContent className="p-3 text-center"><Wallet className="w-5 h-5 mx-auto text-primary mb-1" /><p className="text-taxi-lg font-bold">{(Number(driver.balance) / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Balans</p></CardContent></Card>
        </div>

        {activeOrder && (
          <Card className="border-2 border-primary">
            <CardContent className="p-4 space-y-3">
              <div className={`text-center py-2 rounded-lg font-bold text-taxi-base ${
                tripStatus === 'ACCEPTED' ? 'bg-primary/20 text-primary' :
                tripStatus === 'WAITING' ? 'bg-warning/20 text-warning' :
                tripStatus === 'IN_TRIP' ? 'bg-success/20 taxi-text-green' : 'bg-muted text-muted-foreground'
              }`}>
                {tripStatus === 'ACCEPTED' && "🚗 Yo'lovchiga yetib boring"}
                {tripStatus === 'WAITING' && `⏳ Kutmoqdasiz • ${formatWaitTime(waitingSeconds)}`}
                {tripStatus === 'IN_TRIP' && `🛣 Safar • ${tripKm} km`}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted/50 p-2 rounded"><p className="text-xs text-muted-foreground">KM</p><p className="text-taxi-lg font-bold">{tripKm}</p></div>
                <div className="bg-muted/50 p-2 rounded"><p className="text-xs text-muted-foreground">Kutish</p><p className="text-taxi-lg font-bold">{formatWaitTime(waitingSeconds)}</p><p className="text-[10px] text-muted-foreground">{waitingCost.toLocaleString()}</p></div>
                <div className="bg-muted/50 p-2 rounded"><p className="text-xs text-muted-foreground">Jami</p><p className="text-taxi-lg font-bold">{totalPrice.toLocaleString()}</p></div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-success" /><span className="font-medium">{activeOrder.pickup_zone}</span></div>
                {activeOrder.drop_zone && <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-destructive" /><span>{activeOrder.drop_zone}</span></div>}
              </div>

              <div className="flex gap-2">
                <a href={`tel:${activeOrder.passenger_phone}`} className="flex-1"><Button variant="outline" className="w-full" size="lg"><Phone className="w-5 h-5 mr-1" /> Qo'ng'iroq</Button></a>
                <Button variant="outline" size="lg"><Navigation className="w-5 h-5" /></Button>
              </div>

              {tripStatus === 'ACCEPTED' && <Button onClick={handleArrive} className="w-full taxi-gradient text-primary-foreground h-14 text-taxi-lg" size="lg"><MapPin className="w-6 h-6 mr-2" /> Yetib keldim</Button>}
              {tripStatus === 'WAITING' && (
                <div className="space-y-2">
                  <div className="text-center p-2 bg-warning/10 rounded-lg"><p className="text-sm text-warning font-medium">Kutish: {settings.waiting_price_per_minute} so'm/min</p><p className="text-taxi-lg font-bold text-warning">{waitingCost.toLocaleString()} so'm</p></div>
                  <Button onClick={handlePassengerIn} className="w-full bg-success text-success-foreground h-14 text-taxi-lg" size="lg"><Navigation className="w-6 h-6 mr-2" /> Safarni boshlash</Button>
                </div>
              )}
              {tripStatus === 'IN_TRIP' && <Button onClick={handleComplete} className="w-full bg-accent text-accent-foreground h-14 text-taxi-lg" size="lg"><CheckCircle className="w-6 h-6 mr-2" /> Yakunlash</Button>}
            </CardContent>
          </Card>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-taxi-lg font-bold flex items-center gap-2">
              <ClipboardList className="w-5 h-5" /> Buyurtmalar
              {availableOrders.length > 0 && <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">{availableOrders.length}</span>}
            </h2>
          </div>

          {availableOrders.length === 0 && !activeOrder && (
            <Card><CardContent className="p-6 text-center text-muted-foreground"><Clock className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>Yangi buyurtma kutilmoqda...</p></CardContent></Card>
          )}

          <div className="space-y-2">
            {availableOrders.map(order => {
              const isTargeted = order.dispatch_state === 'RED_TARGETED';
              const isMyTarget = isTargeted && order.targeted_driver_id === user?.id;
              const isOtherTarget = isTargeted && !isMyTarget;
              const isGreenPublic = order.dispatch_state === 'GREEN_PUBLIC';
              const canAccept = !activeOrder && (isMyTarget || isGreenPublic);

              return (
                <Card key={order.id} className={`border-2 transition-all ${
                  isMyTarget ? 'border-primary bg-primary/5 animate-pulse' :
                  isOtherTarget ? 'taxi-card-red opacity-70' : 'taxi-card-green'
                }`}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isMyTarget && <><Volume2 className="w-4 h-4 text-primary animate-bounce" /><span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/20 text-primary">🔔 SIZGA TAYINLANDI</span></>}
                        {isOtherTarget && <><Lock className="w-3.5 h-3.5 text-destructive" /><span className="text-xs font-bold px-2 py-0.5 rounded bg-destructive/20 taxi-text-red">BOSHQA HAYDOVCHIGA</span></>}
                        {isGreenPublic && <><Users className="w-3.5 h-3.5 taxi-text-green" /><span className="text-xs font-bold px-2 py-0.5 rounded bg-success/20 taxi-text-green">BARCHAGA OCHIQ</span></>}
                      </div>
                      <p className="text-taxi-lg font-bold">{(order.total_price || 0).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <span className="text-sm font-medium">{order.pickup_zone}</span>
                      {order.drop_zone && <><span className="text-muted-foreground">→</span><span className="text-sm">{order.drop_zone}</span></>}
                      <span className="text-xs text-muted-foreground ml-auto">{order.estimated_km} km</span>
                    </div>
                    {isMyTarget && (
                      <div className="flex gap-2 mt-2">
                        <Button onClick={() => acceptOrder(order.id)} disabled={!!activeOrder} className="flex-1 taxi-gradient text-primary-foreground h-12 text-taxi-base" size="lg"><Check className="w-5 h-5 mr-1" /> Qabul qilish</Button>
                        <Button onClick={() => declineOrder(order.id)} variant="outline" size="lg" className="h-12"><X className="w-5 h-5" /></Button>
                      </div>
                    )}
                    {isOtherTarget && (
                      <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-destructive/10">
                        <Lock className="w-4 h-4 taxi-text-red" /><p className="text-xs taxi-text-red font-medium">Bu buyurtma boshqa haydovchiga tayinlangan.</p>
                      </div>
                    )}
                    {isGreenPublic && (
                      <div className="flex gap-2 mt-2">
                        <Button onClick={() => acceptOrder(order.id)} disabled={!!activeOrder} className="flex-1 bg-success text-success-foreground" size="sm"><Check className="w-4 h-4 mr-1" /> Qabul</Button>
                        <Button onClick={() => declineOrder(order.id)} variant="outline" size="sm"><X className="w-4 h-4" /></Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <button onClick={() => setShowHistory(!showHistory)} className="w-full flex items-center justify-between py-2">
            <h2 className="text-taxi-lg font-bold flex items-center gap-2"><Clock className="w-5 h-5" /> Tarix</h2>
            {showHistory ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </button>
          {showHistory && (
            <div className="space-y-2">
              {historyItems.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">Tarix bo'sh</p>
              ) : historyItems.map((item, i) => (
                <Card key={i} className={`border-l-4 ${item.type === 'income' ? 'border-l-success' : 'border-l-destructive'}`}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${item.type === 'income' ? 'bg-success/20' : 'bg-destructive/20'}`}>
                        {item.type === 'income' ? <ArrowDown className="w-3.5 h-3.5 taxi-text-green" /> : <ArrowUp className="w-3.5 h-3.5 taxi-text-red" />}
                      </div>
                      <div><p className="font-medium text-sm">{item.label}</p><p className="text-[11px] text-muted-foreground">{new Date(item.time).toLocaleTimeString('uz')}</p></div>
                    </div>
                    <span className={`font-bold ${item.type === 'income' ? 'taxi-text-green' : 'taxi-text-red'}`}>
                      {item.type === 'income' ? '+' : ''}{item.amount.toLocaleString()}
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
