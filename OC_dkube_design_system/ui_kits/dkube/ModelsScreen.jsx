// ModelsScreen — model registry table

function ModelsScreen() {
  const models = [
    { name: 'resnet-50-finetune', stage: 'Production', version: 'v3', metric: 'acc 0.946', size: '102 MB', updated: '12 min ago', who: 'Ana M.' },
    { name: 'sentiment-distilbert', stage: 'Production', version: 'v7', metric: 'f1 0.918', size: '268 MB', updated: '4 h ago', who: 'Vik P.' },
    { name: 'fraud-graph-net', stage: 'Staging', version: 'v2', metric: 'auc 0.972', size: '48 MB', updated: '1 d ago', who: 'Priya R.' },
    { name: 'churn-xgb', stage: 'Production', version: 'v12', metric: 'auc 0.881', size: '12 MB', updated: '3 d ago', who: 'Marc T.' },
    { name: 'mistral-7b-instruct', stage: 'Staging', version: 'v1', metric: 'mmlu 0.642', size: '13.4 GB', updated: '6 d ago', who: 'Sami O.' },
    { name: 'recsys-two-tower', stage: 'Archived', version: 'v5', metric: 'ndcg 0.482', size: '1.2 GB', updated: '3 w ago', who: 'Ana M.' },
  ];
  const stageColor = s => s === 'Production' ? '#7030A0' : s === 'Staging' ? '#F59E0B' : '#999';
  const stageBg = s => s === 'Production' ? '#F5EEFB' : s === 'Staging' ? 'rgba(245,158,11,0.12)' : '#EDEDED';
  return (
    <main style={{ padding: '32px 32px 64px', flex: 1, maxWidth: 1400 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 20, borderBottom: '1px solid #EDEDED', marginBottom: 28 }}>
        <div>
          <div className="label-eyebrow" style={{ marginBottom: 8 }}>Registry</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>Models</h1>
          <p style={{ color: '#777', marginTop: 6, fontSize: 14 }}>47 models across 12 projects. Lineage is recorded for every promotion.</p>
        </div>
        <button className="btn btn-primary btn-sm">
          <Icon name="plus" size={13} /> &nbsp;Register model
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <input className="input" placeholder="Filter by name, framework, owner…" style={{ maxWidth: 360 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          {['All', 'Production', 'Staging', 'Archived'].map((f, i) => (
            <button key={f} className={i === 0 ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
              style={i !== 0 ? { color: '#555', background: 'white', border: '1px solid #EDEDED' } : {}}>{f}</button>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#777', fontFamily: 'JetBrains Mono, monospace' }}>6 of 47</span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 0.6fr 1fr 0.7fr 1fr',
          gap: 16, padding: '12px 24px', background: '#FAFAFB',
          fontFamily: 'Poppins, sans-serif', fontSize: 10, fontWeight: 600,
          color: '#999', letterSpacing: '0.06em', textTransform: 'uppercase',
          borderBottom: '1px solid #EDEDED',
        }}>
          <span>Model</span><span>Stage</span><span>Version</span><span>Metric</span><span>Size</span><span>Updated</span>
        </div>
        {models.map(m => (
          <div key={m.name}
            style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 0.6fr 1fr 0.7fr 1fr',
              gap: 16, padding: '16px 24px', alignItems: 'center',
              borderBottom: '1px solid #F3F3F3', cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#FAFAFB'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600, color: '#333' }}>{m.name}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#999', marginTop: 2 }}>{m.who}</div>
            </div>
            <span className="badge" style={{ background: stageBg(m.stage), color: stageColor(m.stage), alignSelf: 'center', justifySelf: 'start' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: stageColor(m.stage) }}></span>
              {m.stage}
            </span>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#7030A0', fontWeight: 600 }}>{m.version}</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#444' }}>{m.metric}</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#555' }}>{m.size}</div>
            <div style={{ fontSize: 12, color: '#777' }}>{m.updated}</div>
          </div>
        ))}
      </div>
    </main>
  );
}

Object.assign(window, { ModelsScreen });
