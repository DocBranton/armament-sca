import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import type { StageId } from '../lib/stages';
interface HeroProps {collapsed:boolean;onToggle:()=>void;activeStage:StageId|null;onStage:(id:StageId)=>void;onRequest:()=>void;}
const GALLERY=[{name:'GAU-8/A',sub:'30mm',src:'/brand/gau8.webp'},{name:'M61A1 Vulcan',sub:'20mm',src:'/brand/m61a1.webp'},{name:'Small Arms',sub:'& Light Weapons',src:'/brand/smallarms.webp'}];
export function Hero({collapsed,onToggle,onRequest}:HeroProps){
 return <section className={'hero'+(collapsed?' collapsed':'')} aria-label="Armament Sustainment & Advanced Manufacturing">
  {!collapsed&&<><div className="hero-story"><h2>ARMAMENT SUSTAINMENT<br/>&amp; ADVANCED MANUFACTURING</h2><p>Supply chain intelligence to identify, prioritize, and execute AM solutions for aircraft guns, small arms, and light weapons.</p><button className="hero-cta" onClick={onRequest}>Request an Analysis of Mfg Alternatives <ArrowRight size={15}/></button></div><div className="weapon-gallery">{GALLERY.map(g=><div key={g.name} className="weapon-tile"><img src={g.src} alt={g.name} onError={e=>{e.currentTarget.style.opacity='0'}}/><div>{g.name}<small>{g.sub}</small></div></div>)}</div></>}
  <button className="hero-toggle" type="button" onClick={onToggle} aria-expanded={!collapsed}>{collapsed?<ChevronDown size={13}/>:<ChevronUp size={13}/>} {collapsed?'Expand hero':'Collapse hero'}</button>
 </section>;
}
