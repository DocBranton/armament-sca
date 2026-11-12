import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Search, X } from 'lucide-react';
import {
  DELIVERABLES, REQUEST_CHOICES, demoAssistanceAdapter,
  type AssistanceAdapter, type DeliverableType, type PartMatch, type PartSearch, type RequestType,
} from '../lib/request-assistance';

/**
 * Reusable UMW-style request chooser and part finder.
 * App-specific data is passed through an adapter; the visual appearance follows
 * Armament SCA's current accepted UI rather than moving UMW's whole hero.
 */
export function RequestAssistance({
  onClose, adapter = demoAssistanceAdapter, initialType = 'alternatives',
}: {
  onClose: () => void;
  adapter?: AssistanceAdapter;
  initialType?: RequestType;
}) {
  const [requestType, setRequestType] = useState<RequestType>(initialType);
  const [search, setSearch] = useState<PartSearch>({ aircraft: 'A-10 Thunderbolt II', nsn: '', partNumber: '', description: '' });
  const [matches, setMatches] = useState<PartMatch[] | null>(null);
  const [selected, setSelected] = useState<PartMatch | null>(null);
  const [deliverable, setDeliverable] = useState<DeliverableType | null>(null);
  const [details, setDetails] = useState('');
  const [lookupStatus, setLookupStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButton.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const updateSearch = (field: keyof PartSearch, value: string) => {
    setSearch(prev => ({ ...prev, [field]: value }));
    setMatches(null);
    setSelected(null);
    setLookupStatus('');
    setPreview(false);
  };
  const chooseType = (type: RequestType) => {
    setRequestType(type);
    setMatches(null);
    setSelected(null);
    setDeliverable(null);
    setPreview(false);
    setLookupStatus('');
  };
  const lookup = async () => {
    setPreview(false);
    setSelected(null);
    if (!search.aircraft && !search.nsn.trim() && !search.partNumber.trim() && !search.description.trim()) {
      setLookupStatus('Select an aircraft or enter an NSN / NIIN, part number or description.');
      setMatches(null);
      return;
    }
    setBusy(true);
    try {
      const hits = await adapter.search(search);
      setMatches(hits);
      setLookupStatus(hits.length ? 'Demonstration records only — verify part identity before submitting an official request.' : 'No match in the demonstration dataset. No authoritative parts search is connected.');
    } catch {
      setMatches(null);
      setLookupStatus('Part lookup failed. No official request has been submitted.');
    } finally {
      setBusy(false);
    }
  };
  const canPrepare = requestType === 'new' || !!selected;

  return <div className="request-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="request-dialog" role="dialog" aria-modal="true" aria-labelledby="request-dialog-title">
      <div className="request-columns">
        <section className="request-section">
          <div className="request-title"><h2 id="request-dialog-title">REQUEST ASSISTANCE</h2><button type="button" aria-label="Close request" onClick={onClose} ref={closeButton}><X size={17}/></button></div>
          <p>How can I help you?</p>
          <div className="request-types">
            {REQUEST_CHOICES.map(choice =>
              <button type="button" key={choice.id} className={requestType === choice.id ? 'chosen' : ''} onClick={() => chooseType(choice.id)} aria-pressed={requestType === choice.id}>
                {choice.label}
              </button>
            )}
          </div>
          {requestType === 'new' && <p className="request-status">New design: a part number is not required to prepare a draft.</p>}
        </section>
        {requestType !== 'new' && <section className="request-section request-find">
          <h2>FIND THE PART</h2>
          <label>AIRCRAFT<select value={search.aircraft} onChange={e => updateSearch('aircraft', e.target.value)}>
            <option value="">Choose an aircraft...</option>
            <option>A-10 Thunderbolt II</option><option>F-16 Fighting Falcon</option><option>F-15 Eagle</option><option>Other / Not Listed</option>
          </select></label>
          <label>NSN / NIIN<input value={search.nsn} onChange={e => updateSearch('nsn', e.target.value)} placeholder="1010-01-234-5678" /></label>
          <label>PART NO.<input value={search.partNumber} onChange={e => updateSearch('partNumber', e.target.value)} placeholder="Enter known part number"/></label>
          <label>DESCRIPTION<input value={search.description} onChange={e => updateSearch('description', e.target.value)} placeholder="Search component description"/></label>
          <button className="request-lookup" type="button" onClick={lookup} disabled={busy}><Search size={15}/> {busy ? 'Looking up…' : 'Look up'}</button>
          {lookupStatus && <p className="request-status" role="status">{lookupStatus}</p>}
          {matches && matches.length > 0 && <div className="request-matches">
            <h3>MATCHES</h3>
            {matches.map(part => <button key={part.id} className={selected?.id === part.id ? 'picked' : ''} onClick={() => { setSelected(part); setPreview(false); }} type="button">
              <b>{part.name}</b><span>{part.nsn} · {part.partNumber ?? 'Part no. unavailable'}</span>
            </button>)}
          </div>}
        </section>}
      </div>

      {(selected || requestType === 'new') && <section className="request-section request-deliverables">
        {selected && <div className="request-part-summary"><h3>THE PART</h3><strong>{selected.name}</strong><span>NSN: {selected.nsn} · {selected.aircraft}</span><small>Demonstration data — not verified from an authoritative supply source</small></div>}
        <h3>THE PACKAGE / DELIVERABLES</h3>
        <div className="request-deliverable-grid">{DELIVERABLES.map(option =>
          <button type="button" key={option.id} className={deliverable === option.id ? 'picked' : ''} aria-pressed={deliverable === option.id} onClick={() => { setDeliverable(option.id); setPreview(false); }}>
            <b>{option.label}</b>{option.description && <small>{option.description}</small>}
          </button>)}</div>
        {deliverable === 'custom' && <label className="request-details">CUSTOM DELIVERABLES<textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="Describe the requested deliverables" rows={3}/></label>}
      </section>}
      <div className="request-footer">
        <button className="request-submit" type="button" disabled={!canPrepare || !deliverable} onClick={() => setPreview(true)}><ArrowRight size={15}/> Prepare Draft</button>
        {preview && <div className="request-prepared" role="status"><CheckCircle2 size={16}/> Draft prepared locally: <strong>{REQUEST_CHOICES.find(item => item.id === requestType)?.label}</strong> · {DELIVERABLES.find(item => item.id === deliverable)?.label}. No request was submitted; UMW workflow integration remains pending.</div>}
        {!canPrepare && <span className="request-status">Select a matching part before preparing the request.</span>}
      </div>
    </div>
  </div>;
}
