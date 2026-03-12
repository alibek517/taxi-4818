import DriverLayout from '@/components/driver/DriverLayout';
import { Card, CardContent } from '@/components/ui/card';
import { MOCK_DRIVERS } from '@/lib/types';
import { Car, Wallet, ClipboardList, MapPin, Phone as PhoneIcon, Navigation, Info, LogOut, Sun, SortAsc } from 'lucide-react';

const driver = MOCK_DRIVERS[0];

const menuItems = [
  { icon: Sun, label: 'Ekran rejimi', value: '' },
  { icon: SortAsc, label: 'Saralash', value: '' },
  { icon: PhoneIcon, label: 'Call center', value: '+998 62 345 67 89' },
  { icon: MapPin, label: 'Geolokatsiya', value: 'Faol' },
  { icon: Navigation, label: 'Navigator', value: '' },
  { icon: Wallet, label: 'Qarz', value: '0 so\'m' },
  { icon: Info, label: 'Dastur haqida', value: 'v1.0' },
  { icon: LogOut, label: 'Chiqish', value: '' },
];

export default function DriverHome() {
  return (
    <DriverLayout>
      <div className="p-4 space-y-4">
        {/* Driver info card */}
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

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <ClipboardList className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-taxi-lg font-bold">{driver.completed_today}</p>
              <p className="text-xs text-muted-foreground">Navbat</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Car className="w-5 h-5 mx-auto text-success mb-1" />
              <p className="text-taxi-lg font-bold">{driver.completed_today}</p>
              <p className="text-xs text-muted-foreground">Qabul</p>
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

        {/* Menu grid */}
        <div className="grid grid-cols-2 gap-3">
          {menuItems.map(item => (
            <Card key={item.label} className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  {item.value && <p className="text-xs text-muted-foreground truncate">{item.value}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DriverLayout>
  );
}
