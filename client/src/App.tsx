import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { GAU8_PARTS, KPIS, type Part } from './lib/data';
import { WingmanPanel } from './components/Wingman';
import { Hero } from './components/Hero';
import type { StageId } from './lib/stages';

function scoreColor(p: Part['priority']) {
  if (p === 'CRITICAL') return 'critical';
  if (p === 'HIGH') return 'high';
  return 'medium';
}

export default function App() {
  const [weights, setWeights] = useState({ acq: 30, lead: 25, micap: 20, demand: 10, risk: 10, readiness: 5 });
  const [wingmanOpen, setWingmanOpen] = useState(false);
  const [heroCollapsed, setHeroCollapsed] = useState(false);
  const [activeStage, setActiveStage] = useState<StageId | null>('prioritize');

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
          <Hero
            collapsed={heroCollapsed}
            onToggle={() => setHeroCollapsed((c) => !c)}
            activeStage={activeStage}
            onStage={setActiveStage}
          />

          <div className="kpi-row">
            <div className="kpi"><div className="value">{KPIS.partsInScope.toLocaleString()}</div><div className="label">Armament Parts (In Scope)</div></div>
            <div className="kpi"><div className="value">{KPIS.amCandidates}</div><div className="label">AM Candidates (Qualified)</div></div>
            <div className="kpi"><div className="value">{KPIS.avgLeadTime} Days</div><div className="label">Avg Lead Time ↑{KPIS.leadTimeDelta}%</div></div>
            <div className="kpi"><div className="value">${KPIS.costAvoidance}M</div><div className="label">Cost Avoidance (Projected)</div></div>
            <div className="kpi"><div className="value">{KPIS.weaponSystems}</div><div className="label">Weapon Systems</div></div>
            <div className="kpi"><div className="value">+{KPIS.readinessImpact}%</div><div className="label">Readiness Impact (Projected)</div></div>
          </div>

          <div style={{ marginBottom: 16, background: '#12203a', padding: 12, borderRadius: 8 }}>
            <strong>Scoring & Weights</strong> (Total = 100%) — Active stage: {activeStage?.toUpperCase()}
            <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13, flexWrap: 'wrap' }}>
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

          {wingmanOpen && <WingmanPanel onClose={() => setWingmanOpen(false)} context="GAU-8/A (A-10) — Armament Supply Chain & AM Candidates" />}
        </div>
      </div>
    </div>
  );
}
