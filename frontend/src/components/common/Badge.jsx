import React from 'react';

const VARIANT_MAP = {
  success: 'badge-emerald',
  danger:  'badge-rose',
  warning: 'badge-amber',
  info:    'badge-blue',
  purple:  'badge-purple',
  cyan:    'badge-cyan',
  slate:   'badge-slate',
};

export const Badge = ({ variant = 'info', children }) => (
  <span className={`badge ${VARIANT_MAP[variant] || 'badge-slate'}`}>
    {children}
  </span>
);
