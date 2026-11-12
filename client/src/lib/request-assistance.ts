/**
 * UMW-aligned Request Assistance domain contract.
 * Based on DocBranton/umw client/src/components/workbench.tsx (main, 2026-11-10).
 *
 * This is a reusable application-local interface, not an assertion that UMW
 * exports a shared package. Replace the demo adapter only after an approved
 * authoritative part-search and request-workflow service is available.
 */
import { GAU8_PARTS } from './data';

export const REQUEST_CHOICES = [
  { id: 'redesign', label: 'Redesign an existing part' },
  { id: 'new', label: 'Design a new part' },
  { id: 'transform', label: 'Digitally transform legacy technical data' },
  { id: 'alternatives', label: 'Analyze manufacturing and repair alternatives' },
  { id: 'production', label: 'Request a production run of an existing solution' },
] as const;

export type RequestType = typeof REQUEST_CHOICES[number]['id'];
export const DELIVERABLES = [
  { id: 'cad', label: '3D CAD model (only)', description: '' },
  { id: 'II', label: 'Level II TDP', description: 'Requirements, verified 3D model, technical specification, and bill of materials' },
  { id: 'III', label: 'Level III TDP', description: 'Level II plus test evidence, manufacturing and airworthiness packages' },
  { id: 'custom', label: 'Custom', description: 'Define the required technical deliverables' },
] as const;
export type DeliverableType = typeof DELIVERABLES[number]['id'];

export interface PartSearch {
  aircraft: string;
  nsn: string;
  partNumber: string;
  description: string;
}

export interface PartMatch {
  id: string;
  aircraft: string;
  nsn: string;
  partNumber: string | null;
  name: string;
  source: 'demonstration';
}

export interface RequestDraft {
  type: RequestType;
  part: PartMatch | null;
  search: PartSearch;
  deliverable: DeliverableType | null;
  details: string;
}

export interface AssistanceAdapter {
  search(query: PartSearch): Promise<PartMatch[]>;
  // No submit() method until an authorized UMW service contract exists.
}

/** Match all populated fields (AND), case-insensitive NSN normalized like UMW. */
export function filterParts(rows: PartMatch[], query: PartSearch): PartMatch[] {
  const norm = (v: string) => v.replace(/[^a-z0-9]/gi, '').toLowerCase();
  const nsn = norm(query.nsn), pn = query.partNumber.trim().toLowerCase(), description = query.description.trim().toLowerCase();
  return rows.filter(row =>
    (!query.aircraft || row.aircraft === query.aircraft) &&
    (!nsn || norm(row.nsn).includes(nsn)) &&
    (!pn || (row.partNumber ?? '').toLowerCase().includes(pn)) &&
    (!description || row.name.toLowerCase().includes(description))
  ).slice(0, 8);
}

const DEMO_PARTS: PartMatch[] = GAU8_PARTS.map(p => ({
  id: p.nsn,
  aircraft: 'A-10 Thunderbolt II',
  nsn: p.nsn,
  partNumber: null, // No part numbers are provided by the demonstration data.
  name: p.name,
  source: 'demonstration',
}));

export const demoAssistanceAdapter: AssistanceAdapter = {
  async search(query) {
    return filterParts(DEMO_PARTS, query);
  },
};
