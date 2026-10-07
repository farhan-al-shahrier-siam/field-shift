export function LoadingSpinner({ size = 24, color = 'var(--green-400)' }) {
  return (
    <div style={{
      width: size,
      height: size,
      border: `2px solid rgba(82, 183, 136, 0.2)`,
      borderTop: `2px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      display: 'inline-block',
    }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export function SkeletonCard({ height = 120 }) {
  return (
    <div className="skeleton" style={{ height, borderRadius: '16px' }} />
  );
}

export function LoadingState({ messages = [] }) {
  const defaultMessages = [
    'Connecting to climate data…',
    'Analyzing environmental conditions…',
    'Building your Field Shift plan…',
  ];
  const msgs = messages.length ? messages : defaultMessages;

  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <LoadingSpinner size={48} />
      </div>
      <div>
        {msgs.map((msg, i) => (
          <p
            key={i}
            style={{
              color: i === 0 ? 'var(--text-secondary)' : 'var(--text-muted)',
              fontSize: i === 0 ? '1rem' : '0.875rem',
              marginBottom: '6px',
              animation: `fadeInUp 0.4s ease ${i * 0.3}s both`,
            }}
          >
            {i === 0 ? '⟳ ' : ''}
            {msg}
          </p>
        ))}
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="glass-card" style={{
      padding: '32px',
      textAlign: 'center',
      border: '1px solid rgba(239, 68, 68, 0.2)',
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚠️</div>
      <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '1.1rem' }}>
        Something went wrong
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
        {message || 'An unexpected error occurred. Please try again.'}
      </p>
      {onRetry && (
        <button className="btn-primary" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, actionLabel, onAction, icon = '🌱' }) {
  return (
    <div className="glass-card" style={{ padding: '48px 32px', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button className="btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function DemoBanner({ message }) {
  return (
    <div className="demo-banner">
      <span style={{ fontSize: '1rem' }}>⚠️</span>
      <div>
        <strong>DEMO MODE</strong>
        {' — '}
        <span>{message || 'This visualization is using sample data and is not live NASA data.'}</span>
      </div>
    </div>
  );
}

export function RiskBadge({ level }) {
  const config = {
    'Low': { icon: '🟢', class: 'badge-green' },
    'Moderate': { icon: '🟡', class: 'badge-yellow' },
    'High': { icon: '🔴', class: 'badge-red' },
    'Very High': { icon: '🔴', class: 'badge-red' },
    'Very Low': { icon: '🟢', class: 'badge-green' },
  };
  const c = config[level] || { icon: '⚪', class: 'badge' };
  return (
    <span className={`badge ${c.class}`}>
      {c.icon} {level}
    </span>
  );
}

export function SuitabilityScore({ score }) {
  const getColor = (s) => {
    if (s >= 85) return 'var(--green-400)';
    if (s >= 70) return 'var(--green-500)';
    if (s >= 55) return '#fbbf24';
    if (s >= 40) return '#fb923c';
    return '#f87171';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{
        minWidth: '56px',
        height: '56px',
        borderRadius: '50%',
        border: `3px solid ${getColor(score)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: `rgba(${score >= 70 ? '64, 145, 108' : score >= 55 ? '245, 158, 11' : '239, 68, 68'}, 0.1)`,
      }}>
        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1rem', color: getColor(score) }}>
          {score}
        </span>
        <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>/ 100</span>
      </div>
      <div className="suitability-bar" style={{ flex: 1 }}>
        <div
          className="suitability-fill"
          style={{
            width: `${score}%`,
            background: `linear-gradient(90deg, ${getColor(score)}, ${getColor(score)}aa)`,
          }}
        />
      </div>
    </div>
  );
}

export function ClimateCard({ title, value, unit, icon, trend, description }) {
  return (
    <div className="glass-card glass-card-hover" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
        {trend && (
          <span style={{
            fontSize: '0.75rem',
            color: trend === 'up' ? '#f87171' : trend === 'down' ? '#60b4d8' : 'var(--text-muted)',
            fontWeight: 600,
          }}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trend === 'up' ? 'Rising' : trend === 'down' ? 'Falling' : 'Stable'}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '2rem', color: 'var(--text-primary)' }}>
          {value !== null && value !== undefined ? value : '—'}
        </span>
        {unit && <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{unit}</span>}
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{title}</div>
      {description && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '6px', lineHeight: 1.5 }}>
          {description}
        </p>
      )}
    </div>
  );
}

export function SectionHeader({ label, title, subtitle }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      {label && (
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.15em',
          color: 'var(--green-400)',
          marginBottom: '8px',
        }}>
          {label}
        </div>
      )}
      <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--text-primary)', marginBottom: '8px' }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
