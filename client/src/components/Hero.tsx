import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { STAGES, type StageId } from "../lib/stages";

interface HeroProps {
  collapsed: boolean;
  onToggle: () => void;
  activeStage: StageId | null;
  onStage: (id: StageId) => void;
}

/**
 * Armament Supply Chain hero — adapted from Idea Forge Hero.
 * Expanded: headline + A-10 visual context + six-stage pipeline.
 * Collapsed: compact band with pipeline still reachable.
 */
export function Hero({ collapsed, onToggle, activeStage, onStage }: HeroProps) {
  return (
    <section
      className={collapsed ? "hero collapsed" : "hero"}
      aria-label="Armament Sustainment & Advanced Manufacturing"
      style={{
        background: collapsed
          ? "#0d1b2e"
          : "linear-gradient(90deg, #0a1628 0%, rgba(10,22,40,0.85) 40%, transparent 70%), url('/brand/a10.webp') right center / cover no-repeat",
        borderRadius: 8,
        marginBottom: 16,
        position: "relative",
        overflow: "hidden",
        minHeight: collapsed ? 72 : 220,
        border: "1px solid #1a2a44",
      }}
    >
      <div style={{ padding: collapsed ? "12px 20px" : "24px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
        {!collapsed && (
          <div>
            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>
              ARMAMENT SUSTAINMENT<br />
              <em style={{ color: "var(--cyan)", fontStyle: "normal" }}>& ADVANCED MANUFACTURING</em>
            </h2>
            <p style={{ margin: "8px 0 0", maxWidth: 520, color: "var(--muted)", fontSize: 14 }}>
              Supply chain intelligence to identify, prioritize, and execute AM solutions for aircraft guns, small arms, and light weapons.
            </p>
            <button
              style={{
                marginTop: 12,
                background: "#1f7bff",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: 6,
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              Analyze AM Candidates <ArrowRight size={16} />
            </button>
          </div>
        )}

        {collapsed && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <strong>Armament Sustainment & Advanced Manufacturing</strong>
            <button style={{ background: "#1f7bff", color: "white", border: "none", padding: "6px 12px", borderRadius: 6, fontSize: 13 }}>
              Analyze AM Candidates
            </button>
          </div>
        )}

        <ol
          style={{
            display: "flex",
            gap: 4,
            listStyle: "none",
            margin: 0,
            padding: 0,
            overflowX: "auto",
          }}
          aria-label="Process stages"
        >
          {STAGES.map((s) => (
            <li key={s.id} style={{ flex: "0 0 auto" }}>
              <button
                type="button"
                onClick={() => onStage(s.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  background: activeStage === s.id ? "#6b4dff" : "rgba(18,32,58,0.8)",
                  border: "1px solid #2a4060",
                  borderRadius: 6,
                  color: "inherit",
                  cursor: "pointer",
                  minWidth: 140,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--cyan)" }}>{s.num}</span>
                <span style={{ textAlign: "left" }}>
                  <b style={{ display: "block", fontSize: 12 }}>{s.title}</b>
                  <small style={{ color: "var(--muted)", fontSize: 10 }}>{s.caption}</small>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#12203a",
          border: "1px solid #1a2a44",
          borderBottom: "none",
          borderRadius: "6px 6px 0 0",
          padding: "4px 12px",
          fontSize: 12,
          color: "var(--muted)",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        <span>{collapsed ? "Expand" : "Collapse"}</span>
      </button>
    </section>
  );
}
