export type StageId = "detect" | "analyze" | "prioritize" | "assess" | "execute" | "measure";

export interface Stage {
  id: StageId;
  num: string;
  title: string;
  caption: string;
}

export const STAGES: Stage[] = [
  { id: "detect", num: "01", title: "DETECT", caption: "Identify supply chain challenges" },
  { id: "analyze", num: "02", title: "ANALYZE", caption: "Assess AM opportunity & value" },
  { id: "prioritize", num: "03", title: "PRIORITIZE", caption: "Rank candidates by weighted score" },
  { id: "assess", num: "04", title: "ASSESS", caption: "AoA, TDP, and qualification path" },
  { id: "execute", num: "05", title: "EXECUTE", caption: "Prototype, qualify, and field" },
  { id: "measure", num: "06", title: "MEASURE", caption: "Track readiness impact" },
];
