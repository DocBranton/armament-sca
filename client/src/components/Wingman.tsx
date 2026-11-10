import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Send, Sparkles, Volume2, VolumeX, X } from "lucide-react";

export type ServiceId = "airforce" | "army" | "navy";

export const SERVICES = [
  { id: "airforce" as ServiceId, label: "Air Force", ask: "Ask SI Wingman", name: "Gen. John Duselis", org: "AFLCMC / EBUW", initials: "JD" },
  { id: "army" as ServiceId, label: "Army", ask: "Ask SI Wingman", name: "COL Dana Reeves", org: "DEVCOM AvMC", initials: "DR" },
  { id: "navy" as ServiceId, label: "Navy", ask: "Ask SI Wingman", name: "CAPT Avery Park", org: "NAVAIR", initials: "AP" },
];

export function serviceOf(id: ServiceId) {
  return SERVICES.find((item) => item.id === id) ?? SERVICES[0];
}

interface WingmanPersona {
  id: string;
  name: string;
  role: string;
  focus: string;
}

const WINGMEN: WingmanPersona[] = [
  { id: "mira", name: "Capt. Mira", role: "Operations Officer", focus: "readiness impact and mission priority" },
  { id: "mason", name: "Lt. Mason", role: "Engineer", focus: "AM process feasibility and re-engineering" },
  { id: "arden", name: "Chief Arden", role: "Mentor", focus: "qualification path and risk" },
  { id: "nova", name: "Nova", role: "Technical Analyst", focus: "supply risk, obsolescence, and MICAP drivers" },
  { id: "echo", name: "Echo", role: "Readiness", focus: "lead time, demand, and cost avoidance" },
];

function replyTo(text: string, wing: WingmanPersona, context: string) {
  const lower = text.toLowerCase();
  const callsign = wing.name.split(" ").slice(-1)[0];
  if (lower.includes("score") || lower.includes("why")) {
    return `${callsign}: Weighted score balances acquisition cost, lead time, MICAPs, demand, supply risk, and readiness impact. Critical parts like the Feed Pawl drive the highest scores due to obsolescence and long lead times. I am watching ${wing.focus}.`;
  }
  if (lower.includes("am") || lower.includes("print") || lower.includes("manufactur")) {
    return `${callsign}: For high-priority candidates (score > 0.85), prioritize AM for complex geometries or obsolescent items. Barrel Support Bracket and Trunnion Mount are strong AM candidates. Organic production reduces lead time risk.`;
  }
  if (lower.includes("micap") || lower.includes("risk") || lower.includes("obsol")) {
    return `${callsign}: Obsolescence and high MICAP counts are primary drivers. Feed Pawl and Barrel Support Bracket show elevated supply risk. Recommend qualification path assessment before fielding AM parts.`;
  }
  return `${callsign} on station for Armament Supply Chain analysis. ${context}. I am watching ${wing.focus}. Ask about a specific part score, AM recommendation, or supply risk.`;
}

async function askWingman(text: string, wing: WingmanPersona, history: { role: "bot" | "user"; text: string }[]): Promise<string | null> {
  try {
    const res = await fetch("/api/wingman", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        wingman: { name: wing.name, focus: wing.focus },
        context: "Armament Supply Chain & AM Candidate Analysis (GAU-8/A focus)",
        history: history.slice(-10),
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.reply?.trim() || null;
  } catch {
    return null;
  }
}

export function WingmanPanel({ onClose, context = "GAU-8/A (A-10) AM candidates" }: { onClose: () => void; context?: string }) {
  const [picker, setPicker] = useState(false);
  const [wingId, setWingId] = useState("mira");
  const wing = WINGMEN.find((w) => w.id === wingId) ?? WINGMEN[0];
  const [chat, setChat] = useState<{ role: "bot" | "user"; text: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [warning, setWarning] = useState("");
  const [draft, setDraft] = useState("");
  const thread = useRef<HTMLDivElement>(null);

  useEffect(() => {
    thread.current?.scrollTo({ top: thread.current.scrollHeight });
  }, [chat.length]);

  function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setChat((c) => [...c, { role: "user", text: trimmed }]);
    setDraft("");
    setBusy(true);
    setWarning("");
    const history = chat;
    askWingman(trimmed, wing, history)
      .then((r) => {
        const reply = r ?? replyTo(trimmed, wing, context);
        if (!r) setWarning("SI model unavailable. Showing local guidance.");
        setChat((c) => [...c, { role: "bot", text: reply }]);
      })
      .catch(() => {
        setWarning("SI service unreachable.");
        setChat((c) => [...c, { role: "bot", text: replyTo(trimmed, wing, context) }]);
      })
      .finally(() => setBusy(false));
  }

  const callsign = wing.name.split(" ").slice(-1)[0];

  return (
    <div style={{ position: "fixed", right: 0, top: 56, bottom: 0, width: 400, background: "#0d1b2e", borderLeft: "1px solid #1a2a44", display: "flex", flexDirection: "column", zIndex: 50 }}>
      <header style={{ padding: 12, borderBottom: "1px solid #1a2a44", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <strong>{wing.name}</strong>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>SI Wingman · {wing.role}</div>
        </div>
        <div>
          <button onClick={() => setPicker((p) => !p)} style={{ marginRight: 8 }}>{picker ? "Back" : "Change"}</button>
          <button onClick={onClose} aria-label="Close">×</button>
        </div>
      </header>

      {picker ? (
        <div style={{ padding: 12, overflow: "auto" }}>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>Different perspectives. Same mission.</p>
          {WINGMEN.map((p) => (
            <button key={p.id} onClick={() => { setWingId(p.id); setPicker(false); }} style={{ display: "block", width: "100%", textAlign: "left", margin: "8px 0", padding: 8, background: p.id === wingId ? "#12203a" : "transparent", border: "1px solid #1a2a44", color: "inherit" }}>
              <strong>{p.name}</strong> — {p.role}<br />
              <small>{p.focus}</small>
            </button>
          ))}
        </div>
      ) : (
        <>
          <div ref={thread} style={{ flex: 1, overflow: "auto", padding: 12 }}>
            <div style={{ background: "#12203a", padding: 10, borderRadius: 6, marginBottom: 12, fontSize: 13 }}>
              <strong><Sparkles size={14} /> {callsign}'s insight</strong>
              <p>{context}. {callsign} is watching {wing.focus}.</p>
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Suggested actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              <button onClick={() => ask("Why is the Feed Pawl scored highest?")}>Explain top score</button>
              <button onClick={() => ask("Which parts are best AM candidates?")}>Recommend AM parts</button>
              <button onClick={() => ask("What is driving supply risk?")}>Supply risk drivers</button>
            </div>
            {chat.map((msg, i) => (
              <div key={i} style={{ margin: "8px 0", padding: 8, background: msg.role === "bot" ? "#12203a" : "#1a2a44", borderRadius: 6, fontSize: 13 }}>
                <strong>{msg.role === "bot" ? callsign : "You"}</strong><br />
                {msg.text}
              </div>
            ))}
            {busy && <div style={{ fontSize: 13, color: "var(--muted)" }}>{callsign} is thinking…</div>}
            {warning && <p style={{ fontSize: 12, color: "#fa8c16" }}>{warning}</p>}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); ask(draft); }} style={{ padding: 12, borderTop: "1px solid #1a2a44", display: "flex", gap: 8 }}>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Ask ${callsign} about ${context}…`} style={{ flex: 1, background: "#12203a", border: "1px solid #2a4060", color: "inherit", padding: 8, borderRadius: 6 }} />
            <button type="submit" disabled={busy || !draft.trim()}><Send size={16} /></button>
          </form>
        </>
      )}
    </div>
  );
}
