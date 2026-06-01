import React, { useState, useEffect, useMemo } from "react";
import { sGet, sSet } from "./supabase";
import {
  Lock, Check, ChevronLeft, ChevronRight, Flame,
  LogOut, Moon, Droplets, Dumbbell, Heart, Zap,
  Wind, Activity, DollarSign, BookOpen, TrendingUp,
} from "lucide-react";

// ─── Theme ───────────────────────────────────────────────────────────────────
const CSS = `
  :root {
    --bg: #0f1117;
    --surface: #1a1d27;
    --surface2: #22263a;
    --border: #2e3248;
    --accent: #4f8ef7;
    --accent2: #7c5cbf;
    --green: #34d399;
    --red: #f87171;
    --yellow: #fbbf24;
    --text: #e8eaf6;
    --muted: #8892b0;
    --radius: 14px;
    --font: 'Inter', system-ui, sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: var(--font); min-height: 100vh; }

  .app { max-width: 480px; margin: 0 auto; padding: 16px; }

  /* Login */
  .login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .login-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 40px 32px; width: 100%; max-width: 380px; }
  .login-title { font-size: 26px; font-weight: 700; text-align: center; margin-bottom: 6px; }
  .login-sub { color: var(--muted); text-align: center; font-size: 14px; margin-bottom: 28px; }
  .login-input { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; color: var(--text); font-size: 15px; outline: none; margin-bottom: 12px; }
  .login-input:focus { border-color: var(--accent); }
  .login-btn { width: 100%; background: var(--accent); color: #fff; border: none; border-radius: 10px; padding: 13px; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .login-btn:hover { opacity: 0.9; }
  .login-err { color: var(--red); font-size: 13px; text-align: center; margin-top: 8px; }

  /* Header */
  .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
  .header-title { font-size: 20px; font-weight: 700; }
  .header-streak { display: flex; align-items: center; gap: 6px; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 6px 14px; font-size: 14px; font-weight: 600; color: var(--yellow); }
  .logout-btn { background: none; border: 1px solid var(--border); border-radius: 8px; color: var(--muted); padding: 6px 12px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px; }
  .logout-btn:hover { border-color: var(--red); color: var(--red); }

  /* Date nav */
  .date-nav { display: flex; align-items: center; justify-content: space-between; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 18px; margin-bottom: 16px; }
  .date-nav-btn { background: none; border: none; color: var(--muted); cursor: pointer; padding: 4px; border-radius: 6px; display: flex; }
  .date-nav-btn:hover { color: var(--text); background: var(--surface2); }
  .date-center { text-align: center; }
  .date-label { font-size: 16px; font-weight: 700; }
  .date-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .date-today-btn { font-size: 11px; color: var(--accent); background: none; border: none; cursor: pointer; margin-top: 3px; display: block; }

  /* Progress bar */
  .progress-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px 18px; margin-bottom: 16px; }
  .progress-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .progress-label { font-size: 13px; color: var(--muted); }
  .progress-pct { font-size: 15px; font-weight: 700; color: var(--green); }
  .progress-bar-bg { height: 8px; background: var(--surface2); border-radius: 4px; overflow: hidden; }
  .progress-bar-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--green)); border-radius: 4px; transition: width 0.4s ease; }

  /* Habit cards */
  .habit-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
  .habit-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; transition: border-color 0.2s; }
  .habit-card.done { border-color: var(--green); }
  .habit-card.partial { border-color: var(--accent); }
  .habit-row { display: flex; align-items: center; gap: 12px; padding: 14px 16px; cursor: pointer; user-select: none; }
  .habit-row:hover { background: var(--surface2); }
  .habit-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .habit-label { flex: 1; font-size: 15px; font-weight: 500; }
  .habit-check { width: 24px; height: 24px; border-radius: 6px; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; }
  .habit-check.on { background: var(--green); border-color: var(--green); }

  /* Star rating */
  .star-row { display: flex; gap: 6px; padding: 0 16px 14px; }
  .star { font-size: 24px; cursor: pointer; transition: transform 0.1s; color: var(--border); }
  .star.on { color: var(--yellow); }
  .star:hover { transform: scale(1.2); }
  .star-label { font-size: 12px; color: var(--muted); padding: 0 16px 10px; }

  /* Money toggle */
  .money-row { display: flex; gap: 10px; padding: 0 16px 14px; }
  .money-btn { flex: 1; padding: 10px; border-radius: 10px; border: 2px solid var(--border); background: none; color: var(--muted); font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
  .money-btn.save.on { border-color: var(--green); background: rgba(52,211,153,0.1); color: var(--green); }
  .money-btn.spend.on { border-color: var(--red); background: rgba(248,113,113,0.1); color: var(--red); }
  .money-btn:hover { border-color: var(--muted); }

  /* Workout notes */
  .workout-notes { padding: 0 16px 14px; }
  .workout-textarea { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; color: var(--text); font-size: 13px; resize: none; outline: none; font-family: var(--font); min-height: 72px; }
  .workout-textarea:focus { border-color: var(--accent); }
  .workout-textarea::placeholder { color: var(--muted); }

  /* Calendar */
  .calendar-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; margin-bottom: 20px; }
  .cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .cal-title { font-size: 15px; font-weight: 700; }
  .cal-nav { background: none; border: none; color: var(--muted); cursor: pointer; padding: 4px; border-radius: 6px; }
  .cal-nav:hover { color: var(--text); }
  .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
  .cal-dow { text-align: center; font-size: 11px; color: var(--muted); padding: 4px 0; font-weight: 600; }
  .cal-day { aspect-ratio: 1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; cursor: pointer; transition: all 0.15s; position: relative; }
  .cal-day.empty { cursor: default; }
  .cal-day.future { color: var(--muted); cursor: default; }
  .cal-day.today { font-weight: 700; border: 2px solid var(--accent); }
  .cal-day.selected { background: var(--accent); color: #fff; }
  .cal-day.full { background: rgba(52,211,153,0.2); color: var(--green); }
  .cal-day.partial-day { background: rgba(79,142,247,0.15); color: var(--accent); }
  .cal-day:not(.empty):not(.future):hover { background: var(--surface2); }

  /* Stats */
  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; }
  .stat-val { font-size: 26px; font-weight: 800; color: var(--accent); }
  .stat-label { font-size: 12px; color: var(--muted); margin-top: 4px; }

  /* Section title */
  .section-title { font-size: 13px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
`;

// ─── Habits config ────────────────────────────────────────────────────────────
const HABITS = [
  { id: "sleep",     label: "8+ hrs of Sleep",      type: "check",   icon: Moon,       color: "#7c5cbf", bg: "rgba(124,92,191,0.15)" },
  { id: "workout",   label: "Workout",               type: "workout", icon: Dumbbell,   color: "#f87171", bg: "rgba(248,113,113,0.15)" },
  { id: "cardio",    label: "Cardio",                type: "check",   icon: Wind,       color: "#4f8ef7", bg: "rgba(79,142,247,0.15)" },
  { id: "mobility",  label: "Mobility",              type: "check",   icon: Activity,   color: "#34d399", bg: "rgba(52,211,153,0.15)" },
  { id: "water",     label: "100+ oz of Water",      type: "check",   icon: Droplets,   color: "#38bdf8", bg: "rgba(56,189,248,0.15)" },
  { id: "nutrition", label: "Nutrition Quality",     type: "stars",   icon: BookOpen,   color: "#fbbf24", bg: "rgba(251,191,36,0.15)" },
  { id: "energy",    label: "Energy Level",          type: "stars",   icon: Zap,        color: "#f97316", bg: "rgba(249,115,22,0.15)" },
  { id: "mental",    label: "Mental Health",         type: "stars",   icon: Heart,      color: "#ec4899", bg: "rgba(236,72,153,0.15)" },
  { id: "money",     label: "Spend vs Save",         type: "money",   icon: DollarSign, color: "#a3e635", bg: "rgba(163,230,53,0.15)" },
];

const TOTAL = HABITS.length;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const keyOf = (d: Date) => d.toISOString().slice(0, 10);
const today = () => new Date();
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const isFuture = (d: Date) => d > today();

function scoreDay(entry: any): number {
  if (!entry) return 0;
  let done = 0;
  for (const h of HABITS) {
    if (h.type === "check" || h.type === "workout") { if (entry.checks?.[h.id]) done++; }
    else if (h.type === "stars") { if ((entry[h.id] || 0) > 0) done++; }
    else if (h.type === "money") { if (entry.money) done++; }
  }
  return done;
}

function sha256(s: string): Promise<string> {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(s))
    .then(b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, "0")).join(""));
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-row">
      {[1,2,3,4,5].map(i => (
        <span
          key={i}
          className={"star" + (i <= (hover || value) ? " on" : "")}
          onClick={() => onChange(i === value ? 0 : i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
        >★</span>
      ))}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [booted, setBooted] = useState(false);
  const [days, setDays] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState(today());
  const [calMonth, setCalMonth] = useState(() => { const d = today(); d.setDate(1); return d; });
  const [saving, setSaving] = useState(false);

  // Boot
  useEffect(() => {
    (async () => {
      const auth = await sGet("dt_auth");
      if (auth) setAuthed(true);
      const saved = await sGet("dt_days");
      if (saved) setDays(saved as any);
      setBooted(true);
    })();
  }, []);

  // Login
  async function handleLogin() {
    if (!pw.trim()) return;
    const hash = await sha256(pw.trim());
    const stored = await sGet("dt_pw");
    if (!stored) {
      // First time — set password
      await sSet("dt_pw", hash);
      await sSet("dt_auth", true);
      setAuthed(true);
    } else if (stored === hash) {
      await sSet("dt_auth", true);
      setAuthed(true);
    } else {
      setPwErr("Incorrect password");
    }
  }

  async function handleLogout() {
    await sSet("dt_auth", false);
    setAuthed(false);
    setPw("");
  }

  // Save days to Supabase
  async function saveDay(newDays: Record<string, any>) {
    setDays(newDays);
    setSaving(true);
    await sSet("dt_days", newDays);
    setSaving(false);
  }

  const dateKey = keyOf(selectedDate);
  const entry = days[dateKey] || {};
  const isToday = keyOf(selectedDate) === keyOf(today());
  const locked = isFuture(selectedDate);

  function updateEntry(updater: (e: any) => any) {
    if (locked) return;
    const updated = { ...days, [dateKey]: updater({ ...entry }) };
    saveDay(updated);
  }

  function toggleCheck(id: string) {
    updateEntry(e => { e.checks = { ...e.checks, [id]: !e.checks?.[id] }; return e; });
  }
  function setStars(id: string, v: number) {
    updateEntry(e => { e[id] = v; return e; });
  }
  function setMoney(v: string) {
    updateEntry(e => { e.money = e.money === v ? null : v; return e; });
  }
  function setWorkoutNotes(v: string) {
    updateEntry(e => { e.workoutNotes = v; return e; });
  }

  // Streak
  const streak = useMemo(() => {
    let s = 0;
    let d = today();
    // if today isn't done yet, start from yesterday
    if (scoreDay(days[keyOf(d)]) < TOTAL) d = addDays(d, -1);
    while (true) {
      const k = keyOf(d);
      if (scoreDay(days[k]) === TOTAL) { s++; d = addDays(d, -1); }
      else break;
    }
    return s;
  }, [days]);

  // Monthly completion for calendar
  const calDays = useMemo(() => {
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const first = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: Date | null; score: number }> = [];
    for (let i = 0; i < first; i++) cells.push({ date: null, score: 0 });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const score = scoreDay(days[keyOf(date)]);
      cells.push({ date, score });
    }
    return cells;
  }, [calMonth, days]);

  // Stats
  const stats = useMemo(() => {
    const last30 = Array.from({ length: 30 }, (_, i) => addDays(today(), -i)).map(d => days[keyOf(d)]);
    const perfect = last30.filter(e => scoreDay(e) === TOTAL).length;
    const avgScore = last30.reduce((s, e) => s + scoreDay(e), 0) / 30;
    return { perfect, avgPct: Math.round((avgScore / TOTAL) * 100) };
  }, [days]);

  if (!booted) return <div style={{ minHeight: "100vh", background: "#0f1117" }} />;

  if (!authed) return (
    <>
      <style>{CSS}</style>
      <div className="login-wrap">
        <div className="login-card">
          <div className="login-title">Daily Tracker</div>
          <div className="login-sub">Enter your password to continue</div>
          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={pw}
            onChange={e => { setPw(e.target.value); setPwErr(""); }}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            autoFocus
          />
          <button className="login-btn" onClick={handleLogin}>
            <Lock size={16} /> Enter
          </button>
          {pwErr && <div className="login-err">{pwErr}</div>}
          {!saving && <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 12 }}>
            First time? Enter any password to set it.
          </div>}
        </div>
      </div>
    </>
  );

  const score = scoreDay(entry);
  const pct = Math.round((score / TOTAL) * 100);

  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        {/* Header */}
        <div className="header">
          <div>
            <div className="header-title">Daily Tracker</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{saving ? "Saving…" : "All synced"}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div className="header-streak">
              <Flame size={14} /> {streak}d
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={13} /> Out
            </button>
          </div>
        </div>

        {/* Date nav */}
        <div className="date-nav">
          <button className="date-nav-btn" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
            <ChevronLeft size={20} />
          </button>
          <div className="date-center">
            <div className="date-label">
              {selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </div>
            {!isToday && (
              <button className="date-today-btn" onClick={() => setSelectedDate(today())}>Back to today</button>
            )}
          </div>
          <button className="date-nav-btn" onClick={() => !isFuture(addDays(selectedDate, 1)) && setSelectedDate(addDays(selectedDate, 1))}
            style={{ opacity: isFuture(addDays(selectedDate, 1)) ? 0.3 : 1 }}>
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Progress */}
        <div className="progress-wrap">
          <div className="progress-top">
            <span className="progress-label">{score} of {TOTAL} habits done</span>
            <span className="progress-pct">{pct}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Habits */}
        <div className="section-title">Today's Habits</div>
        <div className="habit-list">
          {HABITS.map(h => {
            const Icon = h.icon;
            const checked = h.type === "check" || h.type === "workout" ? !!entry.checks?.[h.id] : false;
            const starVal = h.type === "stars" ? (entry[h.id] || 0) : 0;
            const isDone = h.type === "check" || h.type === "workout" ? checked
              : h.type === "stars" ? starVal > 0
              : h.type === "money" ? !!entry.money : false;

            return (
              <div key={h.id} className={"habit-card" + (isDone ? " done" : "")}>
                {/* Main row */}
                <div
                  className="habit-row"
                  onClick={() => {
                    if (locked) return;
                    if (h.type === "check" || h.type === "workout") toggleCheck(h.id);
                  }}
                  style={{ cursor: locked ? "default" : h.type === "stars" || h.type === "money" ? "default" : "pointer" }}
                >
                  <div className="habit-icon" style={{ background: h.bg }}>
                    <Icon size={18} color={h.color} />
                  </div>
                  <span className="habit-label">{h.label}</span>
                  {(h.type === "check" || h.type === "workout") && (
                    <div className={"habit-check" + (checked ? " on" : "")}>
                      {checked && <Check size={14} color="#fff" strokeWidth={3} />}
                    </div>
                  )}
                  {h.type === "stars" && (
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>
                      {starVal > 0 ? `${starVal}/5` : "tap stars"}
                    </span>
                  )}
                  {h.type === "money" && (
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>
                      {entry.money ? (entry.money === "save" ? "💚 Saved" : "🔴 Spent") : "pick one"}
                    </span>
                  )}
                </div>

                {/* Star rating expanded */}
                {h.type === "stars" && !locked && (
                  <>
                    <Stars value={starVal} onChange={v => setStars(h.id, v)} />
                    <div className="star-label">
                      {starVal === 0 ? "Not rated" : starVal === 1 ? "Poor" : starVal === 2 ? "Fair" : starVal === 3 ? "Good" : starVal === 4 ? "Great" : "Excellent"}
                    </div>
                  </>
                )}

                {/* Money toggle */}
                {h.type === "money" && !locked && (
                  <div className="money-row">
                    <button className={"money-btn save" + (entry.money === "save" ? " on" : "")} onClick={() => setMoney("save")}>
                      💚 Saved Money
                    </button>
                    <button className={"money-btn spend" + (entry.money === "spend" ? " on" : "")} onClick={() => setMoney("spend")}>
                      🔴 Spent Money
                    </button>
                  </div>
                )}

                {/* Workout notes — show when checked */}
                {h.type === "workout" && checked && !locked && (
                  <div className="workout-notes">
                    <textarea
                      className="workout-textarea"
                      placeholder="What did you do? e.g. Bench 3×10 @ 185, ran 2 miles, leg day…"
                      value={entry.workoutNotes || ""}
                      onChange={e => setWorkoutNotes(e.target.value)}
                      onClick={e => e.stopPropagation()}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="section-title">Last 30 Days</div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-val">{stats.perfect}</div>
            <div className="stat-label">Perfect days</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{stats.avgPct}%</div>
            <div className="stat-label">Avg completion</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{streak}</div>
            <div className="stat-label">Current streak</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{TOTAL}</div>
            <div className="stat-label">Habits tracked</div>
          </div>
        </div>

        {/* Calendar */}
        <div className="section-title">Calendar</div>
        <div className="calendar-wrap">
          <div className="cal-header">
            <button className="cal-nav" onClick={() => setCalMonth(d => { const x = new Date(d); x.setMonth(x.getMonth() - 1); return x; })}>
              <ChevronLeft size={18} />
            </button>
            <div className="cal-title">
              {calMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </div>
            <button className="cal-nav" onClick={() => setCalMonth(d => { const x = new Date(d); x.setMonth(x.getMonth() + 1); return x; })}>
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="cal-grid">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
              <div key={d} className="cal-dow">{d}</div>
            ))}
            {calDays.map((cell, i) => {
              if (!cell.date) return <div key={i} className="cal-day empty" />;
              const isSelected = keyOf(cell.date) === keyOf(selectedDate);
              const isTod = keyOf(cell.date) === keyOf(today());
              const fut = isFuture(cell.date);
              const full = !fut && cell.score === TOTAL;
              const partial = !fut && cell.score > 0 && cell.score < TOTAL;
              let cls = "cal-day";
              if (fut) cls += " future";
              else if (isSelected) cls += " selected";
              else if (full) cls += " full";
              else if (partial) cls += " partial-day";
              if (isTod && !isSelected) cls += " today";
              return (
                <div key={i} className={cls} onClick={() => !fut && setSelectedDate(cell.date!)}>
                  {cell.date.getDate()}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ height: 32 }} />
      </div>
    </>
  );
}
