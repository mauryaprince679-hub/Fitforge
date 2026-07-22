import { useState } from 'react';
import { Search, AlertTriangle, Activity, Users, CheckCircle2, Clock3, Dumbbell } from 'lucide-react';
import type { User } from '../types';
import { getTrainerClients, CURRENT_TRAINER_ID, MOCK_ANALYTICS } from '../data';

function getAlerts(client: User): { type: 'missed' | 'spike' | 'low_compliance'; level: 'yellow' | 'red'; label: string }[] {
  const alerts: { type: 'missed' | 'spike' | 'low_compliance'; level: 'yellow' | 'red'; label: string }[] = [];
  // Missed workout: last active > 2 days ago
  const lastActiveDate = new Date(client.lastActive!);
  const daysSince = Math.floor((Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSince >= 3) {
    alerts.push({ type: 'missed', level: 'red', label: 'Missed workout' });
  } else if (daysSince >= 2) {
    alerts.push({ type: 'missed', level: 'yellow', label: 'Inactivity' });
  }
  // Low compliance
  if (client.compliance! < 70) {
    alerts.push({ type: 'low_compliance', level: 'red', label: 'Low compliance' });
  } else if (client.compliance! < 80) {
    alerts.push({ type: 'low_compliance', level: 'yellow', label: 'Falling behind' });
  }
  // Weight spike — compare last two analytics entries
  const clientAnalytics = MOCK_ANALYTICS.filter(a => a.clientId === client.id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  if (clientAnalytics.length >= 2) {
    const delta = clientAnalytics[clientAnalytics.length - 1].weight - clientAnalytics[clientAnalytics.length - 2].weight;
    if (Math.abs(delta) >= 3) {
      alerts.push({ type: 'spike', level: 'red', label: `Weight ${delta > 0 ? 'spike' : 'drop'} (${delta > 0 ? '+' : ''}${delta.toFixed(1)}lbs)` });
    }
  }
  return alerts;
}

function ComplianceBadge({ pct }: { pct: number }) {
  const color = pct >= 85 ? 'text-emerald-300 bg-emerald-500/10 border-emerald-400/20' : pct >= 70 ? 'text-amber-300 bg-amber-500/10 border-amber-400/20' : 'text-rose-300 bg-rose-500/10 border-rose-400/20';
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${color}`}>{pct}%</span>;
}

function AlertBadge({ level, label }: { level: 'yellow' | 'red'; label: string }) {
  const color = level === 'red' ? 'bg-rose-500/10 text-rose-300 border-rose-400/20' : 'bg-amber-500/10 text-amber-300 border-amber-400/20';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${color}`}>
      <AlertTriangle size={9} /> {label}
    </span>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const safePct = Math.max(0, Math.min(100, pct));
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-full" style={{ background: `conic-gradient(#34d399 ${safePct}%, rgba(255,255,255,0.08) 0)` }}>
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-slate-950/90 text-[11px] font-semibold text-white">
        {safePct}%
      </div>
    </div>
  );
}

export default function TrainerRoster() {
  const [search, setSearch] = useState('');
  const clients = getTrainerClients(CURRENT_TRAINER_ID);
  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const totalClients = clients.length;
  const avgCompliance = Math.round(clients.reduce((a, c) => a + (c.compliance ?? 0), 0) / clients.length);
  const activeToday = clients.filter(c => c.lastActive === new Date().toISOString().split('T')[0]).length;
  const totalAlerts = clients.reduce((a, c) => a + getAlerts(c).length, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-24 lg:pb-0">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">Client Roster</h1>
        <p className="text-sm text-slate-400">Monitor your active clients with a sharper at-a-glance view.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Active Clients', value: totalClients, icon: Users, accent: 'from-blue-500/30 to-cyan-500/10', dot: 'text-sky-300' },
          { label: 'Avg Compliance', value: `${avgCompliance}%`, icon: Activity, accent: 'from-emerald-500/30 to-lime-500/10', dot: 'text-emerald-300' },
          { label: 'Active Today', value: activeToday, icon: CheckCircle2, accent: 'from-violet-500/30 to-fuchsia-500/10', dot: 'text-violet-300' },
          { label: 'Alerts', value: totalAlerts, icon: AlertTriangle, accent: 'from-amber-500/30 to-orange-500/10', dot: 'text-amber-300' },
        ].map(({ label, value, icon: Icon, accent, dot }) => (
          <div key={label} className="rounded-[1.35rem] border border-white/10 bg-slate-900/80 p-4 shadow-[0_0_35px_rgba(15,23,42,0.35)] backdrop-blur-xl">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${accent}`}>
              <Icon size={18} className={dot} />
            </div>
            <div className="text-2xl font-semibold text-white">{value}</div>
            <div className="mt-1 text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="w-full rounded-2xl border border-slate-800/80 bg-slate-900/70 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {filtered.map(client => {
          const alerts = getAlerts(client);
          const lastActiveDate = new Date(client.lastActive!);
          const daysSince = Math.floor((Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
          const compliance = client.compliance ?? 0;

          return (
            <article key={client.id} className="rounded-[1.4rem] border border-slate-800/80 bg-slate-900/80 p-4 shadow-[0_0_30px_rgba(2,6,23,0.25)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 text-sm font-semibold text-white">
                    {client.avatarInitials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white">{client.name}</div>
                    <div className="truncate text-xs text-slate-500">{client.email}</div>
                  </div>
                </div>
                <ComplianceBadge pct={compliance} />
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock3 size={13} className="text-emerald-400" />
                  <span>{daysSince === 0 ? 'Active today' : daysSince === 1 ? 'Yesterday' : `${daysSince} days ago`}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Dumbbell size={13} className="text-emerald-400" />
                  <span>{client.weight} lbs</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ProgressRing pct={compliance} />
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Compliance</p>
                    <p className="text-sm font-semibold text-white">{compliance}%</p>
                  </div>
                </div>
                <div className="flex flex-wrap justify-end gap-1.5">
                  {alerts.length === 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                      <CheckCircle2 size={10} /> No alerts
                    </span>
                  ) : (
                    alerts.map((alert, index) => <AlertBadge key={`${alert.label}-${index}`} level={alert.level} label={alert.label} />)
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
