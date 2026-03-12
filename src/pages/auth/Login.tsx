import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Car, Phone, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  const sendOtp = () => {
    if (phone.length < 9) {
      toast.error("Telefon raqamni to'liq kiriting");
      return;
    }
    setStep('otp');
    toast.success("SMS kod yuborildi (demo: 1234)");
  };

  const verifyOtp = () => {
    if (otp === '1234') {
      // Demo: check role by phone
      if (phone.includes('111')) navigate('/admin');
      else if (phone.includes('222')) navigate('/operator');
      else if (phone.includes('333')) navigate('/driver');
      else navigate('/passenger');
      toast.success("Muvaffaqiyatli kirdingiz!");
    } else {
      toast.error("Noto'g'ri kod");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl taxi-gradient mx-auto flex items-center justify-center mb-4 shadow-lg">
            <Car className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-taxi-3xl font-bold">Gurlan Taxi</h1>
          <p className="text-muted-foreground mt-1">Tizimga kirish</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            {step === 'phone' ? (
              <>
                <div>
                  <Label className="text-taxi-base">Telefon raqam</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                      placeholder="+998 90 123 45 67" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)}
                      className="pl-10 h-12 text-taxi-base"
                      type="tel"
                    />
                  </div>
                </div>
                <Button onClick={sendOtp} className="w-full h-12 taxi-gradient text-primary-foreground text-taxi-base" size="lg">
                  SMS kod olish
                </Button>
              </>
            ) : (
              <>
                <div>
                  <Label className="text-taxi-base">SMS kod</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                      placeholder="1234" 
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      className="pl-10 h-12 text-taxi-base text-center tracking-[0.5em]"
                      maxLength={4}
                      type="number"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Demo kod: 1234</p>
                </div>
                <Button onClick={verifyOtp} className="w-full h-12 taxi-gradient text-primary-foreground text-taxi-base" size="lg">
                  Kirish
                </Button>
                <button onClick={() => setStep('phone')} className="text-sm text-primary w-full text-center">
                  Raqamni o'zgartirish
                </button>
              </>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <button onClick={() => navigate('/register')} className="text-primary font-medium text-taxi-base">
            Ro'yxatdan o'tish →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
