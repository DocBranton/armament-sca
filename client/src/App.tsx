import { useMemo, useState } from 'react';
import { Activity, ArrowRight, BarChart3, Bell, Boxes, ChevronDown, ChevronUp, Crosshair, Download, Factory, Filter, FolderKanban, Gauge, Home, Layers, PackageSearch, RotateCcw, Save, Search, Settings, Shield, SlidersHorizontal, Sparkles, Target, Timer, Wrench } from 'lucide-react';
import { GAU8_PARTS, KPIS, type Part } from './lib/data';
import { WingmanPanel } from './components/Wingman';
import { Hero } from './components/Hero';
import { RequestAssistance } from './components/RequestAssistance';
import { STAGES, type StageId } from './lib/stages';

type WeightKey = 'acq' | 'lead' | 'micap' | 'demand' | 'risk' | 'readiness';
type Weights = Record<WeightKey, number>;
const DEFAULT_WEIGHTS: Weights = { acq:30, lead:25, micap:20, demand:10, risk:10, readiness:5 };
const FACTORS: {key:WeightKey; title:string; hint:string}[] = [
  {key:'acq',title:'Acquisition Cost',hint:'≥ $1,000'}, {key:'lead',title:'Lead Time',hint:'≥ 360 days'},
  {key:'micap',title:'MICAPs',hint:'≥ 5'}, {key:'demand',title:'Demand',hint:'Lower is higher'},
  {key:'risk',title:'Supply Risk',hint:'DMSMS / Obsol.'}, {key:'readiness',title:'Readiness Impact',hint:'Ao / FMC / NMCS'}
];
const SYSTEMS = [{id:'gau8',name:'GAU-8/A (A-10)'},{id:'m61a1',name:'M61A1 Vulcan (20mm)'},{id:'smallarms',name:'Small Arms & Light Weapons'}];
const NAV = [
  {group:'MISSION',items:[['Home',Home],['Armament',Crosshair],['Portfolio',Layers],['AM Candidates',Boxes],['Projects',FolderKanban],['Analysis',BarChart3],['Reports',Activity]]},
  {group:'CAPABILITIES',items:[['Supply Chain',PackageSearch],['Advanced Manufacturing',Factory],['Engineering',Wrench],['Sourcing',Target],['Readiness',Gauge]]},
  {group:'PERSONAL',items:[['My Work',FolderKanban],['Saved Views',Save],['SI Wingman',Sparkles],['Settings',Settings]]}
] as const;
const RISK_VALUE:Record<Part['supplyRisk'],number> = {Obsolescence:1,High:.8,Medium:.5,Low:.1};
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const norm=(v:number,min:number,max:number)=>clamp((v-min)/(max-min));
function weightedScore(p:Part,w:Weights){
  const base = [norm(p.acqCost,800,5000),norm(p.leadTime,100,440),norm(p.micaps,0,12),1-norm(p.demand,0,90),RISK_VALUE[p.supplyRisk],norm(Math.abs(p.readinessImpact),0,3.5)];
  const factors=[w.acq,w.lead,w.micap,w.demand,w.risk,w.readiness];
  const adjusted=base.reduce((s,v,i)=>s+v*factors[i],0)/Math.max(1,factors.reduce((s,v)=>s+v,0));
  // Preserve the concept's default ordering/scores while enabling meaningful weight-driven reranking.
  const defaultValue=base.reduce((s,v,i)=>s+v*[30,25,20,10,10,5][i],0)/100;
  return clamp(p.score + (adjusted-defaultValue)*.5);
}
function downloadCSV(rows:(Part & {score:number})[]){
  const headers=['Rank','Score','Priority','NSN','Part','Acquisition Cost','Lead Time','MICAPs','Demand','Supply Risk','Readiness Impact','AM Assessment'];
  const csv=[headers,...rows.map((p,i)=>[i+1,p.score.toFixed(3),p.priority,p.nsn,p.name,p.acqCost,p.leadTime,p.micaps,p.demand,p.supplyRisk,p.readinessImpact,p.assessment])].map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='armament-am-candidates.csv';a.click();URL.revokeObjectURL(a.href);
}
export default function App(){
  const [weights,setWeights]=useState<Weights>(DEFAULT_WEIGHTS);
  const [activeTab,setActiveTab]=useState<'weights'|'filters'>('weights');
  const [method,setMethod]=useState<'weighted'|'threshold'>('weighted');
  const [controlsOpen,setControlsOpen]=useState(true);
  const [heroCollapsed,setHeroCollapsed]=useState(false);
  const [wingmanOpen,setWingmanOpen]=useState(false);
  const [requestOpen,setRequestOpen]=useState(false);
  const [activeStage,setActiveStage]=useState<StageId>('prioritize');
  const [system,setSystem]=useState('gau8');
  const [preset,setPreset]=useState('AM Candidates (Default)');
  const [search,setSearch]=useState('');
  const [minCost,setMinCost]=useState(0);
  const [minMicaps,setMinMicaps]=useState(0);
  const [navActive,setNavActive]=useState('Armament');
  const [sortKey,setSortKey]=useState<'score'|'acqCost'|'leadTime'|'micaps'>('score');
  const [sortDesc,setSortDesc]=useState(true);
  const total=Object.values(weights).reduce((a,b)=>a+b,0);
  const results=useMemo(()=>{
    const filtered=GAU8_PARTS.filter(p=>p.acqCost>=minCost&&p.micaps>=minMicaps&&(!search||[p.name,p.nsn,p.assessment].some(x=>x.toLowerCase().includes(search.toLowerCase()))));
    return filtered.map(p=>({...p,score:method==='weighted'?weightedScore(p,weights):p.score})).sort((a,b)=>((sortDesc?-1:1)*(a[sortKey]-b[sortKey])));
  },[weights,method,minCost,minMicaps,search,sortKey,sortDesc]);
  const reset=()=>{setWeights(DEFAULT_WEIGHTS);setMethod('weighted');setMinCost(0);setMinMicaps(0);setSearch('');setSortKey('score');setSortDesc(true);setPreset('AM Candidates (Default)');};
  const sort=(key:typeof sortKey)=>{setSortDesc(sortKey===key?!sortDesc:true);setSortKey(key);};
  return <div className="app">
    <aside className="sidebar">
      <div className="af-logo"><img src="/brand/usaf-official.webp" alt="U.S. Air Force" onError={e=>{e.currentTarget.style.display='none'}}/></div>
      <div className="nav-groups">{NAV.map(g=><div key={g.group} className="nav-group"><div className="nav-label">{g.group}</div>{g.items.map(([label,Icon])=><button key={label} className={'nav-item '+(navActive===label?'active':'')} onClick={()=>{if(label==='SI Wingman')setWingmanOpen(true);else if(label==='Saved Views'){setControlsOpen(true);setPreset('AM Candidates (Default)')}else setNavActive(label)}}><Icon size={14}/><span>{label}</span></button>)}</div>)}</div>
      <div className="rso-brand"><img src="/brand/rso-official.webp" alt="Rapid Sustainment Office (RSO)" onError={e => { e.currentTarget.style.display = "none"; }} /></div>
    </aside>
    <div className="main">
      <header className="topbar">
        <div className="brand-title"><strong>GLOBAL MISSION WORKBENCH</strong><small>From sustainment challenges to fielded capabilities</small></div>
        <span className="version">v0.26.09.30.17</span>
        <div className="search-wrap"><Search size={14}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search parts, NSN/NIIN, projects, or ask your SI Wingman..."/></div>
        <button className="wingman-btn" onClick={()=>setWingmanOpen(true)}><Sparkles size={14}/> Ask your Wingman</button>
        <div className="user-greeting"><strong>Welcome back!</strong><span>Gen. John Duselis<small>AFLCMC / EBUW</small></span></div><span className="avatar">JD</span><Bell size={18} className="bell"/>
      </header>
      <main className="content">
        <div className="mission-banner">
          <div className="organization"><img className="division-emblem" src="/brand/weapons-superiority-division.webp" alt="Weapons Superiority Division emblem"/><div><strong>AFLCMC / EBUW</strong><span>Weapons Superiority Division</span><small>Aircraft Guns, Small Arms, and Light Weapons</small></div></div>
          <div className="mission-heading"><h1>Armament Supply Chain &amp; AM Candidate Analysis</h1><p>Identify, prioritize, and assess armament parts for Advanced Manufacturing (AM) solutions</p></div>
        </div>
        <div className="kpi-row">
          {([
            {Icon:Settings,value:KPIS.partsInScope.toLocaleString(),label:'Armament Parts (In Scope)',delta:''},
            {Icon:Layers,value:String(KPIS.amCandidates),label:'AM Candidates (Qualified)',delta:''},
            {Icon:Timer,value:KPIS.avgLeadTime+' Days',label:'Avg Lead Time',delta:'↑ +'+KPIS.leadTimeDelta+'%'},
            {Icon:Boxes,value:'$'+KPIS.costAvoidance+'M',label:'Cost Avoidance (Projected)',delta:''},
            {Icon:Crosshair,value:String(KPIS.weaponSystems),label:'Weapon Systems',delta:''},
            {Icon:BarChart3,value:'+'+KPIS.readinessImpact+'%',label:'Readiness Impact (Projected)',delta:''}
          ]).map(({Icon,value,label,delta},i)=><div className="kpi" key={label}><Icon size={25}/><div className="kpi-copy"><strong className={i===5?'positive':''}>{value}</strong><span>{label} {delta&&<em>{delta}</em>}</span></div></div>)}
        </div>
        <Hero collapsed={heroCollapsed} onToggle={()=>setHeroCollapsed(c=>!c)} activeStage={activeStage} onStage={setActiveStage} onRequest={()=>setRequestOpen(true)}/>
        <div className="workflow" aria-label="Armament AM workflow">{STAGES.map((s,i)=><button key={s.id} className={'workflow-step '+(s.id===activeStage?'selected':'')} onClick={()=>setActiveStage(s.id)}><span className="workflow-icon">{i===0?<PackageSearch/>:i===1?<Layers/>:i===2?<Crosshair/>:i===3?<Shield/>:i===4?<Factory/>:<Target/>}</span><span><strong>{s.num} {s.title}</strong><small>{s.caption}</small></span></button>)}</div>
        <section className="analysis-panel">
          <div className="panel-heading"><span><SlidersHorizontal size={20}/><b>Analysis Controls</b><small>Adjust weights, filter the population, and update the AM candidate results</small></span><button className="icon-button" onClick={()=>setControlsOpen(v=>!v)} aria-label={controlsOpen?'Collapse controls':'Expand controls'}>{controlsOpen?<ChevronUp/>:<ChevronDown/>}</button></div>
          {controlsOpen&&<>
            <div className="control-toolbar"><div className="tabs"><button className={activeTab==='weights'?'selected':''} onClick={()=>setActiveTab('weights')}><BarChart3 size={14}/> Scoring &amp; Weights</button><button className={activeTab==='filters'?'selected':''} onClick={()=>setActiveTab('filters')}><Filter size={14}/> Filters</button></div><label className="preset">Analysis Preset: <select value={preset} onChange={e=>{setPreset(e.target.value);if(e.target.value==='AM Candidates (Default)')setWeights(DEFAULT_WEIGHTS);if(e.target.value==='Lead-Time Focus')setWeights({acq:15,lead:45,micap:20,demand:5,risk:10,readiness:5});if(e.target.value==='MICAP Focus')setWeights({acq:15,lead:15,micap:45,demand:5,risk:10,readiness:10});}}><option>AM Candidates (Default)</option><option>Lead-Time Focus</option><option>MICAP Focus</option></select></label><div className="toolbar-actions"><button onClick={()=>{const name=window.prompt('Save view as:',preset);if(name){setPreset(name);try{localStorage.setItem('armament-sca-view',JSON.stringify({name,weights,system,minCost,minMicaps}))}catch{}}}}><Save size={14}/> Save View</button><button onClick={reset}><RotateCcw size={14}/> Reset</button></div></div>
            {activeTab==='weights'?<div className="weights-layout"><div className="system-card"><strong><Crosshair size={17}/> System (Weapon System)</strong><select value={system} onChange={e=>setSystem(e.target.value)}>{SYSTEMS.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div><div className="method-card"><strong>Scoring Method</strong><label><input type="radio" checked={method==='weighted'} onChange={()=>setMethod('weighted')}/> Weighted Score <small>(Recommended)</small></label><label><input type="radio" checked={method==='threshold'} onChange={()=>setMethod('threshold')}/> Threshold / Rules</label></div><div className="factors"><div className="factor-heading">Weight Factors (Total = {total}%) {total!==100&&<em>Normalize to 100% for comparison</em>}</div><div className="factor-grid">{FACTORS.map(f=><label className="factor-card" key={f.key}><span><strong>{f.title}</strong><b>{weights[f.key]}%</b></span><small>{f.hint}</small><input type="range" min="0" max="100" value={weights[f.key]} onChange={e=>setWeights(w=>({...w,[f.key]:Number(e.target.value)}))}/></label>)}</div></div></div>:<div className="filters-layout"><label>Minimum Acquisition Cost <input type="number" min={0} step={100} value={minCost} onChange={e=>setMinCost(Number(e.target.value)||0)}/></label><label>Minimum MICAPs <input type="number" min={0} value={minMicaps} onChange={e=>setMinMicaps(Number(e.target.value)||0)}/></label><span>Filters update the candidate table immediately.</span></div>}
          </>}
        </section>
        <section className="results-panel" id="candidate-results">
          <div className="results-heading"><div><Layers size={21}/><b>AM Candidate Results — {SYSTEMS.find(x=>x.id===system)?.name}</b><small>({system==='gau8'?'1,842':'Not connected'} parts analyzed | Displaying top {Math.min(25,results.length)} by {sortKey==='score'?'Weighted Score':sortKey})</small></div><div><button onClick={()=>downloadCSV(results)}><Download size={15}/> Export</button><button aria-label="Table settings" title="Table settings"><Settings size={16}/></button></div></div>
          {system!=='gau8'&&<div className="data-note">Demonstration dataset: GAU-8/A sample records are shown until {SYSTEMS.find(x=>x.id===system)?.name} data is connected.</div>}
          <div className="table-wrap"><table><thead><tr><th>#</th><th><button onClick={()=>sort('score')}>Weighted<br/>Score ↕</button></th><th>Priority</th><th>NSN / NIIN</th><th>Part Name (Component)</th><th><button onClick={()=>sort('acqCost')}>Acq. Cost<br/>(Each) ↕</button></th><th><button onClick={()=>sort('leadTime')}>Lead Time<br/>(Days) ↕</button></th><th><button onClick={()=>sort('micaps')}>MICAPs<br/>(12 mo) ↕</button></th><th>Demand<br/>(Annual)</th><th>Supply Risk<br/>(DMSMS)</th><th>Readiness Impact<br/>(Ao / FMC)</th><th>AM Candidate Assessment</th></tr></thead><tbody>{results.map((p,i)=><tr key={p.nsn}><td>{i+1}</td><td className="score">{p.score.toFixed(3)}</td><td><span className={'priority pill '+p.priority.toLowerCase()}>{p.priority}</span></td><td>{p.nsn}</td><td className="part-name">{p.name}</td><td>${p.acqCost.toLocaleString()}</td><td>{p.leadTime}</td><td>{p.micaps}</td><td>{p.demand}</td><td><span className={'risk pill '+p.supplyRisk.toLowerCase()}>{p.supplyRisk}</span></td><td className="impact">{p.readinessImpact.toFixed(1)}%</td><td><span className={'assessment pill '+(p.assessment.startsWith('High')?'good':'mid')}>{p.assessment}</span></td></tr>)}</tbody></table></div>
        </section>
      </main>
    </div>
    {requestOpen&&<RequestAssistance onClose={()=>setRequestOpen(false)}/>}
    {wingmanOpen&&<WingmanPanel onClose={()=>setWingmanOpen(false)} context={SYSTEMS.find(s=>s.id===system)?.name+' — Armament Supply Chain & AM Candidate Analysis'}/>}
  </div>
}
