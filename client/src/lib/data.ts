export interface Part {
  rank: number;
  score: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  nsn: string;
  name: string;
  acqCost: number;
  leadTime: number;
  micaps: number;
  demand: number;
  supplyRisk: 'Obsolescence' | 'High' | 'Medium' | 'Low';
  readinessImpact: number;
  assessment: string;
}

export const GAU8_PARTS: Part[] = [
  { rank: 1, score: 0.962, priority: 'CRITICAL', nsn: '1010-01-234-5678', name: 'Feed Pawl (Bolt Carrier Subassy)', acqCost: 4800, leadTime: 421, micaps: 12, demand: 18, supplyRisk: 'Obsolescence', readinessImpact: -3.2, assessment: 'High (AM / Re-Eng)' },
  { rank: 2, score: 0.917, priority: 'CRITICAL', nsn: '1010-01-678-9012', name: 'Barrel Support Bracket', acqCost: 3600, leadTime: 365, micaps: 8, demand: 22, supplyRisk: 'High', readinessImpact: -2.7, assessment: 'High (AM)' },
  { rank: 3, score: 0.881, priority: 'HIGH', nsn: '1010-00-583-2210', name: 'Rotor End Cap', acqCost: 2900, leadTime: 298, micaps: 7, demand: 36, supplyRisk: 'High', readinessImpact: -2.1, assessment: 'Medium (AM / Repair)' },
  { rank: 4, score: 0.848, priority: 'HIGH', nsn: '1010-01-774-3301', name: 'Trunnion Mount', acqCost: 2400, leadTime: 270, micaps: 6, demand: 28, supplyRisk: 'Medium', readinessImpact: -1.8, assessment: 'High (AM)' },
  { rank: 5, score: 0.826, priority: 'HIGH', nsn: '1010-00-972-4411', name: 'Drive Shaft Coupling', acqCost: 2100, leadTime: 240, micaps: 5, demand: 32, supplyRisk: 'Medium', readinessImpact: -1.6, assessment: 'Medium (AM)' },
  { rank: 6, score: 0.788, priority: 'MEDIUM', nsn: '1010-01-118-9922', name: 'Actuator Housing', acqCost: 1800, leadTime: 210, micaps: 4, demand: 54, supplyRisk: 'Medium', readinessImpact: -1.4, assessment: 'Medium (AM / Repair)' },
  { rank: 7, score: 0.764, priority: 'MEDIUM', nsn: '1010-01-667-1100', name: 'Feed Gate Guide', acqCost: 1500, leadTime: 198, micaps: 4, demand: 62, supplyRisk: 'Medium', readinessImpact: -1.2, assessment: 'High (AM)' },
  { rank: 8, score: 0.746, priority: 'MEDIUM', nsn: '1010-00-445-8803', name: 'Worm Gear Cover', acqCost: 1200, leadTime: 180, micaps: 3, demand: 70, supplyRisk: 'Low', readinessImpact: -0.9, assessment: 'Medium (AM)' },
  { rank: 9, score: 0.732, priority: 'MEDIUM', nsn: '1010-01-556-7765', name: 'Link Ejector Latch', acqCost: 1100, leadTime: 176, micaps: 3, demand: 68, supplyRisk: 'Medium', readinessImpact: -0.8, assessment: 'Medium (AM / Re-Eng)' },
  { rank: 10, score: 0.721, priority: 'MEDIUM', nsn: '1010-00-339-6677', name: 'Roller Guide', acqCost: 1000, leadTime: 168, micaps: 3, demand: 74, supplyRisk: 'Low', readinessImpact: -0.7, assessment: 'Medium (AM)' },
];

export const KPIS = {
  partsInScope: 18426,
  amCandidates: 327,
  avgLeadTime: 421,
  leadTimeDelta: 14,
  costAvoidance: 142.7,
  weaponSystems: 12,
  readinessImpact: 23.6,
};
