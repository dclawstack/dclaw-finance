// Left sidebar nav

function Sidebar({ active, onNavigate }) {
  const groups = [
    {
      label: 'Workspace',
      items: [
        { id: 'dashboard', icon: 'home', label: 'Overview' },
        { id: 'pipelines', icon: 'pipeline', label: 'Pipelines', badge: '3 running' },
        { id: 'notebooks', icon: 'book', label: 'Notebooks' },
        { id: 'models', icon: 'box', label: 'Models' },
      ],
    },
    {
      label: 'Infrastructure',
      items: [
        { id: 'clusters', icon: 'server', label: 'Clusters' },
        { id: 'gpus', icon: 'gpu', label: 'GPU pools' },
      ],
    },
    {
      label: 'Account',
      items: [
        { id: 'team', icon: 'user', label: 'Team' },
        { id: 'settings', icon: 'settings', label: 'Settings' },
      ],
    },
  ];
  return (
    <aside style={{
      width: 224, background: 'white', borderRight: '1px solid #EDEDED',
      padding: '20px 12px', height: 'calc(100vh - 60px)',
      position: 'sticky', top: 60, overflowY: 'auto',
    }}>
      {groups.map((g, gi) => (
        <div key={g.label} style={{ marginBottom: 24 }}>
          <div className="label-eyebrow" style={{ padding: '0 12px 8px', fontSize: 10 }}>{g.label}</div>
          <div style={{ display: 'grid', gap: 2 }}>
            {g.items.map(it => {
              const isActive = active === it.id;
              return (
                <button key={it.id}
                  onClick={() => onNavigate?.(it.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px', borderRadius: 8,
                    border: 'none', background: isActive ? '#F5EEFB' : 'transparent',
                    color: isActive ? '#7030A0' : '#555',
                    fontFamily: 'Poppins, sans-serif', fontWeight: isActive ? 600 : 500,
                    fontSize: 13, textAlign: 'left', width: '100%',
                    transition: 'background 150ms ease, color 150ms ease',
                  }}>
                  <Icon name={it.icon} size={16} />
                  <span style={{ flex: 1 }}>{it.label}</span>
                  {it.badge && (
                    <span style={{
                      fontSize: 10, color: '#7030A0', fontWeight: 600,
                      background: 'white', border: '1px solid #E7D8F4',
                      padding: '0 6px', borderRadius: 99,
                    }}>{it.badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div style={{
        marginTop: 'auto', padding: 16, background: '#F7F7F7',
        borderRadius: 10, fontSize: 12,
      }}>
        <div className="label-eyebrow" style={{ fontSize: 9, marginBottom: 6 }}>GPU quota</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
          <span style={{ color: '#444', fontWeight: 600 }}>34 / 64</span>
          <span style={{ color: '#777' }}>53%</span>
        </div>
        <div style={{ height: 4, background: '#EDEDED', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: '53%', height: '100%', background: '#7030A0' }}></div>
        </div>
      </div>
    </aside>
  );
}

Object.assign(window, { Sidebar });
