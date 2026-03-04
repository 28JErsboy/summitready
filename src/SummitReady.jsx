import { useState, useEffect, useRef, useCallback } from "react";

// ─── DATA ───

const ADVENTURES = [
  { id: "tmb", name: "Tour du Mont Blanc", region: "Alps, Europe", days: 11, difficulty: 7, elevation: 10000, type: "trek", emoji: "🏔️" },
  { id: "ebc", name: "Everest Base Camp", region: "Himalayas, Nepal", days: 14, difficulty: 8, elevation: 17598, type: "trek", emoji: "⛰️" },
  { id: "kili", name: "Kilimanjaro Summit", region: "Tanzania", days: 7, difficulty: 7, elevation: 19341, type: "mountaineering", emoji: "🌋" },
  { id: "inca", name: "Inca Trail", region: "Andes, Peru", days: 4, difficulty: 5, elevation: 13828, type: "trek", emoji: "🏛️" },
  { id: "jmt", name: "John Muir Trail", region: "Sierra Nevada, USA", days: 21, difficulty: 7, elevation: 14505, type: "trek", emoji: "🌲" },
  { id: "annapurna", name: "Annapurna Circuit", region: "Himalayas, Nepal", days: 18, difficulty: 8, elevation: 17769, type: "trek", emoji: "🗻" },
  { id: "rainier", name: "Mt. Rainier Summit", region: "Washington, USA", days: 3, difficulty: 8, elevation: 14411, type: "mountaineering", emoji: "❄️" },
  { id: "wtrek", name: "W Trek – Torres del Paine", region: "Patagonia, Chile", days: 5, difficulty: 5, elevation: 2600, type: "trek", emoji: "🌬️" },
  { id: "haute", name: "Haute Route", region: "Alps, Europe", days: 14, difficulty: 9, elevation: 12000, type: "mountaineering", emoji: "⛷️" },
];

const QUESTIONS = [
  { id: "cardio", cat: "fitness", icon: "❤️", q: "How would you describe your current cardiovascular fitness?", opts: [
    { l: "Sedentary — no regular exercise", v: 1 },
    { l: "Light — easy exercise 1–2x/week", v: 3 },
    { l: "Moderate — cardio 3–4x/week", v: 6 },
    { l: "Strong — endurance training 5+x/week", v: 9 },
  ]},
  { id: "hiking", cat: "experience", icon: "🥾", q: "What's the longest hike you've completed?", opts: [
    { l: "Under 5 miles on flat terrain", v: 1 },
    { l: "Day hikes up to 10 miles", v: 3 },
    { l: "Full-day mountain hikes with elevation", v: 6 },
    { l: "Multi-day backpacking (3+ days, full pack)", v: 9 },
  ]},
  { id: "altitude", cat: "experience", icon: "🏔️", q: "Highest altitude you've been active at?", opts: [
    { l: "Below 5,000 ft / 1,500m", v: 2 },
    { l: "5,000–10,000 ft / 1,500–3,000m", v: 5 },
    { l: "10,000–15,000 ft / 3,000–4,500m", v: 7 },
    { l: "Above 15,000 ft / 4,500m", v: 9 },
  ]},
  { id: "pack", cat: "fitness", icon: "🎒", q: "Can you carry a loaded pack (25–35 lbs) for extended periods?", opts: [
    { l: "Never tried", v: 1 },
    { l: "An hour or two, then I struggle", v: 3 },
    { l: "A full day with breaks", v: 6 },
    { l: "All day, multiple consecutive days", v: 9 },
  ]},
  { id: "terrain", cat: "skill", icon: "🧗", q: "Comfort level on technical terrain?", opts: [
    { l: "Maintained trails only", v: 1 },
    { l: "Rocky trails with care", v: 4 },
    { l: "Class 2–3 scrambles", v: 7 },
    { l: "Regular climbing and scrambling", v: 9 },
  ]},
  { id: "weather", cat: "skill", icon: "⛈️", q: "Experience with adverse mountain weather?", opts: [
    { l: "Good conditions only", v: 1 },
    { l: "Caught in rain, nothing extreme", v: 3 },
    { l: "Storms, snow, and whiteout conditions", v: 7 },
    { l: "Trained in weather assessment", v: 9 },
  ]},
  { id: "gear", cat: "logistics", icon: "⛺", q: "How's your gear inventory?", opts: [
    { l: "Need everything from scratch", v: 2 },
    { l: "Basics only (boots, daypack)", v: 4 },
    { l: "Well-equipped for most conditions", v: 7 },
    { l: "Specialized expedition gear", v: 9 },
  ]},
  { id: "nav", cat: "skill", icon: "🧭", q: "Navigation skills in backcountry?", opts: [
    { l: "Rely on marked trails and phone", v: 1 },
    { l: "Can read a basic trail map", v: 3 },
    { l: "Comfortable with topo maps + GPS", v: 7 },
    { l: "Skilled off-trail route-finding", v: 9 },
  ]},
  { id: "medical", cat: "logistics", icon: "🏥", q: "Any medical conditions affecting strenuous activity at altitude?", opts: [
    { l: "Significant concerns, haven't consulted a doctor", v: 1 },
    { l: "Some concerns, managed with medical guidance", v: 4 },
    { l: "Minor issues, don't limit activity", v: 7 },
    { l: "No concerns — recently cleared", v: 9 },
  ]},
  { id: "timeline", cat: "logistics", icon: "📅", q: "When are you planning this adventure?", opts: [
    { l: "Within the next month", v: 2 },
    { l: "2–3 months from now", v: 5 },
    { l: "4–6 months from now", v: 8 },
    { l: "6+ months — plenty of time", v: 9 },
  ]},
];

function computeScore(answers, adv) {
  const d = adv.difficulty, hiAlt = adv.elevation > 12000, multi = adv.days > 3, tech = adv.type === "mountaineering";
  const w = {
    cardio: 1.5 + (multi ? .5 : 0), hiking: 1.2 + (multi ? .3 : 0), altitude: hiAlt ? 2.0 : .6,
    pack: multi ? 1.5 : .5, terrain: tech ? 1.8 : .8, weather: 1 + (d > 7 ? .5 : 0),
    gear: 1, nav: tech ? 1.2 : .7, medical: 1.5, timeline: .8,
  };
  let wt = 0, tw = 0;
  const cats = { fitness: [], experience: [], skill: [], logistics: [] };
  QUESTIONS.forEach(q => { const v = answers[q.id] || 0; wt += v * (w[q.id]||1); tw += 9 * (w[q.id]||1); cats[q.cat].push(v); });
  const raw = (wt / tw) * 100, pen = Math.max(0, (d - 5) * 3);
  const score = Math.max(5, Math.min(98, Math.round(raw - pen)));
  const catScores = {};
  Object.entries(cats).forEach(([k, arr]) => { catScores[k] = Math.round((arr.reduce((a,b) => a+b, 0) / arr.length / 9) * 100); });
  
  const gaps = [];
  if (answers.cardio <= 3 && d >= 6) gaps.push({ area: "Cardiovascular Endurance", priority: "critical", tip: "Build aerobic base with 3-4x/week sustained cardio (running, cycling, swimming). Target 45-60 min sessions at conversational pace." });
  if (answers.altitude <= 2 && hiAlt) gaps.push({ area: "Altitude Experience", priority: "critical", tip: "Your trip reaches significant altitude. Consider a pre-trip acclimatization hike, learn symptoms of AMS, and discuss Diamox with your doctor." });
  if (answers.hiking <= 3 && multi) gaps.push({ area: "Multi-Day Endurance", priority: "critical", tip: "Start with back-to-back day hikes on weekends, gradually increasing distance and pack weight over 8-12 weeks." });
  if (answers.terrain <= 4 && tech) gaps.push({ area: "Technical Terrain", priority: "high", tip: "Take a scrambling or basic mountaineering course. Practice on Class 2-3 terrain with experienced partners." });
  if (answers.pack <= 3 && multi) gaps.push({ area: "Load Carrying", priority: "high", tip: "Begin weighted pack walks at 15 lbs, adding 2-3 lbs per week. Train on hills and stairs with your actual expedition pack." });
  if (answers.gear <= 4) gaps.push({ area: "Gear & Equipment", priority: "medium", tip: "Audit your gear against the trip-specific checklist. Prioritize footwear (break in boots early), layering system, and navigation tools." });
  if (answers.nav <= 3 && d >= 7) gaps.push({ area: "Navigation", priority: "medium", tip: "Practice with topo maps on local trails. Learn to use a compass and GPS device as backup to phone-based navigation." });
  if (answers.weather <= 3 && d >= 6) gaps.push({ area: "Weather Preparedness", priority: "medium", tip: "Learn to read mountain weather patterns. Practice hiking in adverse conditions locally. Invest in quality rain gear." });

  return { score, catScores, gaps };
}

function genPlan(answers, adv, gaps) {
  const wks = answers.timeline >= 8 ? 16 : answers.timeline >= 5 ? 10 : 6;
  const phases = [];
  const fWks = Math.max(2, Math.round(wks * .3)), bWks = Math.max(2, Math.round(wks * .4)), pWks = Math.max(2, wks - fWks - bWks);
  
  const fActs = ["Steady-state cardio 3-4x/week, 30-45 min (run, bike, swim)", "Strength training 2x/week: squats, lunges, step-ups, core work", "Weekend hike: start at 5 miles, add 1 mile each week"];
  if (gaps.find(g => g.area === "Load Carrying")) fActs.push("Weighted pack walks starting at 15 lbs, +2 lbs/week");
  if (gaps.find(g => g.area === "Gear & Equipment")) fActs.push("Complete gear audit and begin acquiring missing items");
  
  const bActs = ["Cardio with intervals 4-5x/week: hills, stairs, incline treadmill", "Heavy leg and core strength 2x/week", "Long weekend hikes with full pack weight on real elevation"];
  if (adv.elevation > 10000) bActs.push("Research altitude acclimatization; consider a pre-trip altitude weekend");
  if (gaps.find(g => g.area === "Technical Terrain")) bActs.push("Complete a scrambling or basic mountaineering skills course");
  if (gaps.find(g => g.area === "Navigation")) bActs.push("Practice topo map and compass navigation on unfamiliar trails");
  
  const pActs = ["Back-to-back long days simulating trip intensity", "Final gear shakedown: test everything you'll carry", "Last 5-7 days: taper with light activity, hydrate, rest"];
  if (adv.elevation > 12000) pActs.push("Review altitude sickness protocols and emergency descent plans");
  
  phases.push({ name: "Foundation", weeks: `Weeks 1–${fWks}`, focus: "Build your aerobic base and address critical gaps", acts: fActs });
  phases.push({ name: "Build", weeks: `Weeks ${fWks+1}–${fWks+bWks}`, focus: "Increase intensity and trip-specific training", acts: bActs });
  phases.push({ name: "Peak & Taper", weeks: `Weeks ${fWks+bWks+1}–${wks}`, focus: "Simulate trip demands, then rest before departure", acts: pActs });
  return { totalWeeks: wks, phases };
}

// ─── STYLES ───
const font = "'DM Sans', sans-serif";
const displayFont = "'Playfair Display', serif";

const colors = {
  bg: "#0B1215", bgCard: "#111B20", bgCardHover: "#162329",
  surface: "#1A2830", surfaceLight: "#223540",
  accent: "#E8873A", accentGlow: "rgba(232,135,58,0.15)", accentSoft: "#C06A28",
  teal: "#3FBDA8", tealGlow: "rgba(63,189,168,0.12)", tealDark: "#2A8E7E",
  text: "#E8ECF0", textMid: "#9AACB8", textDim: "#5A7080",
  critical: "#E85A5A", high: "#E8873A", medium: "#3FBDA8",
  border: "rgba(255,255,255,0.06)",
};

const S = {
  page: { minHeight: "100vh", background: colors.bg, fontFamily: font, color: colors.text, position: "relative", overflow: "hidden" },
  container: { maxWidth: 800, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 2 },
};

// ─── ANIMATED MOUNTAIN SVG ───
function MountainScene({ opacity = 0.35 }) {
  return (
    <svg viewBox="0 0 1440 400" style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "auto", opacity, zIndex: 1 }} preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="m1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1A3040"/><stop offset="100%" stopColor="#0B1215"/></linearGradient>
        <linearGradient id="m2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#162830"/><stop offset="100%" stopColor="#0B1215"/></linearGradient>
        <linearGradient id="m3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0F1E25"/><stop offset="100%" stopColor="#0B1215"/></linearGradient>
      </defs>
      <polygon points="0,400 200,120 400,280 600,80 800,200 1000,100 1200,250 1440,150 1440,400" fill="url(#m1)"/>
      <polygon points="0,400 150,200 350,300 550,150 750,260 950,180 1150,300 1350,220 1440,280 1440,400" fill="url(#m2)"/>
      <polygon points="0,400 100,300 300,350 500,280 700,340 900,300 1100,360 1300,320 1440,350 1440,400" fill="url(#m3)"/>
      <line x1="600" y1="80" x2="600" y2="55" stroke="#E8ECF0" strokeWidth="1" opacity="0.3"/>
      <polygon points="594,55 606,55 600,42" fill="#E8873A" opacity="0.6"/>
    </svg>
  );
}

// ─── RADIAL SCORE ───
function ScoreRing({ score, size = 200, animate = true }) {
  const [displayed, setDisplayed] = useState(0);
  const r = (size - 16) / 2, circ = 2 * Math.PI * r;
  const offset = circ - (displayed / 100) * circ;
  const color = score >= 75 ? colors.teal : score >= 50 ? colors.accent : colors.critical;

  useEffect(() => {
    if (!animate) { setDisplayed(score); return; }
    let frame, start;
    const dur = 1800;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(ease * score));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [score, animate]);

  const label = score >= 75 ? "Ready" : score >= 50 ? "Almost There" : "Needs Work";

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={colors.surface} strokeWidth="8"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.1s linear", filter: `drop-shadow(0 0 8px ${color}40)` }}/>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: displayFont, fontSize: size * 0.3, fontWeight: 700, color, lineHeight: 1 }}>{displayed}</span>
        <span style={{ fontSize: 11, color: colors.textMid, letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>{label}</span>
      </div>
    </div>
  );
}

// ─── CATEGORY BAR ───
function CatBar({ label, value, color, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 200 + delay); return () => clearTimeout(t); }, [value, delay]);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: colors.textMid, textTransform: "capitalize" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color }}>{value}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: colors.surface, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${w}%`, borderRadius: 3, background: color, transition: "width 1.2s cubic-bezier(0.25,1,0.5,1)", boxShadow: `0 0 10px ${color}30` }}/>
      </div>
    </div>
  );
}

// ─── MAIN APP ───
export default function SummitReady() {
  const [screen, setScreen] = useState("landing"); // landing, select, assess, results
  const [adventure, setAdventure] = useState(null);
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [plan, setPlan] = useState(null);
  const [fadeIn, setFadeIn] = useState(true);
  const [showPlan, setShowPlan] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null); // null, "yes", "no"
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const transition = useCallback((next) => {
    setFadeIn(false);
    setTimeout(() => { setScreen(next); setFadeIn(true); }, 350);
  }, []);

  const selectAdventure = (adv) => { setAdventure(adv); transition("assess"); };

  const answerQ = (qId, val) => {
    const next = { ...answers, [qId]: val };
    setAnswers(next);
    if (qi < QUESTIONS.length - 1) {
      setFadeIn(false);
      setTimeout(() => { setQi(qi + 1); setFadeIn(true); }, 300);
    } else {
      const r = computeScore(next, adventure);
      const p = genPlan(next, adventure, r.gaps);
      setResult(r);
      setPlan(p);
      transition("results");
    }
  };

  const restart = () => {
    setAdventure(null); setQi(0); setAnswers({}); setResult(null); setPlan(null); setShowPlan(false);
    setEmail(""); setEmailSubmitted(false); setFeedback(null); setFeedbackText(""); setFeedbackSubmitted(false);
    transition("landing");
  };

  const fadeStyle = { opacity: fadeIn ? 1 : 0, transform: fadeIn ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.4s ease, transform 0.4s ease" };

  // ─── LANDING ───
  if (screen === "landing") return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet"/>
      <MountainScene opacity={0.5}/>
      <div style={{ ...S.container, paddingTop: 80, paddingBottom: 120 }}>
        <div style={fadeStyle}>
          {/* Topographic texture */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 300, background: `radial-gradient(ellipse at 30% 0%, ${colors.accentGlow} 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, ${colors.tealGlow} 0%, transparent 50%)`, zIndex: 0 }}/>
          
          <div style={{ position: "relative", zIndex: 1, textAlign: "center", paddingTop: 60 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 40, padding: "6px 16px", marginBottom: 32 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.teal, boxShadow: `0 0 8px ${colors.teal}` }}/>
              <span style={{ fontSize: 12, letterSpacing: 1.5, color: colors.textMid, textTransform: "uppercase" }}>AI-Powered Readiness</span>
            </div>

            <h1 style={{ fontFamily: displayFont, fontSize: "clamp(48px, 8vw, 72px)", fontWeight: 800, lineHeight: 1.05, margin: "0 0 20px", color: colors.text }}>
              Summit<span style={{ color: colors.accent }}>Ready</span>
            </h1>
            <p style={{ fontSize: 18, color: colors.textMid, maxWidth: 520, margin: "0 auto 48px", lineHeight: 1.6 }}>
              Know before you go. AI-powered readiness assessments and personalized training plans for mountain adventures.
            </p>

            <button onClick={() => transition("select")} style={{
              fontFamily: font, fontSize: 16, fontWeight: 600, color: "#fff",
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentSoft})`,
              border: "none", borderRadius: 12, padding: "16px 40px", cursor: "pointer",
              boxShadow: `0 4px 24px ${colors.accent}40, 0 1px 3px rgba(0,0,0,0.3)`,
              transition: "transform 0.2s, box-shadow 0.2s",
            }} onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = `0 8px 32px ${colors.accent}50`; }}
               onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = `0 4px 24px ${colors.accent}40`; }}>
              Assess My Readiness
            </button>

            {/* Feature cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 72, textAlign: "left" }}>
              {[
                { icon: "🎯", title: "Readiness Score", desc: "Personalized 0–100 assessment for any mountain adventure" },
                { icon: "📋", title: "Training Plans", desc: "Phased preparation calibrated to your trip date" },
                { icon: "⚡", title: "Gap Analysis", desc: "Identifies exactly what you need to work on" },
              ].map((f, i) => (
                <div key={i} style={{
                  background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 24,
                  transition: "border-color 0.3s, background 0.3s",
                }} onMouseEnter={e => { e.currentTarget.style.borderColor = colors.accent + "40"; e.currentTarget.style.background = colors.bgCardHover; }}
                   onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.background = colors.bgCard; }}>
                  <span style={{ fontSize: 28 }}>{f.icon}</span>
                  <h3 style={{ fontFamily: displayFont, fontSize: 17, fontWeight: 700, margin: "12px 0 6px", color: colors.text }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: colors.textMid, lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── SELECT ADVENTURE ───
  if (screen === "select") return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet"/>
      <MountainScene opacity={0.25}/>
      <div style={{ ...S.container, paddingTop: 48, paddingBottom: 80 }}>
        <div style={fadeStyle}>
          <button onClick={() => transition("landing")} style={{ background: "none", border: "none", color: colors.textMid, fontFamily: font, fontSize: 14, cursor: "pointer", padding: "8px 0", marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>
            ← Back
          </button>
          <h2 style={{ fontFamily: displayFont, fontSize: 32, fontWeight: 700, margin: "0 0 8px" }}>Choose Your Adventure</h2>
          <p style={{ fontSize: 15, color: colors.textMid, margin: "0 0 32px" }}>Select the trip you're preparing for</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {ADVENTURES.map(adv => {
              const diffColor = adv.difficulty >= 8 ? colors.critical : adv.difficulty >= 6 ? colors.accent : colors.teal;
              return (
                <button key={adv.id} onClick={() => selectAdventure(adv)} style={{
                  background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 14, padding: "20px 18px",
                  cursor: "pointer", textAlign: "left", transition: "all 0.25s", fontFamily: font,
                }} onMouseEnter={e => { e.currentTarget.style.borderColor = colors.accent; e.currentTarget.style.background = colors.bgCardHover; e.currentTarget.style.transform = "translateY(-2px)"; }}
                   onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.background = colors.bgCard; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{ fontSize: 26 }}>{adv.emoji}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: diffColor, background: diffColor + "18", padding: "3px 8px", borderRadius: 6 }}>{adv.difficulty}/10</span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: colors.text, marginBottom: 4 }}>{adv.name}</div>
                  <div style={{ fontSize: 12, color: colors.textDim }}>{adv.region}</div>
                  <div style={{ display: "flex", gap: 12, marginTop: 10, fontSize: 11, color: colors.textMid }}>
                    <span>{adv.days} days</span>
                    <span>•</span>
                    <span>{adv.elevation.toLocaleString()} ft</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── ASSESSMENT ───
  if (screen === "assess") {
    const q = QUESTIONS[qi];
    const progress = ((qi) / QUESTIONS.length) * 100;
    return (
      <div style={S.page}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet"/>
        <MountainScene opacity={0.2}/>
        <div style={{ ...S.container, paddingTop: 48, paddingBottom: 80 }}>
          <div style={fadeStyle}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>{adventure.emoji}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: colors.textMid }}>{adventure.name}</span>
              </div>
              <span style={{ fontSize: 13, color: colors.textDim }}>{qi + 1} of {QUESTIONS.length}</span>
            </div>

            {/* Progress */}
            <div style={{ height: 4, borderRadius: 2, background: colors.surface, marginBottom: 48, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, borderRadius: 2, background: `linear-gradient(90deg, ${colors.teal}, ${colors.accent})`, transition: "width 0.5s ease", boxShadow: `0 0 12px ${colors.accent}30` }}/>
            </div>

            {/* Question */}
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <span style={{ fontSize: 40, display: "block", marginBottom: 16 }}>{q.icon}</span>
              <h3 style={{ fontFamily: displayFont, fontSize: 26, fontWeight: 700, margin: 0, lineHeight: 1.3, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>{q.q}</h3>
            </div>

            {/* Options */}
            <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
              {q.opts.map((opt, i) => (
                <button key={i} onClick={() => answerQ(q.id, opt.v)} style={{
                  fontFamily: font, fontSize: 15, color: colors.text, background: colors.bgCard,
                  border: `1px solid ${colors.border}`, borderRadius: 12, padding: "16px 20px",
                  cursor: "pointer", textAlign: "left", transition: "all 0.2s", lineHeight: 1.4,
                }} onMouseEnter={e => { e.currentTarget.style.borderColor = colors.accent; e.currentTarget.style.background = colors.bgCardHover; e.currentTarget.style.paddingLeft = "24px"; }}
                   onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.background = colors.bgCard; e.currentTarget.style.paddingLeft = "20px"; }}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULTS ───
  if (screen === "results" && result) {
    const { score, catScores, gaps } = result;
    const scoreColor = score >= 75 ? colors.teal : score >= 50 ? colors.accent : colors.critical;

    return (
      <div style={S.page}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet"/>
        <MountainScene opacity={0.2}/>
        <div style={{ ...S.container, paddingTop: 48, paddingBottom: 100 }}>
          <div style={fadeStyle}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
              <div>
                <h2 style={{ fontFamily: displayFont, fontSize: 28, fontWeight: 700, margin: "0 0 4px" }}>Your Readiness Report</h2>
                <p style={{ fontSize: 14, color: colors.textMid, margin: 0 }}>{adventure.emoji} {adventure.name} — {adventure.region}</p>
              </div>
              <button onClick={restart} style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 10, padding: "10px 18px", color: colors.textMid, fontFamily: font, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                New Assessment
              </button>
            </div>

            {/* Score + Categories */}
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 40, alignItems: "center", background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 20, padding: 32, marginBottom: 24 }}>
              <ScoreRing score={score} size={180}/>
              <div>
                <h3 style={{ fontFamily: displayFont, fontSize: 20, fontWeight: 700, margin: "0 0 20px" }}>Category Breakdown</h3>
                <CatBar label="Fitness" value={catScores.fitness} color={catScores.fitness >= 70 ? colors.teal : catScores.fitness >= 45 ? colors.accent : colors.critical} delay={0}/>
                <CatBar label="Experience" value={catScores.experience} color={catScores.experience >= 70 ? colors.teal : catScores.experience >= 45 ? colors.accent : colors.critical} delay={100}/>
                <CatBar label="Skills" value={catScores.skill} color={catScores.skill >= 70 ? colors.teal : catScores.skill >= 45 ? colors.accent : colors.critical} delay={200}/>
                <CatBar label="Logistics" value={catScores.logistics} color={catScores.logistics >= 70 ? colors.teal : catScores.logistics >= 45 ? colors.accent : colors.critical} delay={300}/>
              </div>
            </div>

            {/* Summary */}
            <div style={{ background: scoreColor + "10", border: `1px solid ${scoreColor}25`, borderRadius: 14, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ fontSize: 20 }}>{score >= 75 ? "✅" : score >= 50 ? "⚡" : "⚠️"}</span>
              <p style={{ fontSize: 14, color: colors.text, lineHeight: 1.6, margin: 0 }}>
                {score >= 75 && `Great news — you're in solid shape for ${adventure.name}. Focus on fine-tuning the areas below and you'll be well-prepared for departure.`}
                {score >= 50 && score < 75 && `You have a solid foundation, but there are meaningful gaps to address before ${adventure.name}. With focused training over the coming weeks, you can be ready.`}
                {score < 50 && `${adventure.name} will be a significant challenge at your current level. The good news: with a committed preparation plan, you can build the fitness and skills needed. Start now.`}
              </p>
            </div>

            {/* Gaps */}
            {gaps.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontFamily: displayFont, fontSize: 20, fontWeight: 700, margin: "0 0 16px" }}>Priority Gaps</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {gaps.map((g, i) => {
                    const pColor = g.priority === "critical" ? colors.critical : g.priority === "high" ? colors.accent : colors.teal;
                    return (
                      <div key={i} style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 14, padding: "16px 20px", borderLeft: `3px solid ${pColor}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>{g.area}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: pColor, background: pColor + "18", padding: "2px 8px", borderRadius: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{g.priority}</span>
                        </div>
                        <p style={{ fontSize: 13, color: colors.textMid, lineHeight: 1.55, margin: 0 }}>{g.tip}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Training Plan Toggle */}
            <button onClick={() => setShowPlan(!showPlan)} style={{
              width: "100%", fontFamily: font, fontSize: 15, fontWeight: 600, color: colors.text,
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentSoft})`,
              border: "none", borderRadius: 14, padding: "16px 24px", cursor: "pointer",
              boxShadow: `0 4px 20px ${colors.accent}30`,
              marginBottom: showPlan ? 20 : 0, transition: "all 0.2s",
            }}>
              {showPlan ? "Hide Training Plan ↑" : `View Your ${plan.totalWeeks}-Week Training Plan ↓`}
            </button>

            {/* Training Plan */}
            {showPlan && plan && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {plan.phases.map((phase, pi) => {
                  const phaseColor = pi === 0 ? colors.teal : pi === 1 ? colors.accent : colors.critical;
                  return (
                    <div key={pi} style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 16, overflow: "hidden" }}>
                      <div style={{ background: phaseColor + "12", borderBottom: `1px solid ${phaseColor}20`, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontSize: 16, fontWeight: 700, color: colors.text }}>Phase {pi + 1}: {phase.name}</span>
                          <span style={{ fontSize: 12, color: colors.textMid, marginLeft: 10 }}>{phase.weeks}</span>
                        </div>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: phaseColor, boxShadow: `0 0 8px ${phaseColor}60` }}/>
                      </div>
                      <div style={{ padding: 20 }}>
                        <p style={{ fontSize: 13, color: phaseColor, fontWeight: 500, margin: "0 0 12px", fontStyle: "italic" }}>{phase.focus}</p>
                        {phase.acts.map((act, ai) => (
                          <div key={ai} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: ai < phase.acts.length - 1 ? 10 : 0 }}>
                            <div style={{ minWidth: 5, height: 5, borderRadius: "50%", background: phaseColor, marginTop: 7, opacity: 0.7 }}/>
                            <span style={{ fontSize: 14, color: colors.textMid, lineHeight: 1.5 }}>{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Disclaimer */}
                <div style={{ background: colors.surface, borderRadius: 12, padding: "14px 18px", marginTop: 4 }}>
                  <p style={{ fontSize: 12, color: colors.textDim, lineHeight: 1.6, margin: 0 }}>
                    ⚠️ This is AI-generated guidance, not medical advice. Consult a physician before starting any training program, especially for high-altitude adventures. SummitReady readiness scores are for preparation guidance only and do not guarantee safety.
                  </p>
                </div>
              </div>
            )}
            {/* ─── EMAIL CAPTURE ─── */}
            <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 28, marginTop: 24 }}>
              {!emailSubmitted ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 22 }}>📬</span>
                    <h3 style={{ fontFamily: displayFont, fontSize: 18, fontWeight: 700, margin: 0 }}>Get Your Full Training Plan</h3>
                  </div>
                  <p style={{ fontSize: 13, color: colors.textMid, lineHeight: 1.6, margin: "0 0 16px" }}>
                    Enter your email to receive your complete readiness report, weekly training check-ins, and trip-specific preparation tips.
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      style={{
                        flex: 1, fontFamily: font, fontSize: 14, color: colors.text,
                        background: colors.surface, border: `1px solid ${colors.border}`,
                        borderRadius: 10, padding: "12px 16px", outline: "none",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={e => e.target.style.borderColor = colors.accent}
                      onBlur={e => e.target.style.borderColor = colors.border}
                    />
                    <button onClick={() => { if (email.includes("@")) setEmailSubmitted(true); }} style={{
                      fontFamily: font, fontSize: 14, fontWeight: 600, color: "#fff",
                      background: email.includes("@") ? `linear-gradient(135deg, ${colors.accent}, ${colors.accentSoft})` : colors.surface,
                      border: "none", borderRadius: 10, padding: "12px 24px", cursor: email.includes("@") ? "pointer" : "default",
                      transition: "all 0.2s", whiteSpace: "nowrap",
                    }}>
                      Send It
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: colors.teal + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>✓</div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: colors.text, margin: "0 0 2px" }}>You're on the list!</p>
                    <p style={{ fontSize: 13, color: colors.textMid, margin: 0 }}>We'll send your readiness report and training plan to {email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* ─── FEEDBACK PROMPT ─── */}
            <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 28, marginTop: 16 }}>
              {!feedbackSubmitted ? (
                <>
                  <h3 style={{ fontFamily: displayFont, fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>Was this assessment useful?</h3>
                  <p style={{ fontSize: 13, color: colors.textMid, margin: "0 0 16px" }}>Your feedback helps us make SummitReady better.</p>

                  <div style={{ display: "flex", gap: 10, marginBottom: feedback ? 16 : 0 }}>
                    {["yes", "no"].map(opt => (
                      <button key={opt} onClick={() => setFeedback(opt)} style={{
                        fontFamily: font, fontSize: 14, fontWeight: 500,
                        color: feedback === opt ? "#fff" : colors.textMid,
                        background: feedback === opt ? (opt === "yes" ? colors.teal : colors.critical) + "cc" : colors.surface,
                        border: `1px solid ${feedback === opt ? (opt === "yes" ? colors.teal : colors.critical) : colors.border}`,
                        borderRadius: 10, padding: "10px 24px", cursor: "pointer", transition: "all 0.2s",
                      }}>
                        {opt === "yes" ? "👍 Yes, useful" : "👎 Not really"}
                      </button>
                    ))}
                  </div>

                  {feedback && (
                    <>
                      <textarea
                        value={feedbackText} onChange={e => setFeedbackText(e.target.value)}
                        placeholder={feedback === "yes" ? "What was most helpful? Anything missing?" : "What would have made it more useful?"}
                        rows={3}
                        style={{
                          width: "100%", fontFamily: font, fontSize: 14, color: colors.text,
                          background: colors.surface, border: `1px solid ${colors.border}`,
                          borderRadius: 10, padding: "12px 16px", outline: "none", resize: "vertical",
                          transition: "border-color 0.2s", boxSizing: "border-box",
                        }}
                        onFocus={e => e.target.style.borderColor = colors.accent}
                        onBlur={e => e.target.style.borderColor = colors.border}
                      />
                      <button onClick={() => setFeedbackSubmitted(true)} style={{
                        fontFamily: font, fontSize: 13, fontWeight: 600, color: colors.text,
                        background: colors.surfaceLight, border: `1px solid ${colors.border}`,
                        borderRadius: 10, padding: "10px 20px", cursor: "pointer", marginTop: 10,
                        transition: "all 0.2s",
                      }}>
                        Submit Feedback
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: colors.accent + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🙏</div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: colors.text, margin: "0 0 2px" }}>Thanks for the feedback!</p>
                    <p style={{ fontSize: 13, color: colors.textMid, margin: 0 }}>This helps us build a better tool for the adventure community.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
