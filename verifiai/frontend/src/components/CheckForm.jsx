import React, { useState } from 'react';
import { checkUrl } from '../api';

export default function CheckForm({ onResult }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCheck() {
    if(!url.trim()) { alert('Please paste a product URL'); return; }
    setLoading(true);
    try {
      const data = await checkUrl(url.trim());
      // backend returns { report: saved } or { report, fallback:true } or rawModel etc
      const report = data.report || data;
      onResult(report, data.rawModel || null);
    } catch (err) {
      console.error(err);
      alert('Error checking URL: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="input-row">
        <input className="input" placeholder="Paste Amazon/Flipkart product URL" value={url} onChange={e=>setUrl(e.target.value)} />
        <button className="btn" onClick={handleCheck} disabled={loading}>
          {loading ? 'Checking...' : 'Check'}
        </button>
      </div>
      <div className="small">Tip: use product pages where static HTML contains title/description. If scraping fails, backend may return UNCERTAIN.</div>
    </div>
  );
}
