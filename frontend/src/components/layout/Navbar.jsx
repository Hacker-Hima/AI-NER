import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Navigation, 
  Truck, 
  MapPin, 
  AlertTriangle, 
  BarChart3, 
  ShieldCheck, 
  Radio, 
  UserCheck 
} from 'lucide-react';

export const Navbar = () => {
  const { user, switchDemoRole } = useAuth();

  const navItems = [
    { to: '/', label: 'Command Center', icon: Navigation },
    { to: '/shipments', label: 'Supply Shipments', icon: Truck },
    { to: '/routes', label: 'Route Intelligence', icon: MapPin },
    { to: '/incidents', label: 'Disruption Board', icon: AlertTriangle },
    { to: '/analytics', label: 'Regional Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  NER
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/30">
                  SIH 2026
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                Logistics & Accessibility Intelligence
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Role Persona Switcher (For SIH Demonstration) */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-500 px-2 font-medium">Role:</span>
              <button
                onClick={() => switchDemoRole('logistics_coordinator')}
                className={`text-xs px-2.5 py-1 rounded transition-colors ${
                  user?.role === 'logistics_coordinator'
                    ? 'bg-emerald-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Logistics Coordinator Persona"
              >
                Coordinator
              </button>
              <button
                onClick={() => switchDemoRole('field_driver')}
                className={`text-xs px-2.5 py-1 rounded transition-colors ${
                  user?.role === 'field_driver'
                    ? 'bg-blue-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Field Driver Persona"
              >
                Driver
              </button>
              <button
                onClick={() => switchDemoRole('admin')}
                className={`text-xs px-2.5 py-1 rounded transition-colors ${
                  user?.role === 'admin'
                    ? 'bg-purple-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Admin Persona"
              >
                Admin
              </button>
              <button
                onClick={() => switchDemoRole('regional_observer')}
                className={`text-xs px-2.5 py-1 rounded transition-colors ${
                  user?.role === 'regional_observer'
                    ? 'bg-amber-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Public Observer Persona"
              >
                Observer
              </button>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-emerald-400">
                {user?.full_name ? user.full_name[0] : 'U'}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-medium text-slate-200">{user?.full_name || 'Coordinator'}</div>
                <div className="text-[10px] text-slate-400 capitalize">{user?.region || 'NER HQ'}</div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
