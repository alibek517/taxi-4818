import PassengerLayout from '@/components/passenger/PassengerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Phone, LogOut } from 'lucide-react';

export default function PassengerProfile() {
  return (
    <PassengerLayout>
      <div className="p-4 space-y-4">
        <div className="text-center py-6">
          <div className="w-20 h-20 rounded-full bg-secondary mx-auto flex items-center justify-center mb-3">
            <User className="w-10 h-10 text-secondary-foreground" />
          </div>
          <h2 className="text-taxi-xl font-bold">Nilufar Karimova</h2>
          <p className="text-muted-foreground">+998 90 111 11 11</p>
        </div>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jami safarlar</span>
              <span className="font-medium">15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bonus balans</span>
              <span className="font-bold text-primary">1,130 so'm</span>
            </div>
          </CardContent>
        </Card>

        <Button variant="destructive" className="w-full" size="lg">
          <LogOut className="w-4 h-4 mr-2" /> Chiqish
        </Button>
      </div>
    </PassengerLayout>
  );
}
