// PipelineScreen — DAG + logs detail view

function PipelineScreen({ name = 'resnet-finetune', onBack }) {
  const [activeTab, setActiveTab] = React.useState('graph');
  const steps = [
    { id: 'load', label: 'Load dataset', status: 'passed', duration: '0:18' },
    { id: 'prep', label: 'Preprocess', status: 'passed', duration: '0:42' },
    { id: 'train', label: 'Train', status: 'running', duration: '01:42' },
    { id: 'eval', label: 'Evaluate', status: 'queued', duration: '—' },
    { id: 'reg', label: 'Register', status: 'queued', duration: '—' },
  ];
  return (
    <main style={{ padding: '32px 32px 64px', flex: 1, maxWidth: 1400 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#777', marginBottom: 16 }}>
        <a onClick={onBack} style={{ cursor: 'pointer', color: '#7030A0' }}>Overview</a>
        <Icon name="chevronRight" size={12} />
        <span>Pipelines</span>
        <Icon name="chevronRight" size={12} />
        <span style={{ color: '#333', fontWeight: 600 }}>{name}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 20, borderBottom: '1px solid #EDEDED', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>{name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
            <StatusBadge status="running">Running · step 3 of 5</StatusBadge>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#777' }}>run-2418 · main · ana@oneconvergence.com</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline btn-sm">Clone run</button>
          <button className="btn btn-primary btn-sm" style={{ background: '#ED3C0D', borderColor: '#ED3C0D' }}>Cancel</button>
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { l: 'Started', v: '14:02 UTC', m: '15 May 2026' },
          { l: 'Elapsed', v: '01:42:18', m: 'est. 2:30 total' },
          { l: 'GPU', v: '8× A100', m: 'us-east-1' },
          { l: 'Loss', v: '0.218', m: '↓ 0.014 last epoch' },
          { l: 'Val. acc.', v: '0.946', m: '+1.2pt vs. v2' },
        ].map(s => (
          <div key={s.l} className="card" style={{ padding: 16 }}>
            <div className="label-eyebrow" style={{ marginBottom: 6 }}>{s.l}</div>
            <div style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 700, fontSize: 20, color: '#333' }}>{s.v}</div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>{s.m}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #EDEDED', marginBottom: 20 }}>
        {[
          { id: 'graph', label: 'Graph' },
          { id: 'logs', label: 'Logs' },
          { id: 'metrics', label: 'Metrics' },
          { id: 'lineage', label: 'Lineage' },
          { id: 'config', label: 'Config' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              padding: '10px 20px', background: 'none', border: 'none',
              borderBottom: activeTab === t.id ? '2px solid #7030A0' : '2px solid transparent',
              fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13,
              color: activeTab === t.id ? '#7030A0' : '#777',
              marginBottom: -1,
            }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'graph' && (
        <div className="card" style={{ padding: 32 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 0, alignItems: 'center', position: 'relative',
          }}>
            {steps.map((s, i) => (
              <React.Fragment key={s.id}>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 10, position: 'relative', zIndex: 1,
                }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: 14,
                    border: '2px solid ' + (s.status === 'passed' ? '#18D26E' : s.status === 'running' ? '#7030A0' : '#DDD'),
                    background: s.status === 'passed' ? 'rgba(24,210,110,0.08)' : s.status === 'running' ? '#F5EEFB' : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: s.status === 'passed' ? '#0F9D58' : s.status === 'running' ? '#7030A0' : '#999',
                    fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 18,
                    position: 'relative',
                  }}>
                    {s.status === 'running' && (
                      <div style={{ position: 'absolute', inset: -6, borderRadius: 18, border: '2px solid #7030A0', opacity: 0.3, animation: 'pulse 2s infinite' }}></div>
                    )}
                    {s.status === 'passed' ? '✓' : i + 1}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, color: '#333' }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: '#999', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{s.duration}</div>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div style={{
                    position: 'absolute', top: 36,
                    left: `${(i + 0.5) / steps.length * 100 + 6}%`,
                    width: `${100 / steps.length - 12}%`,
                    height: 2, background: s.status === 'passed' ? '#18D26E' : '#DDD',
                    zIndex: 0,
                  }}></div>
                )}
              </React.Fragment>
            ))}
          </div>
          <style>{`@keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.1; transform: scale(1.1); } }`}</style>
        </div>
      )}
      {activeTab === 'logs' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden', background: '#141414' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #2a2a2a', display: 'flex', justifyContent: 'space-between', color: '#888', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
            <span>train.py · step 3/5 · 8× A100</span>
            <span>tailing · 12,348 lines</span>
          </div>
          <pre style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#E8E5EA', padding: 16, margin: 0, lineHeight: 1.7 }}>
{`[14:02:01] Loading dataset 'imagenet-1k-2024' (1.28M samples)...
[14:02:18] Loaded. 1,281,167 train · 50,000 val
[14:02:19] Initializing 8× A100 (us-east-1, dkube/pytorch:2.3)
[14:02:42] All workers ready. World size = 8.
[14:03:01] Loading checkpoint resnet-50 v2 (76.3MB)
[14:03:04] Starting fine-tune · 40 epochs · LR=3e-4 · cosine schedule
[14:03:11] epoch  1/40  loss=0.842  val_acc=0.781  gpu_util=92%
[14:09:18] epoch  5/40  loss=0.541  val_acc=0.847  gpu_util=94%
[14:23:44] epoch 15/40  loss=0.318  val_acc=0.901  gpu_util=93%
[14:51:09] epoch 30/40  loss=0.241  val_acc=0.938  gpu_util=92%
[15:42:11] epoch 38/40  loss=0.218  val_acc=0.946  gpu_util=93%   ← current
`}<span style={{ background: '#B180F8', color: '#141414', padding: '0 4px' }}>_</span>
          </pre>
        </div>
      )}
      {activeTab !== 'graph' && activeTab !== 'logs' && (
        <div className="card" style={{ padding: 60, textAlign: 'center', color: '#999' }}>
          <Icon name="code" size={28} color="#bbb" />
          <p style={{ marginTop: 12, fontSize: 14 }}>{activeTab[0].toUpperCase() + activeTab.slice(1)} panel</p>
        </div>
      )}
    </main>
  );
}

Object.assign(window, { PipelineScreen });
