// Shared primitives — DKube UI kit
// Exported via window.* at the bottom for cross-file React access.

const cx = (...a) => a.filter(Boolean).join(' ');

// ── Brand lockup ───────────────────────────────────────────────
function DKubeLockup({ small }) {
  const sz = small ? 28 : 36;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img src="../../assets/dkube-mark-official.avif" alt="DKube"
        style={{ height: sz, width: 'auto', display: 'block' }} />
      <div style={{
        fontFamily: 'Manrope, Raleway, sans-serif', fontWeight: 700,
        fontSize: small ? 18 : 22, letterSpacing: '-0.035em',
        color: '#6E55A4', lineHeight: 1,
      }}>
        DKube<sup style={{ fontSize: 9, fontWeight: 600, verticalAlign: 'top', marginLeft: 2 }}>TM</sup>
      </div>
    </div>
  );
}

// ── Status badge with dot ─────────────────────────────────────
function StatusBadge({ status, children }) {
  const map = {
    running: { cls: 'badge-purple', dot: '#7030A0' },
    passed:  { cls: 'badge-success', dot: '#18D26E' },
    failed:  { cls: 'badge-error', dot: '#ED3C0D' },
    queued:  { cls: 'badge-neutral', dot: '#777' },
    warning: { cls: 'badge-warning', dot: '#F59E0B' },
  };
  const m = map[status] || map.queued;
  return (
    <span className={cx('badge', m.cls)}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: m.dot,
      }}></span>
      {children}
    </span>
  );
}

// ── Icon — Lucide-style stroke icons (inline SVG) ─────────────
function Icon({ name, size = 16, color = 'currentColor' }) {
  const props = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  const paths = {
    home: <><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></>,
    pipeline: <><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M6 8v3a3 3 0 003 3h6a3 3 0 003-3V8"/><path d="M12 14v2"/></>,
    box: <><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></>,
    book: <><path d="M4 4h12a4 4 0 014 4v12H8a4 4 0 01-4-4V4z"/><path d="M4 4v12"/></>,
    server: <><rect x="3" y="4" width="18" height="6" rx="1"/><rect x="3" y="14" width="18" height="6" rx="1"/><path d="M7 8h.01M7 18h.01"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    play: <><path d="M5 4l14 8-14 8V4z" fill={color}/></>,
    chevronRight: <><path d="M9 6l6 6-6 6"/></>,
    chevronDown: <><path d="M6 9l6 6 6-6"/></>,
    gpu: <><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/></>,
    code: <><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></>,
    sparkle: <><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    bell: <><path d="M6 8a6 6 0 1112 0c0 7 3 8 3 8H3s3-1 3-8z"/><path d="M10 21a2 2 0 004 0"/></>,
    download: <><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"/></>,
  };
  return <svg {...props}>{paths[name] || null}</svg>;
}

Object.assign(window, { cx, DKubeLockup, StatusBadge, Icon });
