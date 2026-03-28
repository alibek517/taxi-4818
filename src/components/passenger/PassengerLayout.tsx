import { Link, useLocation } from 'react-router-dom';
import { Home, ClipboardList, Gift, User } from 'lucide-react';
import zippyLogo from '@/assets/zippy-logo.png';

const tabs = [
  { path: '/passenger', icon: Home, label: 'Asosiy' },
  { path: '/passenger/history', icon: ClipboardList, label: 'Tarix' },
  { path: '/passenger/bonus', icon: Gift, label: 'Bonus' },
  { path: '/passenger/profile', icon: User, label: 'Profil' },
];

export default function PassengerLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3 shrink-0">
        <img src={zippyLogo} alt="Zippy" className="w-8 h-8 rounded-lg object-cover" />
        <h1 className="font-bold text-taxi-base">Zippy</h1>
      </header>
      <main className="flex-1 overflow-auto pb-20">
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex z-50">
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
