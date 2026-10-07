'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/crop-recommendation', label: 'Crops' },
  { href: '/rotation-planner', label: 'Rotation' },
  { href: '/adaptation-planner', label: 'Adapt' },
  { href: '/climate', label: 'Climate' },
  { href: '/compare', label: 'Compare' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(10, 31, 20, 0.9)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(82, 183, 136, 0.12)',
    }}>
      <div className="container-app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--green-500), var(--green-600))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
          }}>
            🌾
          </div>
          <div>
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--text-primary)',
              letterSpacing: '0.05em',
            }}>
              FIELD SHIFT
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.08em', lineHeight: 1 }}>
              NASA-POWERED ADAPTATION
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }} className="desktop-nav">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: pathname === link.href ? 'var(--green-300)' : 'var(--text-muted)',
                background: pathname === link.href ? 'rgba(82, 183, 136, 0.12)' : 'transparent',
                transition: 'all 0.15s ease',
                border: pathname === link.href ? '1px solid rgba(82, 183, 136, 0.2)' : '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (pathname !== link.href) {
                  e.target.style.color = 'var(--green-300)';
                  e.target.style.background = 'rgba(82, 183, 136, 0.06)';
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== link.href) {
                  e.target.style.color = 'var(--text-muted)';
                  e.target.style.background = 'transparent';
                }
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/dashboard" className="btn-primary" style={{ textDecoration: 'none', marginLeft: '8px', padding: '8px 18px', fontSize: '0.875rem' }}>
            My Farm →
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            fontSize: '1.5rem',
            padding: '4px',
          }}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          background: 'rgba(10, 31, 20, 0.98)',
          borderTop: '1px solid var(--border-subtle)',
          padding: '16px',
        }}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'block',
                padding: '12px 16px',
                color: pathname === link.href ? 'var(--green-300)' : 'var(--text-secondary)',
                textDecoration: 'none',
                borderRadius: '8px',
                marginBottom: '4px',
                background: pathname === link.href ? 'rgba(82, 183, 136, 0.1)' : 'transparent',
                fontWeight: 500,
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="btn-primary"
            style={{ textDecoration: 'none', display: 'block', textAlign: 'center', marginTop: '8px' }}
          >
            My Farm →
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
