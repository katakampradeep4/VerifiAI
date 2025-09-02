import React, { useEffect, useState } from 'react';
import { getRules, addRule } from '../api';

export default function AdminRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ code:'', description:'', pattern:'', keywords:'', required:true, severity:'HIGH' });
  const [msg, setMsg] = useState('');

  async function loadRules(){
    setLoading(true);
    try {
      const r = await getRules();
      setRules(r);
    } catch (err) {
      console.error(err);
      setMsg('Failed to load rules');
    } finally { setLoading(false); }
  }

  useEffect(()=> { loadRules(); }, []);

  async function handleSubmit(e){
    e.preventDefault();
    setMsg('');
    try {
      const payload = {
        code: form.code,
        description: form.description,
        pattern: form.pattern || undefined,
        keywords: form.keywords ? form.keywords.split(',').map(s=>s.trim()).filter(Boolean) : undefined,
        required: !!form.required,
        severity: form.severity
      };
      const added = await addRule(payload);
      setMsg('Rule added');
      setForm({ code:'', description:'', pattern:'', keywords:'', required:true, severity:'HIGH' });
      loadRules();
    } catch (err) {
      console.error(err);
      setMsg('Failed to add rule: ' + (err.response?.data?.error || err.message));
    }
  }

  return (
    <div className="card admin-section">
      <h3>Admin — Rules</h3>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Code (e.g. R01)</label>
          <input value={form.code} onChange={e=>setForm({...form, code:e.target.value})} required />
        </div>

        <div className="form-row">
          <label>Description</label>
          <input value={form.description} onChange={e=>setForm({...form, description:e.target.value})} required />
        </div>

        <div className="form-row">
          <label>Pattern (optional, javascript regex string)</label>
          <input value={form.pattern} onChange={e=>setForm({...form, pattern:e.target.value})} />
        </div>

        <div className="form-row">
          <label>Keywords (optional, comma separated)</label>
          <input value={form.keywords} onChange={e=>setForm({...form, keywords:e.target.value})} />
        </div>

        <div style={{display:'flex', gap:8, marginBottom:8}}>
          <div style={{flex:1}}>
            <label>Required</label>
            <select value={form.required} onChange={e=>setForm({...form, required: e.target.value === 'true' })}>
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
          <div style={{flex:1}}>
            <label>Severity</label>
            <select value={form.severity} onChange={e=>setForm({...form, severity: e.target.value})}>
              <option>HIGH</option>
              <option>MEDIUM</option>
              <option>LOW</option>
            </select>
          </div>
        </div>

        <button className="btn" type="submit">Add Rule</button>
      </form>

      <div style={{marginTop:12}}>
        <h4 style={{marginBottom:8}}>Existing rules</h4>
        {loading && <div className="small-muted">Loading rules...</div>}
        {!loading && rules.length===0 && <div className="small-muted">No rules yet</div>}
        <ul style={{margin:0, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:6}}>
          {rules.map(r=>(
            <li key={r._id} className="small card" style={{padding:8}}>
              <div style={{fontWeight:700}}>{r.code} — {r.description}</div>
              <div className="small-muted">{r.pattern ? `pattern: ${r.pattern}` : r.keywords?.length ? `keywords: ${r.keywords.join(', ')}` : ''}</div>
            </li>
          ))}
        </ul>
      </div>

      {msg && <div style={{marginTop:10}} className="small-muted">{msg}</div>}
    </div>
  );
}
