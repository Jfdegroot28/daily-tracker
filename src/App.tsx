import React, { useState, useEffect, useMemo } from "react";
import { signUp, signIn, signOut, getSession, sGet, sSet, supabase } from "./supabase";
import {
  Check, ChevronLeft, ChevronRight, Flame,
  LogOut, Moon, Droplets, Dumbbell, Heart, Zap,
  Wind, Activity, DollarSign, BookOpen, Sparkles, Mail, Lock,
} from "lucide-react";

const CSS = `
  :root {
    --bg: #0f1117;
    --surface: #1a1d27;
    --surface2: #22263a;
    --border: #2e3248;
    --accent: #4f8ef7;
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

  .auth-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .auth-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 40px 32px; width: 100%; max-width: 380px; }
  .auth-title { font-size: 26px; font-weight: 700; text-align: center; margin-bottom: 6px; }
  .auth-sub { color: var(--muted); text-align: center; font-size: 14px; margin-bottom: 28px; }
  .auth-input { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; color: var(--text); font-size: 15px; outline: none; margin-bottom: 12px; font-family: var(--font); }
  .auth-input:focus { border-color: var(--accent); }
  .auth-input::placeholder { color: var(--muted); }
  .auth-btn { width: 100%; background: var(--accent); color: #fff; border: none; border-radius: 10px; padding: 13px; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px; }
  .auth-btn:hover { opacity: 0.9; }
  .auth-btn:disabled { opacity: 0.5; cursor: default; }
  .auth-switch { text-align: center; font-size: 13px; color: var(--muted); }
  .auth-switch button { background: none; border: none; color: var(--accent); cursor: pointer; font-size: 13px; text-decoration: underline; }
  .auth-err { color: var(--red); font-size: 13px; text-align: center; margin-bottom: 10px; }
  .auth-ok { color: var(--green); font-size: 13px; text-align: center; margin-bottom: 10px; }

  .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
  .header-title { font-size: 20px; font-weight: 700; }
  .header-email { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .header-streak { display: flex; align-items: center; gap: 6px; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 6px 14px; font-size: 14px; font-weight: 600; color: var(--yellow); }
  .logout-btn { background: none; border: 1px solid var(--border); border-radius: 8px; color: var(--muted); padding: 6px 12px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px; }
  .logout-btn:hover { border-color: var(--red); color: var(--red); }

  .date-nav { display: flex; align-items: center; justify-content: space-between; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 18px; margin-bottom: 16px; }
  .date-nav-btn { background: none; border: none; color: var(--muted); cursor: pointer; padding: 4px; border-radius: 6px; display: flex; }
  .date-nav-btn:hover { color: var(--text); background: var(--surface2); }
  .date-center { text-align: center; }
  .date-label { font-size: 16px; font-weight: 700; }
  .date-today-btn { font-size: 11px; color: var(--accent); background: none; border: none; cursor: pointer; margin-top: 3px; display: block; }

  .progress-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px 18px; margin-bottom: 16px; }
  .progress-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .progress-label { font-size: 13px; color: var(--muted); }
  .progress-pct { font-size: 15px; font-weight: 700; color: var(--green); }
  .progress-bar-bg { height: 8px; background: var(--surface2); border-radius: 4px; overflow: hidden; }
  .progress-bar-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--green)); border-radius: 4px; transition: width 0.4s ease; }

  .habit-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
  .habit-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; transition: border-color 0.2s; }
  .habit-card.done { border-color: var(--green); }
  .habit-row { display: flex; align-items: center; gap: 12px; padding: 14px 16px; cursor: pointer; user-select: none; }
  .habit-row:hover { background: var(--surface2); }
  .habit-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .habit-label { flex: 1; font-size: 15px; font-weight: 500; }
  .habit-check { width: 24px; height: 24px; border-radius: 6px; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; }
  .habit-check.on { background: var(--green); border-color: var(--green); }

  .star-row { display: flex; gap: 6px; padding: 0 16px 14px; }
  .star { font-size: 24px; cursor: pointer; transition: transform 0.1s; color: var(--border); }
  .star.on { color: var(--yellow); }
  .star:hover { transform: scale(1.2); }
  .star-label { font-size: 12px; color: var(--muted); padding: 0 16px 10px; }

  .money-row { display: flex; gap: 10px; padding: 0 16px 14px; }
  .money-btn { flex: 1; padding: 10px; border-radius: 10px; border: 2px solid var(--border); background: none; color: var(--muted); font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
  .money-btn.save.on { border-color: var(--green); background: rgba(52,211,153,0.1); color: var(--green); }
  .money-btn.spend.on { border-color: var(--red); background: rgba(248,113,113,0.1); color: var(--red); }

  .workout-notes { padding: 0 16px 14px; }
  .workout-textarea { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; color: var(--text); font-size: 13px; resize: none; outline: none; font-family: var(--font); min-height: 72px; }
  .workout-textarea:focus { border-color: var(--accent); }
  .workout-textarea::placeholder { color: var(--muted); }

  .gratitude-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; margin-bottom: 20px; }
  .gratitude-card.has-entries { border-color: #f59e0b; }
  .gratitude-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
  .gratitude-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(245,158,11,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .gratitude-title { font-size: 15px; font-weight: 500; flex: 1; }
  .gratitude-count { font-size: 12px; color: var(--muted); }
  .gratitude-items { display: flex; flex-direction: column; gap: 8px; }
  .gratitude-item { display: flex; align-items: flex-start; gap: 10px; }
  .gratitude-num { width: 24px; height: 24px; border-radius: 50%; background: rgba(245,158,11,0.15); color: #f59e0b; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 9px; }
  .gratitude-input { flex: 1; background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; color: var(--text); font-size: 13px; resize: none; outline: none; font-family: var(--font); min-height: 44px; line-height: 1.5; }
  .gratitude-input:focus { border-color: #f59e0b; }
  .gratitude-input::placeholder { color: var(--muted); }
  .gratitude-input:disabled { opacity: 0.5; cursor: default; }

  .calendar-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; margin-bottom: 20px; }
  .cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .cal-title { font-size: 15px; font-weight: 700; }
  .cal-nav { background: none; border: none; color: var(--muted); cursor: pointer; padding: 4px; border-radius: 6px; }
  .cal-nav:hover { color: var(--text); }
  .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
  .cal-dow { text-align: center; font-size: 11px; color: var(--muted); padding: 4px 0; font-weight: 600; }
  .cal-day { aspect-ratio: 1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; cursor: pointer; transition: all 0.15s; }
  .cal-day.empty { cursor: default; }
  .cal-day.future { color: var(--muted); cursor: default; }
  .cal-day.today { font-weight: 700; border: 2px solid var(--accent); }
  .cal-day.selected { background: var(--accent); color: #fff; }
  .cal-day.full { background: rgba(52,211,153,0.2); color: var(--green); }
  .cal-day.partial-day { background: rgba(79,142,247,0.15); color: var(--accent); }
  .cal-day:not(.empty):not(.future):hover { background: var(--surface2); }

  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; }
  .stat-val { font-size: 26px; font-weight: 800; color: var(--accent); }
  .stat-label { font-size: 12px; color: var(--muted); margin-top: 4px; }
  .section-title { font-size: 13px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
`;

const HABITS = [
  { id: "sleep",     label: "8+ hrs of Sleep",  type: "check",   icon: Moon,       color: "#7c5cbf", bg: "rgba(124,92,191,0.15)" },
  { id: "workout",   label: "Workout",           type: "workout", icon: Dumbbell,   color: "#f87171", bg: "rgba(248,113,113,0.15)" },
  { id: "cardio",    label: "Cardio",            type: "check",   icon: Wind,       color: "#4f8ef7", bg: "rgba(79,142,247,0.15)" },
  { id: "mobility",  label: "Mobility",          type: "check",   icon: Activity,   color: "#34d399", bg: "rgba(52,211,153,0.15)" },
  { id: "water",     label: "100+ oz of Water",  type: "check",   icon: Droplets,   color: "#38bdf8", bg: "rgba(56,189,248,0.15)" },
  { id: "nutrition", label: "Nutrition Quality", type: "stars",   icon: BookOpen,   color: "#fbbf24", bg: "rgba(251,191,36,0.15)" },
  { id: "energy",    label: "Energy Level",      type: "stars",   icon: Zap,        color: "#f97316", bg: "rgba(249,115,22,0.15)" },
  { id: "mental",    label: "Mental Health",     type: "stars",   icon: Heart,      color: "#ec4899", bg: "rgba(236,72,153,0.15)" },
  { id: "money",     label: "Spend vs Save",     type: "money",   icon: DollarSign, color: "#a3e635", bg: "rgba(163,230,53,0.15)" },
];

const TOTAL = HABITS.length;

const keyOf = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const today = () => new Date();
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const isFuture = (d: Date) => {
  const t = today();
  return d.getFullYear() > t.getFullYear() ||
    (d.getFullYear() === t.getFullYear() && d.getMonth() > t.getMonth()) ||
    (d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() > t.getDate());
};

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

function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-row">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={"star" + (i <= (hover || value) ? " on" : "")}
          onClick={() => onChange(i === value ? 0 : i)}
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}>★</span>
      ))}
    </div>
  );
}

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [booted, setBooted] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authErr, setAuthErr] = useState("");
  const [authOk, setAuthOk] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [days, setDays] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState(today());
  const [calMonth, setCalMonth] = useState(() => { const d = today(); d.setDate(1); return d; });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email ?? "");
        const saved = await sGet(session.user.id, "dt_days");
        if (saved) setDays(saved as any);
      }
      setBooted(true);
    })();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email ?? "");
        const saved = await sGet(session.user.id, "dt_days");
        if (saved) setDays(saved as any);
      } else {
        setUserId(null);
        setUserEmail("");
        setDays({});
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleAuth() {
    if (!email.trim() || !password.trim()) return;
    setAuthLoading(true); setAuthErr(""); setAuthOk("");
    try {
      if (mode === "signup") {
        await signUp(email.trim(), password);
        setAuthOk("Account created! You can now sign in.");
        setMode("signin");
      } else {
        await signIn(email.trim(), password);
      }
    } catch (e: any) {
      setAuthErr(e.message ?? "Something went wrong");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() { await signOut(); }

  async function saveDay(uid: string, newDays: Record<string, any>) {
    setDays(newDays);
    setSaving(true);
    await sSet(uid, "dt_days", newDays);
    setSaving(false);
  }

  const dateKey = keyOf(selectedDate);
  const entry = days[dateKey] || {};
  const isToday = keyOf(selectedDate) === keyOf(today());
  const locked = isFuture(selectedDate);

  function updateEntry(updater: (e: any) => any) {
    if (locked || !userId) return;
    const updated = { ...days, [dateKey]: updater({ ...entry }) };
    saveDay(userId, updated);
  }

  function toggleCheck(id: string) { updateEntry(e => { e.checks = { ...e.checks, [id]: !e.checks?.[id] }; return e; }); }
  function setStars(id: string, v: number) { updateEntry(e => { e[id] = v; return e; }); }
  function setMoney(v: string) { updateEntry(e => { e.money = e.money === v ? null : v; return e; }); }
  function setWorkoutNotes(v: string) { updateEntry(e => { e.workoutNotes = v; return e; }); }
  function setGratitude(index: number, v: string) {
    updateEntry(e => {
      const g = [...(e.gratitude || ["", "", ""])];
      g[index] = v; e.gratitude = g; return e;
    });
  }

  const streak = useMemo(() => {
    let s = 0, d = today();
    if (scoreDay(days[keyOf(d)]) < TOTAL) d = addDays(d, -1);
    while (true) {
      if (scoreDay(days[keyOf(d)]) === TOTAL) { s++; d = addDays(d, -1); } else break;
    }
    return s;
  }, [days]);

  const calDays = useMemo(() => {
    const year = calMonth.getFullYear(), month = calMonth.getMonth();
    const first = new Date(year, month, 1).getDay();
    const dim = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: Date | null; score: number }> = [];
    for (let i = 0; i < first; i++) cells.push({ date: null, score: 0 });
    for (let d = 1; d <= dim; d++) {
      const date = new Date(year, month, d);
      cells.push({ date, score: scoreDay(days[keyOf(date)]) });
    }
    return cells;
  }, [calMonth, days]);

  const stats = useMemo(() => {
    const last30 = Array.from({ length: 30 }, (_, i) => addDays(today(), -i)).map(d => days[keyOf(d)]);
    const perfect = last30.filter(e => scoreDay(e) === TOTAL).length;
    const avgScore = last30.reduce((s, e) => s + scoreDay(e), 0) / 30;
    return { perfect, avgPct: Math.round((avgScore / TOTAL) * 100) };
  }, [days]);

  if (!booted) return <div style={{ minHeight: "100vh", background: "#0f1117" }} />;

  if (!userId) return (
    <>
      <style>{CSS}</style>
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="auth-title">Daily Tracker</div>
          <div className="auth-sub">{mode === "signin" ? "Sign in to your account" : "Create your account"}</div>
          {authErr && <div className="auth-err">{authErr}</div>}
          {authOk && <div className="auth-ok">{authOk}</div>}
          <input className="auth-input" type="email" placeholder="Email" value={email}
            onChange={e => { setEmail(e.target.value); setAuthErr(""); }}
            onKeyDown={e => e.key === "Enter" && handleAuth()} autoFocus />
          <input className="auth-input" type="password" placeholder="Password" value={password}
            onChange={e => { setPassword(e.target.value); setAuthErr(""); }}
            onKeyDown={e => e.key === "Enter" && handleAuth()} />
          <button className="auth-btn" onClick={handleAuth} disabled={authLoading}>
            <Mail size={16} />
            {authLoading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
          <div className="auth-switch">
            {mode === "signin"
              ? <>Don't have an account? <button onClick={() => { setMode("signup"); setAuthErr(""); setAuthOk(""); }}>Sign up</button></>
              : <>Already have an account? <button onClick={() => { setMode("signin"); setAuthErr(""); setAuthOk(""); }}>Sign in</button></>
            }
          </div>
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
        <div className="header">
          <div>
            <div className="header-title">Daily Tracker</div>
            <div className="header-email">{userEmail}</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>{saving ? "Saving…" : "All synced"}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div className="header-streak"><Flame size={14} /> {streak}d</div>
            <button className="logout-btn" onClick={handleLogout}><LogOut size={13} /> Out</button>
          </div>
        </div>

        <div className="date-nav">
          <button className="date-nav-btn" onClick={() => setSelectedDate(addDays(selectedDate, -1))}><ChevronLeft size={20} /></button>
          <div className="date-center">
            <div className="date-label">{selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</div>
            {!isToday && <button className="date-today-btn" onClick={() => setSelectedDate(today())}>Back to today</button>}
          </div>
          <button className="date-nav-btn"
            onClick={() => !isFuture(addDays(selectedDate, 1)) && setSelectedDate(addDays(selectedDate, 1))}
            style={{ opacity: isFuture(addDays(selectedDate, 1)) ? 0.3 : 1 }}>
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="progress-wrap">
          <div className="progress-top">
            <span className="progress-label">{score} of {TOTAL} habits done</span>
            <span className="progress-pct">{pct}%</span>
          </div>
          <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${pct}%` }} /></div>
        </div>

        <div className="section-title">Today's Habits</div>
        <div className="habit-list">
          {HABITS.map(h => {
            const Icon = h.icon;
            const checked = h.type === "check" || h.type === "workout" ? !!entry.checks?.[h.id] : false;
            const starVal = h.type === "stars" ? (entry[h.id] || 0) : 0;
            const isDone = h.type === "check" || h.type === "workout" ? checked : h.type === "stars" ? starVal > 0 : h.type === "money" ? !!entry.money : false;
            return (
              <div key={h.id} className={"habit-card" + (isDone ? " done" : "")}>
                <div className="habit-row"
                  onClick={() => { if (locked) return; if (h.type === "check" || h.type === "workout") toggleCheck(h.id); }}
                  style={{ cursor: locked ? "default" : h.type === "stars" || h.type === "money" ? "default" : "pointer" }}>
                  <div className="habit-icon" style={{ background: h.bg }}><Icon size={18} color={h.color} /></div>
                  <span className="habit-label">{h.label}</span>
                  {(h.type === "check" || h.type === "workout") && (
                    <div className={"habit-check" + (checked ? " on" : "")}>{checked && <Check size={14} color="#fff" strokeWidth={3} />}</div>
                  )}
                  {h.type === "stars" && <span style={{ fontSize: 12, color: "var(--muted)" }}>{starVal > 0 ? `${starVal}/5` : "tap stars"}</span>}
                  {h.type === "money" && <span style={{ fontSize: 12, color: "var(--muted)" }}>{entry.money ? (entry.money === "save" ? "💚 Saved" : "🔴 Spent") : "pick one"}</span>}
                </div>
                {h.type === "stars" && !locked && (
                  <><Stars value={starVal} onChange={v => setStars(h.id, v)} />
                  <div className="star-label">{starVal === 0 ? "Not rated" : starVal === 1 ? "Poor" : starVal === 2 ? "Fair" : starVal === 3 ? "Good" : starVal === 4 ? "Great" : "Excellent"}</div></>
                )}
                {h.type === "money" && !locked && (
                  <div className="money-row">
                    <button className={"money-btn save" + (entry.money === "save" ? " on" : "")} onClick={() => setMoney("save")}>💚 Saved Money</button>
                    <button className={"money-btn spend" + (entry.money === "spend" ? " on" : "")} onClick={() => setMoney("spend")}>🔴 Spent Money</button>
                  </div>
                )}
                {h.type === "workout" && checked && !locked && (
                  <div className="workout-notes">
                    <textarea className="workout-textarea" placeholder="What did you do? e.g. Bench 3×10 @ 185, ran 2 miles…"
                      value={entry.workoutNotes || ""} onChange={e => setWorkoutNotes(e.target.value)} onClick={e => e.stopPropagation()} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="section-title">Gratitude</div>
        {(() => {
          const gratitude: string[] = entry.gratitude || ["", "", ""];
          const filledCount = gratitude.filter((g: string) => g.trim().length > 0).length;
          return (
            <div className={"gratitude-card" + (filledCount > 0 ? " has-entries" : "")}>
              <div className="gratitude-header">
                <div className="gratitude-icon"><Sparkles size={18} color="#f59e0b" /></div>
                <span className="gratitude-title">What are you grateful for today?</span>
                <span className="gratitude-count">{filledCount}/3</span>
              </div>
              <div className="gratitude-items">
                {[0, 1, 2].map(i => (
                  <div key={i} className="gratitude-item">
                    <div className="gratitude-num">{i + 1}</div>
                    <textarea className="gratitude-input"
                      placeholder={i === 0 ? "I'm grateful for…" : i === 1 ? "Something that made me smile…" : "A person or moment I appreciate…"}
                      value={gratitude[i] || ""} onChange={e => setGratitude(i, e.target.value)} disabled={locked} rows={2} />
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        <div className="section-title">Last 30 Days</div>
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-val">{stats.perfect}</div><div className="stat-label">Perfect days</div></div>
          <div className="stat-card"><div className="stat-val">{stats.avgPct}%</div><div className="stat-label">Avg completion</div></div>
          <div className="stat-card"><div className="stat-val">{streak}</div><div className="stat-label">Current streak</div></div>
          <div className="stat-card"><div className="stat-val">{TOTAL}</div><div className="stat-label">Habits tracked</div></div>
        </div>

        <div className="section-title">Calendar</div>
        <div className="calendar-wrap">
          <div className="cal-header">
            <button className="cal-nav" onClick={() => setCalMonth(d => { const x = new Date(d); x.setMonth(x.getMonth() - 1); return x; })}><ChevronLeft size={18} /></button>
            <div className="cal-title">{calMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</div>
            <button className="cal-nav" onClick={() => setCalMonth(d => { const x = new Date(d); x.setMonth(x.getMonth() + 1); return x; })}><ChevronRight size={18} /></button>
          </div>
          <div className="cal-grid">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d} className="cal-dow">{d}</div>)}
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
              return <div key={i} className={cls} onClick={() => !fut && setSelectedDate(cell.date!)}>{cell.date.getDate()}</div>;
            })}
          </div>
        </div>

        <div style={{ height: 32 }} />
      </div>
    </>
  );
}
