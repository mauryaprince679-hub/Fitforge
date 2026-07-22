import { useState } from 'react';
import { TrendingUp, TrendingDown, Plus, Activity, Minus, Sparkles, Dumbbell, Crown, ArrowUpRight, ArrowDownRight, CalendarDays, Target } from 'lucide-react';
import { PROGRESS_DATA, BENCH_PRESS_HISTORY, SQUAT_HISTORY, WORKOUT_HISTORY } from '../data';
import type { Page } from '../types';

type ProgressTab = 'body' | 'strength' | 'volume';
type SheetMode = 'weight' | 'measurement' | null;
type MeasurementKey = 'chest' | 'waist' | 'biceps';
type WeightEntry = { date: string; value: number };
type MeasurementEntry = { date: string; chest: number; waist: number; biceps: number };

const lbsToKg = (lbs: number) => Number((lbs * 0.453592).toFixed(1));
const kgToLbs = (kg: number) => Number((kg / 0.453592).toFixed(1));
const deltaLabel = (delta: number) => (delta >= 0 ? `Up ${Math.abs(delta).toFixed(1)} kg` : `Down ${Math.abs(delta).toFixed(1)} kg`);
const formatEntryDate = (date: string) => {
  const parsedDate = new Date(date);
  const today = new Date();
  const isToday = parsedDate.toDateString() === today.toDateString();
  return isToday ? 'Today' : parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function MiniLineChart({ data, color = '#10B981', height = 84 }: { data: number[]; color?: string; height?: number }) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 320;
  const h = height;
  const pad = 16;

  const points = data.map((value, index) => {
    const x = pad + (index / (data.length - 1)) * (w - pad * 2);
    const y = pad + ((max - value) / range) * (h - pad * 2);
    return { x, y, value };
  });

  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${h - pad} L ${points[0].x.toFixed(1)} ${h - pad} Z`;
  const startPoint = points[0];
  const endPoint = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="rgba(148,163,184,0.18)" strokeWidth="1" />
      <line x1={pad} y1={pad + 8} x2={w - pad} y2={pad + 8} stroke="rgba(148,163,184,0.12)" strokeWidth="1" />
      <path d={areaPath} fill={`url(#grad-${color.replace('#', '')})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={startPoint.x} cy={startPoint.y} r="3.5" fill="#F8FAFC" stroke={color} strokeWidth="2" />
      <circle cx={endPoint.x} cy={endPoint.y} r="4.5" fill={color} stroke="#F8FAFC" strokeWidth="2" />
      {points.map((point, index) => (
        <circle key={`${point.x}-${point.y}-${index}`} cx={point.x} cy={point.y} r="2.2" fill="rgba(255,255,255,0.86)" />
      ))}
    </svg>
  );
}

function BodyWeightChart({ weightEntries, onEdit }: { weightEntries: WeightEntry[]; onEdit: () => void }) {
  const [goal, setGoal] = useState<'lose' | 'gain'>('lose');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const history = weightEntries.map((entry, timelineIndex) => ({
    ...entry,
    timelineIndex,
    weight: lbsToKg(entry.value),
  }));
  const latestEntry = history[history.length - 1];
  const latest = latestEntry?.weight ?? 0;
  const prev = history[history.length - 2]?.weight ?? latest;
  const delta = latest - prev;
  const currentWeight = latest;
  const minWeight = Math.min(...history.map(entry => entry.weight), currentWeight);
  const maxWeight = Math.max(...history.map(entry => entry.weight), currentWeight);
  const range = maxWeight - minWeight || 1;
  const currentLinePosition = 8 + ((currentWeight - minWeight) / range) * 84;
  // Keep every goal mode in the familiar, oldest-to-newest order.
  const bars = history;

  const heightFor = (weight: number) => `${12 + ((weight - minWeight) / range) * 88}%`;
  const weeksAgo = (timelineIndex: number) => history.length - 1 - timelineIndex;

  return (
    <div className="rounded-[1.2rem] border border-emerald-500/10 bg-[#091124]/70 p-5 shadow-[0_8px_24px_0_rgba(0,0,0,0.25)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-400/80">Weight Today</div>
          <div className="mt-1 text-2xl font-bold text-white">{latest.toFixed(1)} <span className="text-sm font-normal text-slate-400">kg</span></div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
            aria-label="Toggle weight sort order"
            className="hidden rounded-full border border-emerald-500/20 bg-[#030712]/80 px-2.5 py-1.5 font-mono text-[10px] text-emerald-300 transition-colors hover:border-emerald-400/50"
          >
            {sortOrder === 'asc' ? 'LOW → HIGH' : 'HIGH → LOW'}
          </button>
          <button onClick={onEdit} className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
            <Plus size={12} /> Edit
          </button>
        </div>
      </div>
      <div className="rounded-2xl border border-emerald-500/10 bg-[#030712]/55 p-3">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setGoal('lose')} className={`rounded-full px-3 py-2 text-xs font-semibold transition-colors ${goal === 'lose' ? 'bg-emerald-400 text-slate-950 shadow-[0_0_14px_rgba(52,211,153,0.35)]' : 'border border-slate-700 bg-slate-900/70 text-slate-300'}`}>📉 Lose Weight</button>
          <button type="button" onClick={() => setGoal('gain')} className={`rounded-full px-3 py-2 text-xs font-semibold transition-colors ${goal === 'gain' ? 'bg-emerald-400 text-slate-950 shadow-[0_0_14px_rgba(52,211,153,0.35)]' : 'border border-slate-700 bg-slate-900/70 text-slate-300'}`}>📈 Gain Weight</button>
          <span className="ml-1 text-sm font-bold text-white">My Goal: {goal === 'lose' ? 'Lose Weight' : 'Gain Weight'}</span>
        </div>
        <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-emerald-300">My Progress Journey</span>
          <span>{goal === 'lose' ? 'Higher to Lower' : 'Lower to Higher'}</span>
        </div>
        <div className="relative h-52 rounded-xl border border-emerald-500/10 bg-[#07101e] px-3 pt-6">
          <div className="pointer-events-none absolute right-3 left-3 z-20 border-t-2 border-dashed border-emerald-400/70 animate-pulse" style={{ bottom: `${currentLinePosition}%` }} />
          <div className="flex h-full items-end gap-2 sm:gap-3">
            {bars.map(entry => {
              const isCurrent = entry.timelineIndex === latestEntry?.timelineIndex;
              return (
                <div key={`simple-${entry.date}-${entry.timelineIndex}`} className="relative flex h-full min-w-0 flex-1 items-end">
                  <div title={`${formatEntryDate(entry.date)}: ${entry.weight.toFixed(1)} kg`} className={`w-full rounded-t-md bg-gradient-to-t from-emerald-500/20 to-emerald-400/80 shadow-[0_0_10px_rgba(52,211,153,0.15)] transition-all hover:to-emerald-300 ${isCurrent ? 'ring-1 ring-emerald-200/80' : ''}`} style={{ height: heightFor(entry.weight) }} />
                  {isCurrent && (
                    <span className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-emerald-300/70 bg-emerald-400 px-2 py-1 font-mono text-xs font-bold text-slate-950 shadow-[0_0_16px_rgba(52,211,153,0.65)]" style={{ bottom: `${currentLinePosition}%` }}>
                      👉 TODAY: {currentWeight.toFixed(1)} kg
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2 text-xs text-slate-400 font-mono tracking-wider text-center">
          <span>Week 1</span>
          <span>Week 2</span>
          <span>Week 3</span>
          <span>Week 4</span>
          <span>Today</span>
        </div>
      </div>
      <div className="hidden rounded-2xl border border-emerald-500/10 bg-[#030712]/55 p-3">
        <div className="mb-3 flex items-center justify-between font-mono text-xs text-emerald-300">
          <span>TRANSFORMATION HISTORY</span>
          <span>{sortOrder === 'asc' ? 'LOWEST → HIGHEST' : 'HIGHEST → LOWEST'}</span>
        </div>
        <div className="relative h-48 overflow-visible rounded-xl border border-emerald-500/5 bg-[linear-gradient(rgba(52,211,153,0.06)_1px,transparent_1px)] bg-[size:100%_25%] px-2 pt-6">
          <div
            className="pointer-events-none absolute right-0 left-0 z-20 border-t border-dashed border-emerald-400 animate-pulse"
            style={{ bottom: `${currentLinePosition}%` }}
          >
            <span className="absolute -top-3 right-1 rounded bg-[#07151a] px-1.5 font-mono text-xs text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.45)]">CURRENT 84.4 kg</span>
          </div>
          <div className="flex h-full min-w-max items-end justify-between gap-[1px]">
            {bars.map(entry => {
              const age = weeksAgo(entry.timelineIndex);
              const isRecent = age > 0 && age <= 3;
              const isCurrent = age === 0;
              const width = isRecent || isCurrent ? 'w-4 sm:w-5' : age <= 6 ? 'w-[2px]' : 'w-px';
              const opacity = isRecent || isCurrent ? 'opacity-100' : age <= 6 ? 'opacity-40' : age <= 9 ? 'opacity-25' : 'opacity-10';

              return (
                <div key={`${entry.date}-${entry.timelineIndex}`} className={`group relative flex h-full items-end ${width} ${opacity}`}>
                  {isRecent && (
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1 w-16 -translate-x-1/2 text-center">
                      <div className="whitespace-nowrap rounded border border-emerald-400/35 bg-emerald-400/10 px-1 py-0.5 font-mono text-[10px] text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.18)]">Week -{age}</div>
                      <div className="mt-0.5 font-mono text-[10px] text-emerald-300">{entry.weight.toFixed(1)} kg</div>
                    </div>
                  )}
                  <div
                    title={`${formatEntryDate(entry.date)}: ${entry.weight.toFixed(1)} kg`}
                    className="w-full rounded-t-sm bg-gradient-to-t from-emerald-500/10 to-emerald-400/80 shadow-[0_0_10px_rgba(52,211,153,0.15)] transition-all duration-300 hover:scale-x-125 hover:to-emerald-300"
                    style={{ height: heightFor(entry.weight) }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-2 flex justify-between font-mono text-xs text-emerald-300">
          <span>{minWeight.toFixed(1)} kg</span>
          <span>weight-ranked entries</span>
          <span>{maxWeight.toFixed(1)} kg</span>
        </div>
      </div>
      <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${delta >= 0 ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
        {delta >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {deltaLabel(delta)}
      </div>
    </div>
  );
}

function StrengthChart({ title, data, color }: { title: string; data: { date: string; weight: number }[]; color: string }) {
  const weights = data.map(d => lbsToKg(d.weight));
  const first = weights[0];
  const latest = weights[weights.length - 1];
  const gain = latest - first;
  const gainPercent = first > 0 ? (gain / first) * 100 : 0;

  return (
    <div className="rounded-[1.4rem] border border-emerald-500/15 bg-[#08111f]/90 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.24)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 p-1.5 text-emerald-300">
              <Dumbbell size={14} />
            </span>
            <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">{title}</div>
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-white">{latest.toFixed(1)} <span className="text-base font-medium text-slate-400">kg</span></div>
        </div>
        <div className={`rounded-full px-3 py-1.5 text-sm font-semibold ${gain >= 0 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
          {gain >= 0 ? '▲' : '▼'} {Math.abs(gain).toFixed(1)} kg
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>Starting {first.toFixed(1)} kg</span>
        <span>Now {latest.toFixed(1)} kg</span>
      </div>

      <div className="mt-3 rounded-[1rem] border border-white/5 bg-[#030712]/70 p-3">
        <MiniLineChart data={weights} color={color} height={86} />
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>{formatEntryDate(data[0].date)}</span>
          <span>{formatEntryDate(data[data.length - 1].date)}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-full border border-emerald-500/10 bg-emerald-500/10 px-3 py-2 text-xs text-slate-300">
        <span className="flex items-center gap-1.5"><Target size={12} className="text-emerald-300" /> Progress pace</span>
        <span className="font-semibold text-emerald-300">{gain >= 0 ? '+' : ''}{gainPercent.toFixed(1)}%</span>
      </div>
    </div>
  );
}

function MeasurementsPanel({ measurementEntries, onEditAll, onEditMetric }: { measurementEntries: MeasurementEntry[]; onEditAll: () => void; onEditMetric: (key: MeasurementKey) => void }) {
  const latestEntry = measurementEntries[measurementEntries.length - 1];
  const previousEntry = measurementEntries[measurementEntries.length - 2] ?? latestEntry;
  const metrics: Array<{ label: string; key: MeasurementKey }> = [
    { label: 'Chest', key: 'chest' },
    { label: 'Waist', key: 'waist' },
    { label: 'Biceps', key: 'biceps' },
  ];

  return (
    <div className="rounded-[1.2rem] border border-emerald-500/10 bg-[#091124]/70 p-5 shadow-[0_8px_24px_0_rgba(0,0,0,0.25)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Body Changes</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">Simple inch checks</p>
        </div>
        <button onClick={onEditAll} className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
          <Plus size={12} /> Edit
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map(metric => {
          const current = latestEntry[metric.key];
          const previous = previousEntry[metric.key];
          const delta = current - previous;
          return (
            <button key={metric.key} type="button" onClick={() => onEditMetric(metric.key)} className="rounded-2xl border border-slate-800/70 bg-[#030712]/70 p-3 text-left">
              <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{metric.label}</div>
              <div className="mt-2 text-2xl font-bold text-white">{current.toFixed(1)} <span className="text-sm font-normal text-slate-400">inches</span></div>
              <div className={`mt-2 text-xs font-semibold ${delta >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {delta >= 0 ? 'Up' : 'Down'} {Math.abs(delta).toFixed(1)} inches
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeeklyVolumeChart() {
  const weeks = [
    { label: 'Wk 8', volume: 28400 },
    { label: 'Wk 9', volume: 31200 },
    { label: 'Wk 10', volume: 29800 },
    { label: 'Wk 11', volume: 33600 },
    { label: 'Wk 12', volume: 35100 },
    { label: 'This', volume: WORKOUT_HISTORY.slice(0, 3).reduce((a, w) => a + w.totalVolume, 0) },
  ];
  const maxV = Math.max(...weeks.map(w => w.volume));

  return (
    <div className="rounded-[1.2rem] border border-emerald-500/10 bg-[#091124]/70 p-5 shadow-[0_8px_24px_0_rgba(0,0,0,0.25)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Weekly Volume</h3>
        <span className="text-xs uppercase tracking-[0.24em] text-slate-500">kg lifted / week</span>
      </div>
      <div className="flex h-32 items-end gap-2">
        {weeks.map((w, i) => {
          const volumeKg = (w.volume * 0.453592);
          const pct = (volumeKg / (maxV * 0.453592)) * 100;
          const isThis = i === weeks.length - 1;
          return (
            <div key={w.label} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-xs text-slate-400">{Math.round(volumeKg / 1000)}k</span>
              <div className="flex w-full items-end justify-center" style={{ height: '80px' }}>
                <div className={`w-full rounded-t-lg transition-all ${isThis ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-600'}`} style={{ height: `${pct}%` }} />
              </div>
              <span className={`text-xs font-medium ${isThis ? 'text-emerald-400' : 'text-slate-500'}`}>{w.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PRTable() {
  const prs = [
    { exercise: 'Bench Press', weight: 225, date: 'Jul 10', prev: 220, icon: Dumbbell },
    { exercise: 'Squat', weight: 275, date: 'Jul 5', prev: 265, icon: Target },
    { exercise: 'Deadlift', weight: 315, date: 'Jun 28', prev: 305, icon: Crown },
    { exercise: 'Overhead Press', weight: 135, date: 'Jun 20', prev: 130, icon: Dumbbell },
    { exercise: 'Barbell Row', weight: 185, date: 'Jul 8', prev: 185, icon: Target },
  ];

  return (
    <div className="rounded-[1.4rem] border border-emerald-500/15 bg-[#08111f]/90 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.24)]">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white">Simple logs</h3>
          <p className="mt-1 text-xs text-slate-500">Your most recent personal bests at a glance.</p>
        </div>
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300">Recent PRs</span>
      </div>
      <div className="space-y-2.5">
        {prs.map(pr => {
          const weightKg = lbsToKg(pr.weight);
          const changeKg = lbsToKg(pr.weight - pr.prev);
          const Icon = pr.icon;
          return (
            <div key={pr.exercise} className="flex items-center justify-between rounded-[1rem] border border-white/5 bg-[#030712]/70 px-3 py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-300">
                  <Icon size={14} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{pr.exercise}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                    <CalendarDays size={12} className="text-slate-500" />
                    {pr.date}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">{weightKg.toFixed(1)} kg</div>
                <div className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${changeKg >= 0 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                  {changeKg >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                  {changeKg >= 0 ? '+' : ''}{changeKg.toFixed(1)} kg
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ProgressPage({ onNavigate: _onNavigate }: { onNavigate: (page: Page) => void }) {
  const [activeTab, setActiveTab] = useState<ProgressTab>('body');
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>(() => PROGRESS_DATA.map(entry => ({ date: entry.date, value: entry.weight! })));
  const [measurementEntries, setMeasurementEntries] = useState<MeasurementEntry[]>(() => PROGRESS_DATA.map(entry => ({ date: entry.date, chest: entry.chest!, waist: entry.waist!, biceps: entry.biceps! })));
  const [draftWeight, setDraftWeight] = useState(72);
  const [draftMeasurements, setDraftMeasurements] = useState<{ chest: number; waist: number; biceps: number }>({ chest: 40, waist: 34, biceps: 14 });
  const [selectedEntryDate, setSelectedEntryDate] = useState<string>(() => PROGRESS_DATA[PROGRESS_DATA.length - 1].date);
  const [activeMeasurement, setActiveMeasurement] = useState<MeasurementKey>('chest');

  const syncDraftFromDate = (date: string) => {
    setSelectedEntryDate(date);

    const matchingWeightEntry = weightEntries.find(entry => entry.date === date);
    if (matchingWeightEntry) {
      setDraftWeight(Number(lbsToKg(matchingWeightEntry.value).toFixed(1)));
    }

    const matchingMeasurementEntry = measurementEntries.find(entry => entry.date === date);
    if (matchingMeasurementEntry) {
      setDraftMeasurements({
        chest: Number(matchingMeasurementEntry.chest.toFixed(1)),
        waist: Number(matchingMeasurementEntry.waist.toFixed(1)),
        biceps: Number(matchingMeasurementEntry.biceps.toFixed(1)),
      });
    }
  };

  const openWeightSheet = (date?: string) => {
    const targetDate = date ?? weightEntries[weightEntries.length - 1]?.date;
    if (targetDate) {
      setSheetMode('weight');
      syncDraftFromDate(targetDate);
    }
  };

  const openMeasurementSheet = (key: MeasurementKey, date?: string) => {
    const targetDate = date ?? measurementEntries[measurementEntries.length - 1]?.date;
    if (targetDate) {
      setSheetMode('measurement');
      setActiveMeasurement(key);
      syncDraftFromDate(targetDate);
    }
  };

  const saveWeight = () => {
    setWeightEntries(prev => prev.map(entry => entry.date === selectedEntryDate ? { ...entry, value: kgToLbs(draftWeight) } : entry));
    setSheetMode(null);
  };

  const saveMeasurements = () => {
    setMeasurementEntries(prev => prev.map(entry => entry.date === selectedEntryDate ? {
      ...entry,
      chest: Number(draftMeasurements.chest.toFixed(1)),
      waist: Number(draftMeasurements.waist.toFixed(1)),
      biceps: Number(draftMeasurements.biceps.toFixed(1)),
    } : entry));
    setSheetMode(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="rounded-[1.5rem] border border-emerald-500/15 bg-gradient-to-br from-[#091124] via-[#08111f] to-[#060b16] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-300">
              <Sparkles size={12} /> Simple progress tracker
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">Your Progress</h1>
            <p className="mt-1 max-w-xl text-sm text-slate-400">Track your strength gains, body changes, and personal records at a single glance.</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/15 bg-[#030712]/70 px-3 py-2 text-sm text-slate-300">
            <div className="flex items-center gap-2 text-emerald-300"><TrendingUp size={14} /> +18.2 kg total gain</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-full border border-emerald-500/15 bg-[#091124]/80 p-1.5">
        {[
          { id: 'strength' as ProgressTab, label: 'Strength', icon: TrendingUp },
          { id: 'body' as ProgressTab, label: 'Body Weight', icon: Activity },
          { id: 'volume' as ProgressTab, label: 'Personal Bests', icon: Crown },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-all ${activeTab === id ? 'bg-emerald-500 text-slate-950 shadow-[0_0_18px_rgba(16,185,129,0.2)]' : 'text-slate-400 hover:bg-emerald-500/10 hover:text-slate-200'}`}
          >
            <Icon size={14} /> <span>{label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'body' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 animate-fade-in">
          <BodyWeightChart weightEntries={weightEntries} onEdit={() => openWeightSheet()} />
          <MeasurementsPanel measurementEntries={measurementEntries} onEditAll={() => openMeasurementSheet('chest')} onEditMetric={key => openMeasurementSheet(key)} />
          <div className="md:col-span-2">
            <div className="rounded-[1.2rem] border border-emerald-500/10 bg-[#091124]/70 p-5 shadow-[0_8px_24px_0_rgba(0,0,0,0.25)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">My Weight History</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">Past weights</p>
                </div>
                <button onClick={() => openWeightSheet()} className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
                  <Sparkles size={12} /> ✍️ Edit Weights
                </button>
              </div>
              <div className="space-y-3">
                {weightEntries.slice(-6).map((entry, i) => {
                  const value = lbsToKg(entry.value);
                  return (
                    <button key={`${entry.date}-${i}`} type="button" onClick={() => openWeightSheet(entry.date)} className="flex w-full items-center gap-4 rounded-2xl border border-slate-800/70 bg-[#030712]/70 px-3 py-3 text-left">
                      <span className="w-20 shrink-0 text-xs text-slate-500">{formatEntryDate(entry.date)}</span>
                      <div className="h-1.5 flex-1 rounded-full bg-slate-700">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400" style={{ width: `${Math.min(100, 40 + i * 12)}%` }} />
                      </div>
                      <span className="w-16 text-right text-xs font-semibold text-slate-200">{value.toFixed(1)} kg</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'strength' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 animate-fade-in">
          <StrengthChart title="Bench Press" data={BENCH_PRESS_HISTORY} color="#34D399" />
          <StrengthChart title="Squat" data={SQUAT_HISTORY} color="#60A5FA" />
          <div className="md:col-span-2">
            <PRTable />
          </div>
        </div>
      )}

      {activeTab === 'volume' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 animate-fade-in">
          <div className="md:col-span-2">
            <WeeklyVolumeChart />
          </div>
          <div className="rounded-[1.2rem] border border-emerald-500/10 bg-[#091124]/70 p-5 shadow-[0_8px_24px_0_rgba(0,0,0,0.25)]">
            <h3 className="mb-4 text-sm font-semibold text-white">Week Summary</h3>
            <div className="space-y-3">
              {[
                { label: 'Sessions completed', value: '3 / 5', pct: 60 },
                { label: 'Total volume lifted', value: '20.6k kg', pct: 91 },
                { label: 'Avg session duration', value: '68 min', pct: 85 },
                { label: 'Sets completed', value: '52 sets', pct: 78 },
              ].map(({ label, value, pct }) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-slate-400">{label}</span>
                    <span className="font-medium text-slate-200">{value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-700">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[1.2rem] border border-emerald-500/10 bg-[#091124]/70 p-5 shadow-[0_8px_24px_0_rgba(0,0,0,0.25)]">
            <h3 className="mb-4 text-sm font-semibold text-white">Muscle Balance</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Chest', pct: 85, color: 'bg-emerald-500' },
                { label: 'Back', pct: 92, color: 'bg-blue-500' },
                { label: 'Legs', pct: 78, color: 'bg-green-500' },
                { label: 'Shoulders', pct: 70, color: 'bg-yellow-500' },
                { label: 'Arms', pct: 65, color: 'bg-purple-500' },
                { label: 'Core', pct: 45, color: 'bg-orange-500' },
              ].map(({ label, pct, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-16 text-xs text-slate-400">{label}</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-700">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs text-slate-400">{pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {sheetMode && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-[1.6rem] border border-emerald-500/10 bg-[#030712]/95 p-4 shadow-[0_0_35px_rgba(16,185,129,0.12)] sm:rounded-[1.6rem]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{sheetMode === 'weight' ? 'Update Past Weight' : 'Update Past Body Sizes'}</h3>
                <p className="text-sm text-slate-400">Choose a date and update the value without adding a duplicate.</p>
              </div>
              <button onClick={() => setSheetMode(null)} className="rounded-full border border-slate-700/70 p-2 text-slate-300">
                <Plus size={16} className="rotate-45" />
              </button>
            </div>

            <div className="mb-4 rounded-[1.2rem] border border-emerald-500/10 bg-[#091124]/70 p-3">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Select date</label>
              <select
                value={selectedEntryDate}
                onChange={event => syncDraftFromDate(event.target.value)}
                className="w-full rounded-2xl border border-emerald-500/10 bg-[#030712]/80 px-3 py-2.5 text-sm text-slate-100 outline-none"
              >
                {sheetMode === 'weight'
                  ? weightEntries.map(entry => <option key={entry.date} value={entry.date} className="bg-slate-900">{formatEntryDate(entry.date)}</option>)
                  : measurementEntries.map(entry => <option key={entry.date} value={entry.date} className="bg-slate-900">{formatEntryDate(entry.date)}</option>)}
              </select>
            </div>

            {sheetMode === 'weight' ? (
              <div className="rounded-[1.2rem] border border-emerald-500/10 bg-[#091124]/70 p-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-slate-400">Weight</span>
                  <span className="font-mono text-emerald-300">{draftWeight.toFixed(1)} kg</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => setDraftWeight(value => Math.max(35, Number((value - 0.5).toFixed(1))))} className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-[#030712]/80 text-3xl font-semibold text-emerald-300">
                    <Minus size={22} />
                  </button>
                  <div className="min-w-[132px] rounded-3xl border border-emerald-500/20 bg-[#030712]/80 px-4 py-4 text-center text-4xl font-bold text-white">
                    {draftWeight.toFixed(1)}
                  </div>
                  <button onClick={() => setDraftWeight(value => Number((value + 0.5).toFixed(1)))} className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-[#030712]/80 text-3xl font-semibold text-emerald-300">
                    <Plus size={22} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 rounded-[1.2rem] border border-emerald-500/10 bg-[#091124]/70 p-4">
                {[
                  { key: 'chest' as MeasurementKey, label: 'Chest', value: draftMeasurements.chest },
                  { key: 'waist' as MeasurementKey, label: 'Waist', value: draftMeasurements.waist },
                  { key: 'biceps' as MeasurementKey, label: 'Biceps', value: draftMeasurements.biceps },
                ].map(metric => (
                  <div key={metric.key} className={`rounded-2xl border p-3 ${activeMeasurement === metric.key ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-slate-800/70 bg-[#030712]/70'}`}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{metric.label}</span>
                      <span className="font-mono text-emerald-300">{metric.value.toFixed(1)} inches</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => setDraftMeasurements(prev => ({ ...prev, [metric.key]: Math.max(28, Number((prev[metric.key] - 0.5).toFixed(1))) }))} className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-[#030712]/80 text-xl font-semibold text-emerald-300">
                        <Minus size={18} />
                      </button>
                      <div className="min-w-[96px] rounded-2xl border border-emerald-500/20 bg-[#030712]/80 px-3 py-2 text-center text-xl font-bold text-white">
                        {metric.value.toFixed(1)}
                      </div>
                      <button onClick={() => setDraftMeasurements(prev => ({ ...prev, [metric.key]: Number((prev[metric.key] + 0.5).toFixed(1)) }))} className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-[#030712]/80 text-xl font-semibold text-emerald-300">
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button onClick={sheetMode === 'weight' ? saveWeight : saveMeasurements} className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-400 px-4 py-3 text-sm font-semibold text-slate-950">
                Save Changes
              </button>
              <button onClick={() => setSheetMode(null)} className="rounded-2xl border border-slate-700/60 px-4 py-3 text-sm font-semibold text-slate-300">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
