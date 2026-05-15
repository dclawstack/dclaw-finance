// DashboardScreen — workspace overview

function KpiCard({ label, value, sub, stripe, trend }) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ height: 3, background: stripe }}></div>
      <div style={{ padding: 20 }}>
        <div className="label-eyebrow" style={{ marginBottom: 10 }}>{label}</div>
        <div style={{
          fontFamily: 'Raleway, sans-serif', fontWeight: 700,
          fontSize: 26, color: '#333', lineHeight: 1, letterSpacing: '-0.02em',
        }}>{value}</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8 }}>
          <span style={{
            fontFamily: 'Poppins, sans-serif', fontSize: 11, fontWeight: 600,
            color: trend > 0 ? '#0F9D58' : trend < 0 ? '#ED3C0D' : '#777',
          }}>
            {trend > 0 ? '↑ ' : trend < 0 ? '↓ ' : ''}{Math.abs(trend)}%
          </span>
          <span style={{ fontSize: 11, color: '#999' }}>{sub}</span>
        </div>
      </div>
    </div>
  );
}

function Spark({ data, color = '#7030A0', height = 32 }) {
  const max = Math.max(...data);
  const w = 80, h = height;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h - 4) - 2}`).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function RunRow({ name, model, status, gpus, duration, who, time, onOpen }) {
  return (
    <div
      onClick={onOpen}
      style={{
        display: 'grid', gridTemplateColumns: '1.6fr 1fr 0.7fr 0.6fr 0.7fr 0.7fr 24px',
        gap: 16, alignItems: 'center', padding: '14px 20px',
        borderBottom: '1px solid #F3F3F3', cursor: 'pointer',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#FAFAFB'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <div>
        <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600, color: '#333' }}>{name}</div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#999', marginTop: 2 }}>run-{Math.floor(Math.random() * 9000 + 1000)} · main</div>
      </div>
      <div style={{ fontSize: 13, color: '#555' }}>{model}</div>
      <StatusBadge status={status}>{status[0].toUpperCase() + status.slice(1)}</StatusBadge>
      <div style={{ fontSize: 13, color: '#555', fontFamily: 'JetBrains Mono, monospace' }}>{gpus}× A100</div>
      <div style={{ fontSize: 13, color: '#555', fontFamily: 'JetBrains Mono, monospace' }}>{duration}</div>
      <div style={{ fontSize: 12, color: '#777' }}>{who} · {time}</div>
      <Icon name="chevronRight" size={16} color="#bbb" />
    </div>
  );
}

function DashboardScreen({ onOpenPipeline }) {
  const runs = [
    { name: 'resnet-finetune', model: 'resnet-50 · v3', status: 'running', gpus: 8, duration: '01:42:18', who: 'Ana', time: '2m ago' },
    { name: 'sentiment-distilbert', model: 'distilbert-base', status: 'passed', gpus: 4, duration: '00:38:04', who: 'Vik', time: '1h ago' },
    { name: 'fraud-graph-net', model: 'graphsage-128', status: 'passed', gpus: 2, duration: '02:11:55', who: 'Priya', time: '3h ago' },
    { name: 'churn-xgb-sweep', model: 'xgboost-1.7', status: 'failed', gpus: 1, duration: '00:04:11', who: 'Marc', time: '5h ago' },
    { name: 'mistral-rag-eval', model: 'mistral-7b-instruct', status: 'queued', gpus: 4, duration: '— —:—:—', who: 'Sami', time: '10m ago' },
  ];
  return (
    <main style={{ padding: '32px 32px 64px', flex: 1, maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 20, borderBottom: '1px solid #EDEDED', marginBottom: 28 }}>
        <div>
          <div className="label-eyebrow" style={{ marginBottom: 8 }}>Workspace · acme-research</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>Overview</h1>
          <p style={{ color: '#777', marginTop: 6, fontSize: 14 }}>Status of pipelines, models, and infra over the last 7 days.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline btn-sm">
            <Icon name="download" size={13} /> &nbsp;Export
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onOpenPipeline?.('resnet-finetune')}>
            <Icon name="plus" size={13} /> &nbsp;New pipeline
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <KpiCard label="Active pipelines" value="12" sub="vs. last week" stripe="#7030A0" trend={8} />
        <KpiCard label="Models in registry" value="47" sub="6 promoted" stripe="#B180F8" trend={14} />
        <KpiCard label="GPU hours · week" value="284 h" sub="of 480 budget" stripe="#682899" trend={-3} />
        <KpiCard label="P99 inference" value="38 ms" sub="us-east-1" stripe="#18D26E" trend={-12} />
      </div>

      {/* Chart + alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, gap: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap' }}>GPU utilization · 7 days</h3>
            <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
              <span style={{ color: '#555' }}><span style={{ display: 'inline-block', width: 8, height: 8, background: '#7030A0', borderRadius: 2, marginRight: 6 }}></span>Training</span>
              <span style={{ color: '#555' }}><span style={{ display: 'inline-block', width: 8, height: 8, background: '#B180F8', borderRadius: 2, marginRight: 6 }}></span>Inference</span>
            </div>
          </div>
          <svg width="100%" height="180" viewBox="0 0 700 180" preserveAspectRatio="none">
            {[40, 80, 120, 160].map(y => <line key={y} x1="0" x2="700" y1={y} y2={y} stroke="#EDEDED" strokeDasharray="3 3"/>)}
            <polyline points="0,140 100,90 200,110 300,70 400,85 500,55 600,75 700,40"
              fill="none" stroke="#7030A0" strokeWidth="2.5" strokeLinejoin="round" />
            <polyline points="0,160 100,140 200,135 300,130 400,120 500,125 600,110 700,95"
              fill="none" stroke="#B180F8" strokeWidth="2.5" strokeLinejoin="round" strokeDasharray="0" />
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#999', marginTop: 6 }}>
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #EDEDED', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>Alerts</h3>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#777' }}>3 active</span>
          </div>
          <div style={{ padding: 16, display: 'grid', gap: 12 }}>
            <div style={{ padding: 12, background: 'rgba(237,60,13,0.06)', borderRadius: 8, borderLeft: '3px solid #ED3C0D' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#ED3C0D' }}>churn-xgb-sweep failed</div>
              <div style={{ fontSize: 11, color: '#777', marginTop: 2 }}>OOM at step 12 of 40 · 5h ago</div>
            </div>
            <div style={{ padding: 12, background: 'rgba(245,158,11,0.06)', borderRadius: 8, borderLeft: '3px solid #F59E0B' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#B45309' }}>GPU quota 80% used</div>
              <div style={{ fontSize: 11, color: '#777', marginTop: 2 }}>us-east-1 · resets Sun 00:00 UTC</div>
            </div>
            <div style={{ padding: 12, background: '#F5EEFB', borderRadius: 8, borderLeft: '3px solid #7030A0' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#4A1F6C' }}>resnet-50 v3 ready to promote</div>
              <div style={{ fontSize: 11, color: '#777', marginTop: 2 }}>+1.2pt accuracy over v2 · review</div>
            </div>
          </div>
        </div>
      </div>

      {/* Runs table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #EDEDED', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap' }}>Recent runs</h3>
          <button className="btn btn-ghost btn-sm">View all →</button>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.6fr 1fr 0.7fr 0.6fr 0.7fr 0.7fr 24px',
          gap: 16, padding: '10px 20px', background: '#FAFAFB',
          fontFamily: 'Poppins, sans-serif', fontSize: 10, fontWeight: 600,
          color: '#999', letterSpacing: '0.06em', textTransform: 'uppercase',
          borderBottom: '1px solid #EDEDED',
        }}>
          <span>Pipeline</span><span>Model</span><span>Status</span><span>GPU</span><span>Duration</span><span>Triggered</span><span></span>
        </div>
        {runs.map(r => <RunRow key={r.name} {...r} onOpen={() => onOpenPipeline?.(r.name)} />)}
      </div>
    </main>
  );
}

Object.assign(window, { DashboardScreen });
