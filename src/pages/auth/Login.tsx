import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Car, User, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error("Username va parolni kiriting");
      return;
    }
    setLoading(true);

    // Lookup email by username using security definer function
    const { data: emailData, error: lookupError } = await supabase
      .rpc('get_email_by_username', { _username: username });

    if (lookupError || !emailData) {
      toast.error("Foydalanuvchi topilmadi");
      setLoading(false);
      return;
    }

    const email = emailData as string;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error("Parol noto'g'ri");
      setLoading(false);
      return;
    }

    // Fetch role and redirect
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id)
      .maybeSingle();

    const role = roleData?.role;
    if (role === 'admin') navigate('/admin');
    else if (role === 'operator') navigate('/operator');
    else if (role === 'driver') {
      const { data: driverData } = await supabase
        .from('drivers')
        .select('auth_status')
        .eq('id', data.user.id)
        .maybeSingle();
      if (driverData?.auth_status === 'approved') {
        navigate('/driver');
      } else {
        toast.error("Arizangiz hali tasdiqlanmagan. Iltimos kuting.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
    } else if (role === 'passenger') navigate('/passenger');
    else navigate('/passenger');

    toast.success("Muvaffaqiyatli kirdingiz!");
    setLoading(false);
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
            <div>
              <Label className="text-taxi-base">Username</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="admin" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)}
                  className="pl-10 h-12 text-taxi-base"
                />
              </div>
            </div>
            <div>
              <Label className="text-taxi-base">Parol</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10 h-12 text-taxi-base"
                  type="password"
                />
              </div>
            </div>
            <Button onClick={handleLogin} disabled={loading} className="w-full h-12 taxi-gradient text-primary-foreground text-taxi-base" size="lg">
              {loading ? 'Kirish...' : 'Kirish'}
            </Button>
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
