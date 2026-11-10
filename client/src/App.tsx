import { useState } from 'react';
import { Sparkles, Search } from 'lucide-react';
import { GAU8_PARTS, KPIS, type Part } from './lib/data';

function scoreColor(p: Part['priority']) {
  if (p === 'CRITICAL') return 'critical';
  if (p === 'HIGH') return 'high';
  return 'medium';
}

export default function App() {
  const [weights, setWeights] = useState({ acq: 30, lead: 25, micap: 20, demand: 10, risk: 10, readiness: 5 });
  const [wingmanOpen, setWingmanOpen] = useState(false);

  // Simple re-score demo: higher weight on lead time boosts high-lead-time parts
  const scored = [...GAU8_PARTS].map(p => ({
    ...p,
    score: Math.min(0.99, p.score * (1 + (weights.lead - 25) * 0.002)),
  })).sort((a, b) => b.score - a.score);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">U.S. AIR FORCE</div>
        <nav>
          <a href="#">Mission</a>
          <a href="#" className="active">Armament</a>
          <a href="#">Portfolio</a>
          <a href="#">AM Candidates</a>
          <a href="#">Projects</a>
          <a href="#">Analysis</a>
          <a href="#">Reports</a>
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>GLOBAL MISSION WORKBENCH · Armament Supply Chain & AM Candidate Analysis</div>
          <input className="search" placeholder="Search parts, NSN/NIIN, projects, or ask your SI Wingman..." />
          <button className="wingman-btn" onClick={() => setWingmanOpen(true)}>
            <Sparkles size={16} /> Ask SI Wingman
          </button>
          <div>Welcome back! Gen. John Duselis · AFLCMC / EBUW</div>
        </header>

        <div className="content">
          <div className="kpi-row">
            <div className="kpi"><div className="value">{KPIS.partsInScope.toLocaleString()}</div><div className="label">Armament Parts (In Scope)</div></div>
            <div className="kpi"><div className="value">{KPIS.amCandidates}</div><div className="label">AM Candidates (Qualified)</div></div>
            <div className="kpi"><div className="value">{KPIS.avgLeadTime} Days</div><div className="label">Avg Lead Time ↑{KPIS.leadTimeDelta}%</div></div>
            <div className="kpi"><div className="value">${KPIS.costAvoidance}M</div><div className="label">Cost Avoidance (Projected)</div></div>
            <div className="kpi"><div className="value">{KPIS.weaponSystems}</div><div className="label">Weapon Systems</div></div>
            <div className="kpi"><div className="value">+{KPIS.readinessImpact}%</div><div className="label">Readiness Impact (Projected)</div></div>
          </div>

          <div style={{ marginBottom: 16, background: '#12203a', padding: 12, borderRadius: 8 }}>
            <strong>Scoring & Weights</strong> (Total = 100%)
            <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13 }}>
              {Object.entries(weights).map(([k, v]) => (
                <label key={k}>
                  {k}: {v}%
                  <input type="range" min={0} max={50} value={v} onChange={e => setWeights(w => ({ ...w, [k]: +e.target.value }))} />
                </label>
              ))}
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Weighted Score</th><th>Priority</th><th>NSN / NIIN</th><th>Part Name</th>
                  <th>Acq. Cost</th><th>Lead Time</th><th>MICAPs</th><th>Demand</th><th>Supply Risk</th><th>Readiness Impact</th><th>AM Assessment</th>
                </tr>
              </thead>
              <tbody>
                {scored.map((p, i) => (
                  <tr key={p.nsn}>
                    <td>{i + 1}</td>
                    <td>{p.score.toFixed(3)}</td>
                    <td><span className={`badge ${scoreColor(p.priority)}`}>{p.priority}</span></td>
                    <td>{p.nsn}</td>
                    <td>{p.name}</td>
                    <td>${p.acqCost.toLocaleString()}</td>
                    <td>{p.leadTime}</td>
                    <td>{p.micaps}</td>
                    <td>{p.demand}</td>
                    <td>{p.supplyRisk}</td>
                    <td>{p.readinessImpact}%</td>
                    <td>{p.assessment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {wingmanOpen && (
            <div style={{ position: 'fixed', right: 0, top: 56, bottom: 0, width: 380, background: '#0d1b2e', borderLeft: '1px solid #1a2a44', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>SI Wingman</strong>
                <button onClick={() => setWingmanOpen(false)}>Close</button>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>Domain-aware assistant (stub). Will explain scores, recommend AM paths, and query supply risk using Model Serving — same pattern as Idea Forge II.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
