import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ClipboardList, Clock, Home, Menu as MenuIcon, User } from 'lucide-react';

const tabs = [
  { path: '/driver', icon: Home, label: 'Asosiy' },
  { path: '/driver/orders', icon: ClipboardList, label: 'Buyurtmalar' },
  { path: '/driver/history', icon: Clock, label: 'Tarix' },
  { path: '/driver/profile', icon: User, label: 'Profil' },
];

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg taxi-gradient flex items-center justify-center">
          <MenuIcon className="w-4 h-4 text-primary-foreground" />
        </div>
        <h1 className="font-bold text-taxi-base">Gurlan Taxi</h1>
        <span className="text-xs bg-success/20 taxi-text-green px-2 py-0.5 rounded-full font-medium">ONLAYN</span>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto pb-20">
        {children}
      </main>

      {/* Bottom tabs */}
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
