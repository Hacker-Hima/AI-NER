import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Truck,
  AlertTriangle,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Navigation,
  Bell,
  Search,
  CheckCircle2,
  AlertOctagon,
  FileText,
  Siren,
  Menu,
  X,
  Compass,
  Eye,
  Check
} from 'lucide-react';

const NAV_ITEMS_BY_ROLE = {
  admin: [
    { to: '/', label: 'Command Center', icon: LayoutDashboard },
    { to: '/shipments', label: 'Supply Shipments', icon: Truck },
    { to: '/fleet', label: 'Fleet Monitoring', icon: Compass },
    { to: '/routes', label: 'Route Intelligence', icon: Navigation },
    { to: '/incidents', label: 'Disruption Board', icon: AlertTriangle },
    { to: '/emergency', label: 'Emergency Operations', icon: Siren, highlight: true },
    { to: '/analytics', label: 'AI Analytics', icon: BarChart3 },
    { to: '/reports', label: 'Reports & Audits', icon: FileText },
  ],
  logistics_coordinator: [
    { to: '/', label: 'Command Center', icon: LayoutDashboard },
    { to: '/shipments', label: 'Supply Shipments', icon: Truck },
    { to: '/fleet', label: 'Fleet Monitoring', icon: Compass },
    { to: '/routes', label: 'Route Intelligence', icon: Navigation },
    { to: '/reports', label: 'Reports & Audits', icon: FileText },
  ],
  field_driver: [
    { to: '/driver', label: 'My Deliveries', icon: Truck },
    { to: '/routes', label: 'Route Guidance', icon: Navigation },
    { to: '/incidents', label: 'Report Hazard', icon: AlertTriangle },
  ],
  regional_observer: [
    { to: '/observer', label: 'District Accessibility', icon: Eye },
    { to: '/incidents', label: 'Disruption Board', icon: AlertTriangle },
    { to: '/analytics', label: 'Regional Analytics', icon: BarChart3 },
  ],
};

const ROLE_META = {
  admin: { label: 'System Admin', color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe', icon: Shield },
  logistics_coordinator: { label: 'Coordinator', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', icon: LayoutDashboard },
  field_driver: { label: 'Field Driver', color: '#047857', bg: '#ecfdf5', border: '#a7f3d0', icon: Truck },
  regional_observer: { label: 'Regional Observer', color: '#b45309', bg: '#fffbeb', border: '#fde68a', icon: Eye },
};

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const role = user?.role || 'admin';
  const roleMeta = ROLE_META[role] || ROLE_META.admin;
  const navItems = NAV_ITEMS_BY_ROLE[role] || NAV_ITEMS_BY_ROLE.admin;

  return (
    <aside style={{
      width: collapsed ? '68px' : '248px',
      minHeight: '100vh',
      background: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0, top: 0, bottom: 0,
      zIndex: 40,
      transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
      overflow: 'hidden',
      boxShadow: '1px 0 3px rgba(0,0,0,0.02)',
    }}>

      {/* Brand Header */}
      <div style={{
        padding: collapsed ? '16px 12px' : '18px 20px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', gap: 12,
        justifyContent: collapsed ? 'center' : 'flex-start',
        minHeight: 66,
      }}>
        <div style={{
          width: 36, height: 36, flexShrink: 0,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
        }}>
          <Truck size={18} color="#ffffff" />
        </div>
        {!collapsed && (
          <div>
            <div style={{
              fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em',
              fontFamily: 'Space Grotesk, sans-serif',
              color: '#0f172a',
            }}>
              NER LogiFlow
            </div>
            <div style={{ fontSize: 10.5, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
              Regional Intelligence
            </div>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/' || item.to === '/driver' || item.to === '/observer'}
              title={collapsed ? item.label : undefined}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: collapsed ? '11px 0' : '10px 14px',
                borderRadius: 9,
                color: isActive ? '#1d4ed8' : item.highlight ? '#dc2626' : '#475569',
                background: isActive ? '#eff6ff' : item.highlight ? '#fef2f2' : 'transparent',
                fontWeight: isActive ? 700 : 500,
                fontSize: 13.5,
                cursor: 'pointer',
                transition: 'all 0.16s',
                textDecoration: 'none',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} color={isActive ? '#2563eb' : item.highlight ? '#dc2626' : '#64748b'} style={{ flexShrink: 0 }} />
                  {!collapsed && (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span>{item.label}</span>
                      {item.highlight && (
                        <span style={{
                          fontSize: '9.5px',
                          background: '#fee2e2',
                          color: '#dc2626',
                          fontWeight: '800',
                          padding: '1px 6px',
                          borderRadius: '99px',
                        }}>
                          EOC
                        </span>
                      )}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom User Profile Card & Sign Out */}
      <div style={{ padding: collapsed ? '12px 8px' : '14px', borderTop: '1px solid #e2e8f0', background: '#fafbfc' }}>
        {!collapsed && (
          <div style={{
            padding: '10px 12px', borderRadius: 10, marginBottom: 10,
            background: roleMeta.bg, border: `1px solid ${roleMeta.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: roleMeta.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#ffffff', flexShrink: 0,
              }}>
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.full_name || 'User'}
                </div>
                <div style={{ fontSize: 11, color: roleMeta.color, fontWeight: 600 }}>
                  {roleMeta.label}
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: '100%', padding: collapsed ? '9px' : '8px 12px',
              borderRadius: 8, background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#64748b', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 8, fontSize: 12, fontWeight: 500,
              transition: 'all 0.16s',
            }}
          >
            {collapsed ? <ChevronRight size={15} /> : <><ChevronLeft size={15} /> <span>Collapse Sidebar</span></>}
          </button>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{
              width: '100%', padding: collapsed ? '9px' : '8px 12px',
              borderRadius: 8, background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 8, fontSize: 12, fontWeight: 600,
              transition: 'all 0.16s',
            }}
          >
            <LogOut size={15} style={{ flexShrink: 0 }} />
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      </div>
    </aside>
  );
};

// TOP BAR Component
export const Topbar = ({ title, subtitle }) => {
  const { user } = useAuth();
  const { emergencyMode, toggleEmergencyMode, notifications, unreadCount, markAllNotificationsRead, markNotificationRead } = useApp();
  const role = user?.role || 'admin';
  const roleMeta = ROLE_META[role] || ROLE_META.admin;

  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notifRef = useRef(null);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Global Emergency Mode Warning Banner */}
      {emergencyMode && (
        <div style={{
          background: 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)',
          color: '#ffffff',
          padding: '8px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12.5px',
          fontWeight: '700',
          letterSpacing: '0.02em',
          position: 'sticky',
          top: 0,
          zIndex: 45,
          boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px' }}>🚨</span>
            <span>EMERGENCY OPERATIONS MODE ACTIVE — PRIORITY LOGISTICS & AIR-LIFT ESCORTS IN EFFECT</span>
          </div>
          <button
            onClick={() => toggleEmergencyMode(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              color: '#ffffff',
              padding: '3px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Exit Emergency Mode
          </button>
        </div>
      )}

      <header className="topbar">
        {/* Left Title */}
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.02em', color: '#0f172a' }}>
            {title}
          </h1>
          {subtitle && <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 1 }}>{subtitle}</p>}
        </div>

        {/* Center / Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Global Search Input */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search convoys, routes, alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px 7px 34px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: '12.5px',
                outline: 'none',
                color: '#0f172a',
              }}
            />
          </div>

          {/* Emergency Operations Quick Trigger for Admin */}
          {role === 'admin' && (
            <button
              onClick={() => toggleEmergencyMode()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: emergencyMode ? '#fef2f2' : '#ffffff',
                border: `1px solid ${emergencyMode ? '#f87171' : '#e2e8f0'}`,
                color: emergencyMode ? '#dc2626' : '#475569',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.16s',
              }}
            >
              <Siren size={14} color={emergencyMode ? '#dc2626' : '#64748b'} />
              <span>{emergencyMode ? 'Emergency Active' : 'Emergency Mode'}</span>
            </button>
          )}

          {/* Interactive Notifications Center */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              style={{
                position: 'relative',
                padding: '8px',
                borderRadius: '9px',
                border: '1px solid #e2e8f0',
                background: notifOpen ? '#f1f5f9' : '#ffffff',
                color: '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff',
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {notifOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 10px)',
                width: '360px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.15)',
                zIndex: 60,
                overflow: 'hidden',
                animation: 'slideUp 0.18s ease',
              }}>
                <div style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f8fafc',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>Notifications</span>
                    <span style={{
                      fontSize: '11px',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '99px',
                    }}>
                      {unreadCount} New
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '11.5px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f1f5f9',
                        background: n.read ? '#ffffff' : '#f8fafc',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: n.severity === 'critical' ? '#dc2626' : n.severity === 'warning' ? '#d97706' : '#2563eb',
                        marginTop: '6px',
                        flexShrink: 0,
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                          <span style={{ fontSize: '12.5px', fontWeight: n.read ? 600 : 700, color: '#0f172a' }}>
                            {n.title}
                          </span>
                          <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>{n.time}</span>
                        </div>
                        <p style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.4 }}>
                          {n.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '4px 12px 4px 6px', borderRadius: 99,
            background: '#f8fafc', border: '1px solid #e2e8f0',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: roleMeta.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#ffffff',
            }}>
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>{user?.full_name || 'User'}</div>
              <div style={{ fontSize: 10.5, color: roleMeta.color, fontWeight: 600 }}>{roleMeta.label}</div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
