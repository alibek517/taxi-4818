import PassengerLayout from '@/components/passenger/PassengerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Gift, ArrowDown, ArrowUp } from 'lucide-react';

const bonusHistory = [
  { type: 'earn', label: 'Safar bonusi', amount: 600, date: '2026-03-12' },
  { type: 'earn', label: 'Safar bonusi', amount: 390, date: '2026-03-11' },
  { type: 'spend', label: "To'lov uchun ishlatildi", amount: -400, date: '2026-03-10' },
  { type: 'earn', label: 'Safar bonusi', amount: 540, date: '2026-03-10' },
];

export default function PassengerBonus() {
  const balance = bonusHistory.reduce((sum, b) => sum + b.amount, 0);

  return (
    <PassengerLayout>
      <div className="p-4 space-y-4">
        <Card className="taxi-gradient">
          <CardContent className="p-6 text-center text-primary-foreground">
            <Gift className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm opacity-80">Bonus hisobingiz</p>
            <p className="text-taxi-3xl font-bold">{balance.toLocaleString()} so'm</p>
            <p className="text-xs opacity-70 mt-1">Har safar 3% bonus yig'iladi</p>
          </CardContent>
        </Card>

        <h3 className="font-bold text-taxi-base">Bonus tarixi</h3>
        {bonusHistory.map((b, i) => (
          <Card key={i}>
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  b.amount > 0 ? 'bg-success/20' : 'bg-destructive/20'
                }`}>
                  {b.amount > 0 ? <ArrowDown className="w-4 h-4 taxi-text-green" /> : <ArrowUp className="w-4 h-4 taxi-text-red" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{b.label}</p>
                  <p className="text-xs text-muted-foreground">{b.date}</p>
                </div>
              </div>
              <span className={`font-bold ${b.amount > 0 ? 'taxi-text-green' : 'taxi-text-red'}`}>
                {b.amount > 0 ? '+' : ''}{b.amount.toLocaleString()}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </PassengerLayout>
  );
}
