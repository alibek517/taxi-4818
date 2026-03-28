import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Car, Phone, User, Clock, Lock, AtSign } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    username: '',
    password: '',
    car_model: '',
    car_plate: '',
    car_color: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.full_name || !form.phone || !form.username || !form.password) {
      toast.error("Ism, telefon, username va parol majburiy");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Parol kamida 6 ta belgi bo'lishi kerak");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      toast.error("Username faqat harf, raqam va _ bo'lishi mumkin");
      return;
    }
    setLoading(true);

    // Use internal email based on username
    const internalEmail = `${form.username.toLowerCase()}@gurlan.taxi`;

    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: internalEmail,
      password: form.password,
    });

    if (authError || !authData.user) {
      if (authError?.message?.includes('already registered')) {
        toast.error("Bu username band. Boshqa username tanlang.");
      } else {
        toast.error(authError?.message || "Ro'yxatdan o'tishda xatolik");
      }
      setLoading(false);
      return;
    }

    const userId = authData.user.id;

    // 2. Create profile with username
    await supabase.from('profiles').insert({
      id: userId,
      full_name: form.full_name,
      phone: form.phone,
      username: form.username.toLowerCase(),
    });

    // 3. Assign driver role
    await supabase.from('user_roles').insert({
      user_id: userId,
      role: 'driver',
    });

    // 4. Create driver record with pending status
    await supabase.from('drivers').insert({
      id: userId,
      full_name: form.full_name,
      phone: form.phone,
      car_model: form.car_model || 'Noma\'lum',
      car_plate: form.car_plate || '',
      car_color: form.car_color || '',
    });

    // Sign out after registration (driver needs approval)
    await supabase.auth.signOut();

    setSubmitted(true);
    setLoading(false);
    toast.success("Ariza yuborildi! Admin tasdiqlashini kuting.");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm space-y-4">
          <div className="w-20 h-20 rounded-full bg-warning/20 mx-auto flex items-center justify-center">
            <Clock className="w-10 h-10 text-warning" />
          </div>
          <h2 className="text-taxi-2xl font-bold">Ariza qabul qilindi!</h2>
          <p className="text-muted-foreground text-taxi-base">
            Admin arizangizni ko'rib chiqadi. Tasdiqlangandan so'ng tizimga kirishingiz mumkin bo'ladi.
          </p>
          <Card>
            <CardContent className="p-4 space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ism</span>
                <span className="font-medium">{form.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Username</span>
                <span className="font-medium">{form.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Telefon</span>
                <span className="font-medium">{form.phone}</span>
              </div>
              {form.car_model && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mashina</span>
                  <span className="font-medium">{form.car_model} {form.car_color}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Holat</span>
                <span className="text-warning font-bold">Kutilmoqda ⏳</span>
              </div>
            </CardContent>
          </Card>
          <Button onClick={() => navigate('/login')} variant="outline" className="w-full" size="lg">
            Kirish sahifasiga qaytish
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl taxi-gradient mx-auto flex items-center justify-center mb-3 shadow-lg">
            <Car className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-taxi-2xl font-bold">Ro'yxatdan o'tish</h1>
          <p className="text-muted-foreground text-sm">Haydovchi sifatida ro'yxatdan o'ting</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-taxi-base">To'liq ism *</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Abdullayev Jasur" value={form.full_name} onChange={e => update('full_name', e.target.value)} className="pl-10 h-12 text-taxi-base" />
              </div>
            </div>
            <div>
              <Label className="text-taxi-base">Telefon *</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="+998 90 123 45 67" value={form.phone} onChange={e => update('phone', e.target.value)} className="pl-10 h-12 text-taxi-base" type="tel" />
              </div>
            </div>
            <div>
              <Label className="text-taxi-base">Username *</Label>
              <div className="relative mt-1">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="jasur_driver" value={form.username} onChange={e => update('username', e.target.value)} className="pl-10 h-12 text-taxi-base" />
              </div>
            </div>
            <div>
              <Label className="text-taxi-base">Parol *</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Kamida 6 ta belgi" value={form.password} onChange={e => update('password', e.target.value)} className="pl-10 h-12 text-taxi-base" type="password" />
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground mb-3">Mashina ma'lumotlari (ixtiyoriy)</p>
              <div className="space-y-3">
                <div>
                  <Label>Mashina modeli</Label>
                  <Input placeholder="Cobalt" value={form.car_model} onChange={e => update('car_model', e.target.value)} className="h-11" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Davlat raqami</Label>
                    <Input placeholder="01 A 123 BA" value={form.car_plate} onChange={e => update('car_plate', e.target.value)} className="h-11" />
                  </div>
                  <div>
                    <Label>Rang</Label>
                    <Input placeholder="Oq" value={form.car_color} onChange={e => update('car_color', e.target.value)} className="h-11" />
                  </div>
                </div>
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={loading} className="w-full h-12 taxi-gradient text-primary-foreground text-taxi-base" size="lg">
              {loading ? 'Yuborilmoqda...' : 'Ariza yuborish'}
            </Button>
          </CardContent>
        </Card>

        <div className="text-center">
          <button onClick={() => navigate('/login')} className="text-primary font-medium">
            ← Kirish sahifasiga qaytish
          </button>
        </div>
      </motion.div>
    </div>
  );
}
