// NotebookScreen — notebook launcher / configurator

function NotebookScreen() {
  const [image, setImage] = React.useState('dkube/pytorch:2.3-cuda12');
  const [gpu, setGpu] = React.useState(1);
  const [region, setRegion] = React.useState('us-east-1');
  const images = [
    { id: 'dkube/pytorch:2.3-cuda12', label: 'PyTorch 2.3 · CUDA 12', tag: 'Default' },
    { id: 'dkube/tensorflow:2.16', label: 'TensorFlow 2.16', tag: '' },
    { id: 'dkube/jax:0.4', label: 'JAX 0.4 · Flax', tag: '' },
    { id: 'dkube/ray:2.10', label: 'Ray 2.10 · Train + Serve', tag: '' },
    { id: 'custom', label: 'Custom image…', tag: '' },
  ];
  return (
    <main style={{ padding: '32px 32px 64px', flex: 1, maxWidth: 1200 }}>
      <div style={{ paddingBottom: 20, borderBottom: '1px solid #EDEDED', marginBottom: 28 }}>
        <div className="label-eyebrow" style={{ marginBottom: 8 }}>Notebooks</div>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>Launch a notebook</h1>
        <p style={{ color: '#777', marginTop: 6, fontSize: 14 }}>JupyterLab on dedicated GPUs. Spins up in ~40 seconds.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
        <div className="card" style={{ padding: 28 }}>
          {/* Name */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 8 }}>Notebook name</label>
            <input className="input" defaultValue="resnet-eval" />
            <div style={{ fontSize: 11, color: '#999', marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>3–40 chars · lowercase, hyphens</div>
          </div>

          {/* Image */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 8 }}>Container image</label>
            <div style={{ display: 'grid', gap: 8 }}>
              {images.map(img => (
                <label key={img.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', border: '1px solid ' + (image === img.id ? '#7030A0' : '#EDEDED'),
                  borderRadius: 8, cursor: 'pointer',
                  background: image === img.id ? '#FAF6FD' : 'white',
                }}>
                  <input type="radio" name="image" checked={image === img.id} onChange={() => setImage(img.id)}
                    style={{ accentColor: '#7030A0' }} />
                  <span style={{ flex: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#444' }}>{img.label}</span>
                  {img.tag && <span className="badge badge-purple">{img.tag}</span>}
                </label>
              ))}
            </div>
          </div>

          {/* GPU */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 8 }}>GPU count · A100 80GB</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {[0, 1, 2, 4, 8].map(n => (
                <button key={n} onClick={() => setGpu(n)}
                  style={{
                    padding: '14px 0', border: '1px solid ' + (gpu === n ? '#7030A0' : '#EDEDED'),
                    background: gpu === n ? '#7030A0' : 'white',
                    color: gpu === n ? 'white' : '#444',
                    fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                    fontSize: 14, borderRadius: 8, cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}>{n === 0 ? 'CPU' : `${n}×`}</button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 8, fontFamily: 'JetBrains Mono, monospace' }}>
              Estimated cost · ${gpu === 0 ? '0.04' : (gpu * 3.20).toFixed(2)} / hr
            </div>
          </div>

          {/* Region */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 8 }}>Region</label>
            <select className="input" value={region} onChange={e => setRegion(e.target.value)}>
              <option>us-east-1 · Virginia</option>
              <option>us-west-2 · Oregon</option>
              <option>eu-west-1 · Dublin</option>
              <option>ap-south-1 · Mumbai</option>
            </select>
          </div>

          {/* Storage */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 8 }}>Persistent storage</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="range" min="50" max="2000" step="50" defaultValue="200"
                style={{ flex: 1, accentColor: '#7030A0' }} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#444', fontWeight: 600, minWidth: 70 }}>200 GB</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid #EDEDED' }}>
            <button className="btn btn-primary">
              <Icon name="play" size={12} /> &nbsp;Launch notebook
            </button>
            <button className="btn btn-ghost btn-sm">Save as preset</button>
          </div>
        </div>

        {/* Side: presets */}
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Recent notebooks</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {[
                { n: 'eda-mistral-rag', t: 'Running · 8 min', s: 'running' },
                { n: 'resnet-debugger', t: 'Stopped · 3 h ago', s: 'queued' },
                { n: 'feature-store-prep', t: 'Stopped · 1 d ago', s: 'queued' },
              ].map(nb => (
                <div key={nb.n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600, color: '#333' }}>{nb.n}</div>
                    <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{nb.t}</div>
                  </div>
                  <StatusBadge status={nb.s}>{nb.s === 'running' ? 'Live' : 'Idle'}</StatusBadge>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 20, background: '#141414', color: 'white' }}>
            <div className="label-eyebrow" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>API equivalent</div>
            <pre style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#E8E5EA', margin: 0, lineHeight: 1.7, overflow: 'auto' }}>
{`$ dkube nb launch \\
  --name resnet-eval \\
  --image ${image.split('/').pop()} \\
  --gpu ${gpu} \\
  --region ${region}`}
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}

Object.assign(window, { NotebookScreen });
