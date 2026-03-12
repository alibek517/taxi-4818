import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Headphones, Users, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const roles = [
  { path: '/admin', icon: Shield, label: 'Admin', desc: 'Boshqaruv paneli', color: 'bg-accent text-accent-foreground' },
  { path: '/operator', icon: Headphones, label: 'Operator', desc: "Call-center operatori", color: 'taxi-gradient text-primary-foreground' },
  { path: '/driver', icon: Car, label: 'Haydovchi', desc: "Haydovchi ilovasi", color: 'bg-success text-success-foreground' },
  { path: '/passenger', icon: Users, label: "Yo'lovchi", desc: "Yo'lovchi ilovasi", color: 'bg-primary text-primary-foreground' },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-2xl taxi-gradient mx-auto flex items-center justify-center mb-4 shadow-lg">
            <Car className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-taxi-3xl font-bold">Gurlan Taxi</h1>
          <p className="text-muted-foreground mt-1">Gurlan shahri taksi xizmati</p>
        </motion.div>

        <div className="grid gap-3">
          {roles.map((role, i) => (
            <motion.div
              key={role.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={role.path}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl ${role.color} flex items-center justify-center`}>
                      <role.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-taxi-lg font-bold">{role.label}</h3>
                      <p className="text-sm text-muted-foreground">{role.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">v1.0 • Gurlan, O'zbekiston</p>
      </div>
    </div>
  );
}
