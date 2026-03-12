import PassengerLayout from '@/components/passenger/PassengerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MOCK_DRIVERS } from '@/lib/types';
import { MapPin, Phone, Car, Star, Clock } from 'lucide-react';

const driver = MOCK_DRIVERS[0];

export default function PassengerTrack() {
  return (
    <PassengerLayout>
      <div className="p-4 space-y-4">
        {/* Status */}
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full animate-pulse-yellow">
            <Car className="w-5 h-5" />
            <span className="font-bold text-taxi-base">Haydovchi yo'lda</span>
          </div>
        </div>

        {/* Map placeholder */}
        <Card className="overflow-hidden">
          <div className="h-56 bg-muted flex items-center justify-center relative">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-10 h-10 mx-auto mb-2 text-primary animate-bounce" />
              <p className="text-sm">Haydovchi joylashuvi xaritada</p>
              <p className="text-xs">Real vaqtda kuzatish</p>
            </div>
            {/* Simulated moving dot */}
            <div className="absolute top-1/3 left-1/2 w-4 h-4 rounded-full bg-primary shadow-lg" />
          </div>
        </Card>

        {/* Driver info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                <Car className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-taxi-base">{driver.full_name}</h3>
                <p className="text-sm text-muted-foreground">{driver.car_model} • {driver.car_color}</p>
                <p className="text-sm font-medium">{driver.car_plate}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm">{driver.rating}</span>
                </div>
              </div>
              <a href={`tel:${driver.phone}`}>
                <Button variant="outline" size="lg" className="rounded-full w-14 h-14">
                  <Phone className="w-6 h-6" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Trip details */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-success" />
              <span className="font-medium">Gurlan Markaz</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
              <span>Bozor</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-muted-foreground">Narx</span>
              <span className="font-bold text-taxi-lg">13,000 so'm</span>
            </div>
          </CardContent>
        </Card>

        <Button variant="destructive" className="w-full" size="lg">
          Buyurtmani bekor qilish
        </Button>
      </div>
    </PassengerLayout>
  );
}
