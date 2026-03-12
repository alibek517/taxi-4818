import DriverLayout from '@/components/driver/DriverLayout';
import { Card, CardContent } from '@/components/ui/card';
import { MOCK_ORDERS } from '@/lib/types';
import { ArrowDown, ArrowUp } from 'lucide-react';

const historyItems = [
  ...MOCK_ORDERS.filter(o => o.status === 'COMPLETED').map(o => ({
    type: 'income' as const,
    label: `${o.pickup_zone} → ${o.drop_zone || '—'}`,
    amount: o.total_price,
    time: o.completed_at || o.created_at,
  })),
  { type: 'expense' as const, label: 'Xizmat to\'lovi', amount: -500, time: new Date().toISOString() },
  { type: 'income' as const, label: 'Bonus', amount: 500, time: new Date().toISOString() },
];

export default function DriverHistory() {
  return (
    <DriverLayout>
      <div className="p-4 space-y-3">
        <h2 className="text-taxi-xl font-bold">Tarix</h2>

        {historyItems.map((item, i) => (
          <Card key={i} className={`border-l-4 ${item.type === 'income' ? 'border-l-success' : 'border-l-destructive'}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  item.type === 'income' ? 'bg-success/20' : 'bg-destructive/20'
                }`}>
                  {item.type === 'income' ? (
                    <ArrowDown className="w-4 h-4 taxi-text-green" />
                  ) : (
                    <ArrowUp className="w-4 h-4 taxi-text-red" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.time).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <span className={`font-bold text-taxi-base ${item.type === 'income' ? 'taxi-text-green' : 'taxi-text-red'}`}>
                {item.type === 'income' ? '+' : ''}{Math.abs(item.amount).toLocaleString()}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </DriverLayout>
  );
}
