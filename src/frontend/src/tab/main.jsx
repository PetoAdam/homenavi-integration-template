import React from 'react';
import { createRoot } from 'react-dom/client';
import '../shared/hn.css';
import { fetchCounter, incrementCounter, fetchSetup, saveSetup } from '../shared/api';

function isSetupPath() {
  if (typeof window === 'undefined') return false;
  const path = (window.location.pathname || '').toLowerCase();
  return path.endsWith('/ui/setup') || path.includes('/ui/setup/');
}

function SetupApp() {
  const [apiKey, setApiKey] = React.useState('');
  const [endpoint, setEndpoint] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState('');

  React.useEffect(() => {
    let alive = true;
    fetchSetup()
      .then((data) => {
        if (!alive) return;
        const settings = data?.settings || {};
        setApiKey(String(settings.api_key || ''));
        setEndpoint(String(settings.endpoint || ''));
      })
      .catch(() => {
        if (!alive) return;
        setStatus('Could not load existing setup values.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  return (
    <div className="hn-shell">
      <div className="hn-card">
        <div className="hn-row">
          <div>
            <h1 className="hn-title">Integration Setup</h1>
            <div className="hn-subtitle">Configure defaults for this integration.</div>
          </div>
          <span className="hn-pill">setup</span>
        </div>

        <div className="hn-section">
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span className="hn-subtitle">API endpoint</span>
              <input
                className="hn-input"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://api.example.com"
                disabled={loading || saving}
              />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span className="hn-subtitle">API key</span>
              <input
                className="hn-input"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your key"
                disabled={loading || saving}
              />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              className="hn-btn"
              disabled={loading || saving}
              onClick={async () => {
                setSaving(true);
                setStatus('');
                try {
                  await saveSetup({ endpoint: endpoint.trim(), api_key: apiKey.trim() });
                  setStatus('Setup saved.');
                } catch {
                  setStatus('Failed to save setup.');
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? 'Saving…' : 'Save setup'}
            </button>
          </div>
          {status ? <div className="hn-subtitle" style={{ marginTop: 10 }}>{status}</div> : null}
        </div>
      </div>
    </div>
  );
}

function TabApp() {
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    fetchCounter()
      .then((data) => { if (alive) setCount(data?.count ?? 0); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return (
    <div className="hn-shell">
      <div className="hn-card">
        <div className="hn-row">
          <div>
            <h1 className="hn-title">Hello Homenavi</h1>
            <div className="hn-subtitle">Example integration tab using the shared UI style.</div>
          </div>
          <span className="hn-pill">integration</span>
        </div>

        <div className="hn-section">
          <div style={{ fontWeight: 600 }}>Counter demo</div>
          <div className="hn-subtitle">State is stored in memory for now.</div>
          <div className="hn-counter">
            <div className="hn-stat">
              <div className="hn-stat-label">Clicked</div>
              <div className="hn-stat-value">{loading ? '…' : count}</div>
            </div>
            <button
              className="hn-btn"
              onClick={async () => {
                const data = await incrementCounter(1);
                setCount(data?.count ?? count + 1);
              }}
            >
              Increase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

if (isSetupPath()) {
  createRoot(document.getElementById('root')).render(<SetupApp />);
} else {
  createRoot(document.getElementById('root')).render(<TabApp />);
}
