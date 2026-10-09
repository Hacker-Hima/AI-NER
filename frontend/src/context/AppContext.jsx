import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'High Disruption Risk on Imphal Corridor',
    message: 'NH-37 Barail sector risk increased to 78% due to active cloudburst.',
    severity: 'critical',
    module: 'Routes',
    time: '5m ago',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Convoy Delayed by 2.3 Hours',
    message: 'Shipment NER-MED-8401 (Vaccines) halted near Bhalukpong for route clearance.',
    severity: 'warning',
    module: 'Shipments',
    time: '24m ago',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Landslide Verified on NH-13 Km 84',
    message: 'Regional Observer verified rockfall near Sela Lake approach road.',
    severity: 'critical',
    module: 'Incidents',
    time: '1h ago',
    read: false,
  },
  {
    id: 'notif-4',
    title: 'Alternate Route Activated',
    message: 'Convoy NER-RAT-4219 safely rerouted via Foothills bypass corridor.',
    severity: 'success',
    module: 'Fleet',
    time: '2h ago',
    read: true,
  },
  {
    id: 'notif-5',
    title: 'Emergency Medical Dispatch Scheduled',
    message: 'Guwahati Depot prepared ICU medical kit shipment for Tawang.',
    severity: 'info',
    module: 'Emergency',
    time: '3h ago',
    read: true,
  },
];

export const AppProvider = ({ children }) => {
  const [emergencyMode, setEmergencyMode] = useState(() => {
    return localStorage.getItem('ner_emergency_mode') === 'true';
  });
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [toast, setToast] = useState(null);

  const toggleEmergencyMode = (forcedValue) => {
    setEmergencyMode(prev => {
      const next = typeof forcedValue === 'boolean' ? forcedValue : !prev;
      localStorage.setItem('ner_emergency_mode', next.toString());
      if (next) {
        showToast('🚨 Emergency Operations Mode ACTIVATED! Priority dispatching in effect.', 'critical');
      } else {
        showToast('Normal operations resumed. Emergency mode deactivated.', 'info');
      }
      return next;
    });
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'info');
  };

  const addNotification = (notif) => {
    const newN = {
      id: `notif-${Date.now()}`,
      time: 'Just now',
      read: false,
      ...notif,
    };
    setNotifications(prev => [newN, ...prev]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{
      emergencyMode,
      toggleEmergencyMode,
      notifications,
      unreadCount,
      markNotificationRead,
      markAllNotificationsRead,
      addNotification,
      toast,
      showToast,
    }}>
      {children}
      {/* Global Toast Component */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          animation: 'slideUp 0.25s ease',
        }}>
          <div className={`toast toast-${toast.type}`} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 20px',
            borderRadius: '12px',
            background: toast.type === 'critical' ? '#fef2f2' : toast.type === 'warning' ? '#fffbeb' : toast.type === 'info' ? '#eff6ff' : '#ecfdf5',
            border: `1px solid ${toast.type === 'critical' ? '#fca5a5' : toast.type === 'warning' ? '#fde68a' : toast.type === 'info' ? '#bfdbfe' : '#a7f3d0'}`,
            color: toast.type === 'critical' ? '#b91c1c' : toast.type === 'warning' ? '#92400e' : toast.type === 'info' ? '#1e40af' : '#047857',
            fontSize: '13.5px',
            fontWeight: '600',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)',
          }}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
