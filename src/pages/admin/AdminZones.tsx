import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/admin/AdminLayout';
import { GURLAN_ZONES } from '@/lib/types';
import type { Zone } from '@/lib/types';
import { Plus, MapPin, Trash2 } from 'lucide-react';

export default function AdminZones() {
  const [zones, setZones] = useState<Zone[]>(GURLAN_ZONES);
  const [newZone, setNewZone] = useState('');

  const addZone = () => {
    if (!newZone.trim()) return;
    setZones([...zones, { id: String(Date.now()), name: newZone.trim(), name_uz: newZone.trim(), is_active: true }]);
    setNewZone('');
  };

  const toggleZone = (id: string) => {
    setZones(zones.map(z => z.id === id ? { ...z, is_active: !z.is_active } : z));
  };

  const removeZone = (id: string) => {
    setZones(zones.filter(z => z.id !== id));
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h2 className="text-taxi-2xl font-bold">Zonalar</h2>

        <Card>
          <CardHeader>
            <CardTitle>Yangi zona qo'shish</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input 
                placeholder="Zona nomi..." 
                value={newZone} 
                onChange={e => setNewZone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addZone()}
              />
              <Button onClick={addZone} className="shrink-0">
                <Plus className="w-4 h-4 mr-1" /> Qo'shish
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-2">
          {zones.map(zone => (
            <Card key={zone.id} className={!zone.is_active ? 'opacity-50' : ''}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="font-medium text-taxi-base">{zone.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleZone(zone.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      zone.is_active ? 'bg-success/20 taxi-text-green' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {zone.is_active ? 'Faol' : 'Nofaol'}
                  </button>
                  <button onClick={() => removeZone(zone.id)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
