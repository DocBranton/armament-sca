import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Search, X } from 'lucide-react';
import { GAU8_PARTS } from '../lib/data';

const REQUEST_TYPES = [
  'Redesign an existing part',
  'Design a new part',
  'Digitally transform legacy technical data',
  'Analyze manufacturing and repair alternatives',
  'Request a production run of an existing solution'
] as const;

export function RequestAssistance({ onClose }: { onClose: () => void }) {
  const [requestType, setRequestType] = useState<string>('Analyze manufacturing and repair alternatives');
  const [aircraft, setAircraft] = useState('A-10 Thunderbolt II');
  const [nsn, setNsn] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [description, setDescription] = useState('');
  const [lookupStatus, setLookupStatus] = useState('');
  const [ready, setReady] = useState(false);

  const found = useMemo(() => GAU8_PARTS.find(p =>
    (nsn.trim() !== '' && p.nsn.toLowerCase() === nsn.trim().toLowerCase()) ||
    (description.trim() !== '' && p.name.toLowerCase() === description.trim().toLowerCase())
  ), [nsn, description]);

  const lookup = () => {
    setReady(false);
    if (!nsn.trim() && !partNumber.trim() && !description.trim()) {
      setLookupStatus('Enter an NSN / NIIN, part number, or description to look up.');
      return;
    }
    if (found) {
      setNsn(found.nsn);
      setDescription(found.name);
      setLookupStatus('Matched a demonstration GAU-8/A record. Verify part identity before requesting assistance.');
    } else {
      setLookupStatus('No matching record in the demonstration dataset. The lookup is not connected to an authoritative parts service.');
    }
  };
  return <div className="request-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="request-dialog" role="dialog" aria-modal="true" aria-labelledby="request-dialog-title">
      <div className="request-columns">
        <section className="request-section">
          <div className="request-title"><h2 id="request-dialog-title">REQUEST ASSISTANCE</h2><button type="button" aria-label="Close request" onClick={onClose}><X size={17}/></button></div>
          <p>How can I help you?</p>
          <div className="request-types">{REQUEST_TYPES.map(type => <button type="button" key={type} className={requestType === type ? 'chosen' : ''} onClick={()=>{setRequestType(type);setReady(false);}} aria-pressed={requestType===type}>{type}</button>)}</div>
        </section>
        <section className="request-section request-find">
          <h2>FIND THE PART</h2>
          <label>AIRCRAFT<select value={aircraft} onChange={e=>setAircraft(e.target.value)}><option value="">Choose an aircraft...</option><option>A-10 Thunderbolt II</option><option>F-16 Fighting Falcon</option><option>F-15 Eagle</option><option>Other / Not Listed</option></select></label>
          <label>NSN / NIIN<input value={nsn} onChange={e=>{setNsn(e.target.value);setLookupStatus('');setReady(false);}} placeholder="1560-01-000-2307" /></label>
          <label>PART NO.<input value={partNumber} onChange={e=>{setPartNumber(e.target.value);setLookupStatus('');setReady(false);}} placeholder="B39-22307"/></label>
          <label>DESCRIPTION<input value={description} onChange={e=>{setDescription(e.target.value);setLookupStatus('');setReady(false);}} placeholder="Door hinge"/></label>
          <button className="request-lookup" type="button" onClick={lookup}><Search size={15}/> Look up</button>
          {lookupStatus&&<p className="request-status" role="status">{lookupStatus}</p>}
        </section>
      </div>
      <div className="request-footer">
        <button className="request-submit" type="button" onClick={()=>setReady(true)}><ArrowRight size={15}/> Prepare Request</button>
        {ready&&<div className="request-prepared" role="status"><CheckCircle2 size={16}/> Request details prepared for <strong>{requestType}</strong>{aircraft ? ' — '+aircraft : ''}. No request has been submitted; a backend workflow is not yet connected.</div>}
      </div>
    </div>
  </div>;
}
