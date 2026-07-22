import { useState } from 'react';
import { Video, Check, Clock, Play, MessageSquare, Send, AlertCircle } from 'lucide-react';
import type { FormCheckSubmission } from '../types';
import { MOCK_FORM_CHECKS, MOCK_USERS } from '../data';

export default function TrainerFormCheckDesk() {
  const [submissions, setSubmissions] = useState<FormCheckSubmission[]>(MOCK_FORM_CHECKS);
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_FORM_CHECKS[0]?.id ?? null);
  const [feedbackText, setFeedbackText] = useState('');

  const selected = submissions.find(s => s.id === selectedId);
  const pending = submissions.filter(s => s.status === 'pending');
  const reviewed = submissions.filter(s => s.status === 'reviewed');

  const getClientName = (clientId: string) => MOCK_USERS.find(u => u.id === clientId)?.name ?? 'Unknown';
  const getClientInitials = (clientId: string) => MOCK_USERS.find(u => u.id === clientId)?.avatarInitials ?? '?';

  const submitFeedback = () => {
    if (!selected || !feedbackText.trim()) return;
    setSubmissions(prev => prev.map(s =>
      s.id === selected.id ? { ...s, status: 'reviewed', trainerFeedback: feedbackText.trim() } : s
    ));
    setFeedbackText('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Form Check Desk</h1>
        <p className="text-slate-400 text-sm mt-1">Review client form check videos and provide feedback.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Submission list */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Clock size={13} /> Pending Review ({pending.length})
          </div>
          {pending.map(s => (
            <button
              key={s.id}
              onClick={() => { setSelectedId(s.id); setFeedbackText(''); }}
              className={`w-full text-left card p-3 transition-all ${selectedId === s.id ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'hover:border-slate-600'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {getClientInitials(s.clientId)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{getClientName(s.clientId)}</div>
                  <div className="text-xs text-slate-400 truncate">{s.exerciseName}</div>
                </div>
                <span className="badge bg-yellow-500/20 text-yellow-400 shrink-0">Pending</span>
              </div>
            </button>
          ))}

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider pt-3">
            <Check size={13} /> Reviewed ({reviewed.length})
          </div>
          {reviewed.map(s => (
            <button
              key={s.id}
              onClick={() => { setSelectedId(s.id); setFeedbackText(s.trainerFeedback ?? ''); }}
              className={`w-full text-left card p-3 transition-all ${selectedId === s.id ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'hover:border-slate-600 opacity-70'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {getClientInitials(s.clientId)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{getClientName(s.clientId)}</div>
                  <div className="text-xs text-slate-400 truncate">{s.exerciseName}</div>
                </div>
                <span className="badge bg-teal-500/20 text-teal-400 shrink-0">Reviewed</span>
              </div>
            </button>
          ))}
        </div>

        {/* Review panel */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="card overflow-hidden">
              {/* Video player */}
              <div className="relative bg-slate-900 aspect-video flex items-center justify-center group">
                <img src={selected.thumbnailUrl} alt="Form check" className="w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all">
                    <Play size={26} className="text-white fill-current ml-1" />
                  </div>
                </div>
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1">
                  <Video size={13} className="text-red-400" />
                  <span className="text-xs font-semibold text-white">Form Check Video</span>
                </div>
                <div className="absolute bottom-3 right-3 text-xs text-white/80 bg-black/50 px-2 py-0.5 rounded">
                  {new Date(selected.submittedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Details + feedback */}
              <div className="p-5 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white">{selected.exerciseName}</h3>
                    <span className={`badge ${selected.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-teal-500/20 text-teal-400'}`}>
                      {selected.status === 'pending' ? 'Pending Review' : 'Reviewed'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">Submitted by {getClientName(selected.clientId)}</p>
                </div>

                {selected.status === 'reviewed' && selected.trainerFeedback && (
                  <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MessageSquare size={13} className="text-teal-400" />
                      <span className="text-xs font-semibold text-teal-400">Your Feedback (sent to client)</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{selected.trainerFeedback}</p>
                  </div>
                )}

                {/* Feedback input */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    {selected.status === 'pending' ? 'Write posture corrections & feedback' : 'Update feedback'}
                  </label>
                  <textarea
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                    placeholder="e.g. Your elbow flare is too wide on the descent. Tuck your elbows to about 45 degrees and keep your wrists stacked directly over your elbows..."
                    rows={4}
                    className="input-field w-full resize-none text-sm"
                  />
                  <button
                    onClick={submitFeedback}
                    disabled={!feedbackText.trim()}
                    className="btn-primary w-full mt-3 text-sm py-2.5 flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    <Send size={14} />
                    {selected.status === 'pending' ? 'Send Feedback to Client' : 'Update Feedback'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center">
              <AlertCircle size={32} className="text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Select a submission to review</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
