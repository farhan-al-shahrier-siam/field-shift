import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      background: 'rgba(10, 31, 20, 0.8)',
      marginTop: 'auto',
      padding: '40px 0 24px',
    }}>
      <div className="container-app">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '32px' }}>
          {/* Brand */}
          <div>
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px' }}>
              🌾 FIELD SHIFT
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              NASA-powered agricultural adaptation. An experimental decision-support tool for the NASA Space Apps Challenge 2026.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.1em', color: 'var(--green-400)', marginBottom: '12px' }}>
              EXPLORE
            </div>
            {[
              { href: '/dashboard', label: 'Farm Dashboard' },
              { href: '/crop-recommendation', label: 'Crop Recommendations' },
              { href: '/rotation-planner', label: 'Rotation Planner' },
              { href: '/adaptation-planner', label: 'Adaptation Planner' },
              { href: '/climate', label: 'Climate Explorer' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{ display: 'block', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '6px', transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = 'var(--green-300)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* NASA Data */}
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.1em', color: 'var(--green-400)', marginBottom: '12px' }}>
              DATA SOURCE
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '12px' }}>
              Environmental data powered by NASA POWER (Prediction of Worldwide Energy Resources).
            </p>
            <a
              href="https://power.larc.nasa.gov"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--blue-light)', fontSize: '0.85rem', textDecoration: 'none' }}
            >
              power.larc.nasa.gov ↗
            </a>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            © 2026 Field Shift — NASA Space Apps Challenge. Experimental decision-support tool. Not a substitute for professional agricultural advice.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8rem' }}>About</Link>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>NASA Space Apps 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
