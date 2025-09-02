import React from 'react';

function SafeJSON({ obj }) {
  return <pre className="pre">{JSON.stringify(obj, null, 2)}</pre>;
}

export default function ReportView({ report }) {
  if(!report) return null;

  // backend's saved report may wrap fields; adapt safely
  const final = report.finalVerdict || report.finalVerdict;
  const extraction = report.extraction || report.extractions || {};
  const checks = report.checks || [];

  return (
    <div className="report">
      <div className="section card">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <div style={{fontWeight:700}}>{report.scraped?.title || 'Product'}</div>
            <div className="small-muted">{report.url}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontWeight:700}}>Verdict</div>
            <div style={{fontSize:18}}>{final}</div>
          </div>
        </div>
      </div>

      <div className="section card">
        <h4 style={{margin:'0 0 8px 0'}}>Extractions</h4>
        <SafeJSON obj={extraction} />
      </div>

      <div className="section card">
        <h4 style={{margin:'0 0 8px 0'}}>Checks</h4>
        {checks.length===0 && <div className="small-muted">No rule checks available for this report.</div>}
        <div style={{display:'flex', flexDirection:'column', gap:8, marginTop:8}}>
          {checks.map((c,i)=>(
            <div key={i} className={`check-item ${c.compliant ? 'pass' : 'fail'}`}>
              <div>
                <div><span className="rule-code">{c.ruleCode}</span> {c.ruleDescription}</div>
                <div className="small-muted">{c.evidence}</div>
              </div>
              <div style={{fontWeight:700, color: c.compliant ? '#065f46' : '#7f1d1d'}}>{c.compliant ? 'PASS' : 'FAIL'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section card">
        <h4 style={{margin:'0 0 8px 0'}}>Raw Report</h4>
        <SafeJSON obj={report} />
      </div>
    </div>
  );
}
