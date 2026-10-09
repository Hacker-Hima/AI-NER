import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Truck,
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Activity,
  MapPin,
  CheckCircle2,
  Navigation,
  Compass
} from 'lucide-react';

const DEMO_ACCOUNTS = [
  { username: 'admin', role: 'admin', label: 'Admin', desc: 'Regional Command Authority' },
  { username: 'coordinator', role: 'logistics_coordinator', label: 'Logistics Coordinator', desc: 'Depot & Convoy Dispatcher' },
  { username: 'driver', role: 'field_driver', label: 'Driver', desc: 'Mountain Convoy Operator' },
  { username: 'observer', role: 'regional_observer', label: 'Regional Observer', desc: 'Ground Hazard & Accessibility' },
];

export const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123');
  const [selectedRole, setSelectedRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectDemo = (acc) => {
    setUsername(acc.username);
    setPassword('123');
    setSelectedRole(acc.role);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(username, password);
      showToast(`Welcome back, ${user.full_name || username}!`, 'success');

      // Role-specific redirection
      if (user.role === 'field_driver') {
        navigate('/driver');
      } else if (user.role === 'regional_observer') {
        navigate('/observer');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '28px 20px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1080px',
        background: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.02)',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
      }}>

        {/* LEFT COLUMN: Clean Enterprise Branding */}
        <div style={{
          background: 'linear-gradient(150deg, #1e3a8a 0%, #1d4ed8 55%, #2563eb 100%)',
          padding: '48px 44px',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
        }}>
          <div>
            {/* Tag */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '99px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              fontSize: '12px',
              fontWeight: '600',
              letterSpacing: '0.04em',
              marginBottom: '28px',
            }}>
              <Truck size={14} />
              NORTH EASTERN REGION LOGISTICS
            </div>

            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              fontFamily: 'Space Grotesk, sans-serif',
              lineHeight: 1.25,
              letterSpacing: '-0.03em',
              marginBottom: '14px',
            }}>
              NER LogiFlow
            </h1>

            <p style={{
              fontSize: '15px',
              lineHeight: 1.65,
              color: 'rgba(255, 255, 255, 0.88)',
              marginBottom: '32px',
            }}>
              AI-powered logistics and disaster intelligence for the North Eastern Region. Real-time regional monitoring, predictive disruption forecasting, and supply assurance across 8 states.
            </p>

            {/* Visual Logistics Status Panel */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              padding: '18px 20px',
              marginBottom: '32px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '0.04em',
                color: 'rgba(255, 255, 255, 0.9)',
                textTransform: 'uppercase',
              }}>
                <span>Live Regional Status</span>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#4ade80',
                  fontWeight: '700',
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                  Monitoring Active
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ background: 'rgba(0, 0, 0, 0.12)', padding: '10px 12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)' }}>Active Convoys</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '2px' }}>12 Units</div>
                </div>
                <div style={{ background: 'rgba(0, 0, 0, 0.12)', padding: '10px 12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)' }}>Safe Corridors</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '2px' }}>82.5%</div>
                </div>
                <div style={{ background: 'rgba(0, 0, 0, 0.12)', padding: '10px 12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)' }}>Active Hazards</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '2px', color: '#fca5a5' }}>3 Points</div>
                </div>
              </div>
            </div>

            {/* Feature List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { title: 'Predictive Landslide & Flood Engine', desc: 'Precipitation saturation & terrain gradient ML inference' },
                { title: 'Live Fleet Telemetry & Safe Rerouting', desc: 'Real-time convoy tracking with instant bypass activation' },
                { title: 'Emergency Operations Command', desc: 'Priority dispatching for critical medicines, rations & fuel' },
              ].map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: '2px',
                  }}>
                    <CheckCircle2 size={13} color="#ffffff" />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{feat.title}</div>
                    <div style={{ fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.75)' }}>{feat.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            paddingTop: '28px',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            fontSize: '11.5px',
            color: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span>NER LogiFlow Platform v2.2</span>
            <span>Government & Enterprise Command</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Clean Light Sign In */}
        <div style={{
          padding: '44px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#ffffff',
        }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#0f172a',
              fontFamily: 'Space Grotesk, sans-serif',
              letterSpacing: '-0.02em',
              marginBottom: '6px',
            }}>
              Sign In to Command Center
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748b' }}>
              Select your role and enter credentials to access your control room.
            </p>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '18px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              color: '#b91c1c',
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '700',
                color: '#334155',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Role
              </label>
              <select
                className="form-select"
                style={{ height: '42px', fontSize: '13.5px', fontWeight: '500' }}
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  const matched = DEMO_ACCOUNTS.find(a => a.role === e.target.value);
                  if (matched) setUsername(matched.username);
                }}
              >
                <option value="admin">System Administrator (Command Authority)</option>
                <option value="logistics_coordinator">Logistics Coordinator (Depot Dispatcher)</option>
                <option value="field_driver">Driver (Mountain Convoy Operator)</option>
                <option value="regional_observer">Regional Observer (Ground Hazard Monitor)</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '700',
                color: '#334155',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Username / Email
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '40px', height: '42px' }}
                  placeholder="e.g. admin or coordinator"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#334155',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  Password
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '40px', paddingRight: '40px', height: '42px' }}
                  placeholder="Enter password (default: 123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: '4px',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '12px',
                fontSize: '14px',
                marginTop: '4px',
                borderRadius: '10px',
              }}
              disabled={loading}
            >
              {loading ? (
                <div style={{
                  width: '18px', height: '18px',
                  border: '2px solid #ffffff',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Access Platform</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Access Helper Section */}
          <div style={{
            marginTop: '24px',
            padding: '14px 16px',
            borderRadius: '12px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}>
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Demo Access Credentials
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#059669',
                background: '#ecfdf5',
                padding: '2px 8px',
                borderRadius: '99px',
                border: '1px solid #a7f3d0'
              }}>
                Password: <strong>123</strong>
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleSelectDemo(acc)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: username === acc.username ? '#eff6ff' : '#ffffff',
                    border: username === acc.username ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: username === acc.username ? '#1d4ed8' : '#0f172a'
                  }}>
                    {acc.label}
                  </span>
                  <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                    {acc.username}
                  </span>
                </button>
              ))}
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', textAlign: 'center' }}>
              Click any role above to automatically autofill credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
