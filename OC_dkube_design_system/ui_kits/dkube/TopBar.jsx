// Sticky top app bar — mirrors frontend/src/app/layout.tsx pattern

function TopBar({ user = "Ana M.", workspace = "acme-research" }) {
  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid #EDEDED',
      boxShadow: '0 2px 15px rgba(0,0,0,0.04)',
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 60,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <DKubeLockup />
          <div style={{
            height: 24, width: 1, background: '#EDEDED',
          }}></div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px 6px 12px',
            border: '1px solid #EDEDED', borderRadius: 999,
            background: 'white', color: '#444', fontSize: 13,
            fontFamily: 'Poppins, sans-serif', fontWeight: 500,
          }}>
            <span style={{
              width: 18, height: 18, background: '#7030A0', color: 'white',
              borderRadius: '50%', fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>A</span>
            {workspace}
            <Icon name="chevronDown" size={14} color="#777" />
          </button>
        </div>

        <div style={{
          flex: 1, maxWidth: 440, margin: '0 32px', position: 'relative',
        }}>
          <input className="input" placeholder="Search pipelines, models, datasets…"
            style={{
              paddingLeft: 36, paddingRight: 48, height: 36, fontSize: 13,
              background: '#F7F7F7', border: '1px solid transparent',
            }}/>
          <span style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)', pointerEvents: 'none',
            display: 'flex',
          }}>
            <Icon name="search" size={14} color="#aaa" />
          </span>
          <span style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            color: '#999', background: 'white', padding: '1px 6px',
            border: '1px solid #EDEDED', borderRadius: 4,
          }}>⌘K</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{
            background: 'transparent', border: 'none', color: '#777',
            padding: 8, position: 'relative',
          }}>
            <Icon name="bell" size={18} />
            <span style={{
              position: 'absolute', top: 6, right: 6, width: 7, height: 7,
              borderRadius: '50%', background: '#ED3C0D',
            }}></span>
          </button>
          <button className="btn btn-primary btn-sm">
            <Icon name="sparkle" size={13} /> &nbsp;Ask DKube AI
          </button>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#7030A0', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, fontFamily: 'Poppins, sans-serif',
          }}>{user.split(' ').map(p => p[0]).join('')}</div>
        </div>
      </div>
    </header>
  );
}

Object.assign(window, { TopBar });
