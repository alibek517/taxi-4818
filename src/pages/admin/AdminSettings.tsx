import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('system_settings').select('*').limit(1).maybeSingle();
      if (data) setSettings(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const update = (key: string, value: number | string) => {
    setSettings((prev: any) => ({ ...prev, [key]: typeof prev[key] === 'number' ? Number(value) : value }));
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase.from('system_settings').update({
      start_price: settings.start_price,
      km_price: settings.km_price,
      waiting_price_per_minute: settings.waiting_price_per_minute,
      passenger_bonus_percent: settings.passenger_bonus_percent,
      driver_bonus_per_order: settings.driver_bonus_per_order,
      driver_bonus_mode: settings.driver_bonus_mode,
      green_after_seconds: settings.green_after_seconds,
      offer_expires_seconds: settings.offer_expires_seconds,
      max_targeted_attempts: settings.max_targeted_attempts,
      decline_cooldown_seconds: settings.decline_cooldown_seconds,
      w_distance: settings.w_distance,
      w_queue: settings.w_queue,
      w_recent: settings.w_recent,
      w_cancel: settings.w_cancel,
      w_idle: settings.w_idle,
    }).eq('id', settings.id);
    
    if (error) toast.error("Saqlashda xatolik");
    else toast.success("Sozlamalar saqlandi!");
    setSaving(false);
  };

  if (loading || !settings) {
    return <AdminLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-4 max-w-2xl">
        <h2 className="text-taxi-2xl font-bold">Sozlamalar</h2>

        <Card>
          <CardHeader><CardTitle>Narxlar</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Boshlang'ich narx (so'm)</Label>
                <Input type="number" value={settings.start_price} onChange={e => update('start_price', e.target.value)} />
              </div>
              <div>
                <Label>Km narxi (so'm)</Label>
                <Input type="number" value={settings.km_price} onChange={e => update('km_price', e.target.value)} />
              </div>
              <div>
                <Label>Kutish narxi (so'm/min)</Label>
                <Input type="number" value={settings.waiting_price_per_minute} onChange={e => update('waiting_price_per_minute', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Bonus tizimi</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Yo'lovchi bonusi (%)</Label>
                <Input type="number" value={settings.passenger_bonus_percent} onChange={e => update('passenger_bonus_percent', e.target.value)} />
              </div>
              <div>
                <Label>Haydovchi bonusi (so'm)</Label>
                <Input type="number" value={settings.driver_bonus_per_order} onChange={e => update('driver_bonus_per_order', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Haydovchi bonus rejimi</Label>
              <div className="flex gap-2 mt-1">
                {(['GIVE', 'TAKE'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => update('driver_bonus_mode', mode)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      settings.driver_bonus_mode === mode ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >{mode === 'GIVE' ? 'Berish' : 'Yechish'}</button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Dispatch sozlamalari</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>RED → GREEN (sekund)</Label><Input type="number" value={settings.green_after_seconds} onChange={e => update('green_after_seconds', e.target.value)} /></div>
              <div><Label>Taklif muddati (sekund)</Label><Input type="number" value={settings.offer_expires_seconds} onChange={e => update('offer_expires_seconds', e.target.value)} /></div>
              <div><Label>Maks. RED urinishlar</Label><Input type="number" value={settings.max_targeted_attempts} onChange={e => update('max_targeted_attempts', e.target.value)} /></div>
              <div><Label>Rad etish kutish (sekund)</Label><Input type="number" value={settings.decline_cooldown_seconds} onChange={e => update('decline_cooldown_seconds', e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Dispatch vaznlari</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { key: 'w_distance', label: 'Masofa' },
                { key: 'w_queue', label: 'Navbat' },
                { key: 'w_recent', label: 'Yaqinda qabul' },
                { key: 'w_cancel', label: 'Bekor qilish' },
                { key: 'w_idle', label: "Bo'sh vaqt" },
              ].map(w => (
                <div key={w.key}>
                  <Label>{w.label}</Label>
                  <Input type="number" step="0.1" value={settings[w.key]} onChange={e => update(w.key, e.target.value)} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button onClick={save} disabled={saving} className="w-full" size="lg">
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </Button>
      </div>
    </AdminLayout>
  );
}
