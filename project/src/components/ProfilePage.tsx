import { useState } from 'react';
import { User, CreditCard, Bell, Shield, ChevronRight, Check, X, Crown, Flame, Award, Settings, Sparkles } from 'lucide-react';
import type { UserProfile } from '../types';
import { PRICING_PLANS } from '../data';

interface ProfilePageProps {
  user: UserProfile;
  onSubscriptionChange: (tier: 'free' | 'monthly' | 'quarterly' | 'annual') => void;
  onProfileUpdate: (updates: Partial<UserProfile>) => void;
}

function SubscriptionCard({ user, onManage }: { user: UserProfile; onManage: () => void }) {
  const isSubscribed = user.subscriptionTier !== 'free';
  const plan = PRICING_PLANS.find(p => p.id === user.subscriptionTier);

  return (
    <div className={`card p-5 ${isSubscribed ? 'bg-gradient-to-br from-teal-500/10 to-cyan-600/5 border-teal-500/20' : ''}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSubscribed ? 'bg-teal-500/20' : 'bg-slate-700'}`}>
          <Crown size={18} className={isSubscribed ? 'text-teal-400' : 'text-slate-400'} />
        </div>
        <div>
          <div className="font-semibold text-white">
            {isSubscribed ? `${plan?.name} Coaching Plan` : 'Free Plan'}
          </div>
          <div className="text-xs text-slate-400">
            {isSubscribed ? `$${plan?.price} ${plan?.billingPeriod}` : 'Basic tracking features only'}
          </div>
        </div>
        {isSubscribed && (
          <span className="ml-auto badge bg-teal-500/20 text-teal-400 border border-teal-500/30">Active</span>
        )}
      </div>

      {isSubscribed ? (
        <div className="space-y-2 mb-4">
          {plan?.features.slice(0, 4).map(f => (
            <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
              <Check size={13} className="text-teal-400 shrink-0" />
              {f}
            </div>
          ))}
          {plan && plan.features.length > 4 && (
            <div className="text-xs text-slate-500">+{plan.features.length - 4} more benefits</div>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-400 mb-4">Upgrade to get a personal coach, custom programs, and more.</p>
      )}

      <button onClick={onManage} className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${isSubscribed ? 'btn-secondary' : 'btn-primary'}`}>
        {isSubscribed ? 'Manage Subscription' : 'Upgrade to Pro'}
      </button>
    </div>
  );
}

function ManageSubscriptionModal({ user, onClose, onCancel, onActionMessage }: {
  user: UserProfile;
  onClose: () => void;
  onCancel: () => void;
  onActionMessage: (message: string) => void;
}) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const plan = PRICING_PLANS.find(p => p.id === user.subscriptionTier);

  return (
    <div className="modal-backdrop fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1E2937] border border-slate-700/50 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <h2 className="font-bold text-white">Manage Subscription</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-2">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-slate-800/60 rounded-xl p-4">
            <div className="text-xs text-slate-400 mb-1">Current plan</div>
            <div className="font-bold text-white">{plan?.name} Coaching</div>
            <div className="text-sm text-teal-400">${plan?.price} {plan?.billingPeriod}</div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Next billing date</span>
              <span className="text-white">August 13, 2026</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Payment method</span>
              <span className="text-white">•••• 4242</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Status</span>
              <span className="text-green-400 font-medium">Active</span>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={() => onActionMessage('Payment method updates are ready for your billing provider connection.')}
              className="w-full btn-secondary text-sm py-2.5"
            >
              Update Payment Method
            </button>
            {!confirmCancel ? (
              <button
                onClick={() => setConfirmCancel(true)}
                className="w-full py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all"
              >
                Cancel Subscription
              </button>
            ) : (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-3">
                <p className="text-sm text-red-300">Are you sure? You'll lose access to coaching immediately.</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmCancel(false)} className="flex-1 btn-secondary text-sm py-2">Keep Plan</button>
                  <button onClick={() => { onCancel(); onClose(); }} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-xl transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage({ user, onSubscriptionChange, onProfileUpdate }: ProfilePageProps) {
  const [showManage, setShowManage] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [draftName, setDraftName] = useState(user.name);
  const [draftEmail, setDraftEmail] = useState(user.email);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedSetting, setSelectedSetting] = useState<string | null>(null);

  const handleSaveProfile = () => {
    const nextName = draftName.trim() || user.name;
    const nextEmail = draftEmail.trim() || user.email;
    onProfileUpdate({ name: nextName, email: nextEmail });
    setShowEditModal(false);
    setNotice('Profile updated successfully.');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Profile</h1>

      {/* Avatar + name */}
      <div className="card p-4 sm:p-6 flex items-center gap-3 sm:gap-5">
        <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-teal-500/20 shrink-0">
          {user.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">{user.name}</h2>
          <p className="text-slate-400 text-sm">{user.email}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-orange-400 font-semibold">
              <Flame size={12} /> {user.streakDays}-day streak
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-400">Joined {new Date(user.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowEditModal(true)}
          className="btn-secondary text-xs px-3 py-2.5 shrink-0 flex items-center gap-1.5"
        >
          <Settings size={13} /> Edit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Workouts', value: '47', icon: '🏋️' },
          { label: 'PRs Set', value: '12', icon: '🏆' },
          { label: 'Lbs Lifted', value: '184k', icon: '📈' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card p-4 text-center">
            <div className="text-xl mb-1">{icon}</div>
            <div className="text-xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Subscription */}
      <SubscriptionCard user={user} onManage={() => setShowManage(true)} />

      {notice && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-300">
          <Sparkles size={14} />
          {notice}
        </div>
      )}

      {/* Settings sections */}
      {[
        {
          title: 'Account',
          icon: User,
          items: ['Edit Profile', 'Change Email', 'Change Password', 'Connected Devices'],
        },
        {
          title: 'Notifications',
          icon: Bell,
          items: ['Workout Reminders', 'Coach Messages', 'Live Session Alerts', 'Weekly Progress Report'],
        },
        {
          title: 'Billing',
          icon: CreditCard,
          items: ['Payment Methods', 'Billing History', 'Invoices'],
        },
        {
          title: 'Privacy & Security',
          icon: Shield,
          items: ['Privacy Settings', 'Data Export', 'Delete Account'],
        },
      ].map(({ title, icon: Icon, items }) => (
        <div key={title} className="card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50">
            <Icon size={15} className="text-teal-400" />
            <span className="text-sm font-semibold text-slate-300">{title}</span>
          </div>
          {items.map((item, i) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setSelectedSetting(item);
                setNotice(`${item} is ready for the next update.`);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/30 transition-all text-sm text-slate-300 hover:text-white ${i < items.length - 1 ? 'border-b border-slate-700/30' : ''}`}
            >
              <span>{item}</span>
              <ChevronRight size={14} className="text-slate-600" />
            </button>
          ))}
        </div>
      ))}

      {/* Achievement badges */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award size={16} className="text-yellow-400" />
          <h3 className="font-semibold text-white text-sm">Achievements</h3>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {[
            { emoji: '🔥', label: '14-Day Streak', earned: true },
            { emoji: '🏋️', label: 'First 100k lbs', earned: true },
            { emoji: '💪', label: '2 Plate Bench', earned: true },
            { emoji: '🦵', label: '3 Plate Squat', earned: false },
            { emoji: '⚡', label: '30-Day Streak', earned: false },
            { emoji: '🎯', label: '50 Workouts', earned: false },
            { emoji: '🏆', label: 'Consistency King', earned: true },
            { emoji: '📈', label: 'Progressive Pro', earned: true },
          ].map(({ emoji, label, earned }) => (
            <div key={label} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl text-center transition-all ${earned ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-slate-800/50 opacity-40'}`}>
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs text-slate-400 leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-[1.5rem] border border-slate-700/60 bg-[#111827] p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Edit profile</h3>
                <p className="text-sm text-slate-400">Update your visible profile details.</p>
              </div>
              <button type="button" onClick={() => setShowEditModal(false)} className="rounded-full border border-slate-700/70 p-2 text-slate-400">
                <X size={16} />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <label className="block text-sm text-slate-300">
                <span className="mb-1.5 block">Name</span>
                <input value={draftName} onChange={event => setDraftName(event.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-white outline-none" />
              </label>
              <label className="block text-sm text-slate-300">
                <span className="mb-1.5 block">Email</span>
                <input value={draftEmail} onChange={event => setDraftEmail(event.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-white outline-none" />
              </label>
            </div>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 rounded-2xl border border-slate-700/70 px-3 py-2.5 text-sm text-slate-300">
                Cancel
              </button>
              <button type="button" onClick={handleSaveProfile} className="flex-1 rounded-2xl bg-emerald-500 px-3 py-2.5 text-sm font-semibold text-slate-950">
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedSetting && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-[1.5rem] border border-slate-700/60 bg-[#111827] p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-emerald-300">
              <Sparkles size={16} />
              <h3 className="font-semibold text-white">Section ready</h3>
            </div>
            <p className="mt-3 text-sm text-slate-400">{selectedSetting} is now connected to the app flow and ready for future settings updates.</p>
            <button type="button" onClick={() => setSelectedSetting(null)} className="mt-4 w-full rounded-2xl bg-emerald-500 px-3 py-2.5 text-sm font-semibold text-slate-950">
              Close
            </button>
          </div>
        </div>
      )}

      {showManage && user.subscriptionTier !== 'free' && (
        <ManageSubscriptionModal
          user={user}
          onClose={() => setShowManage(false)}
          onCancel={() => onSubscriptionChange('free')}
          onActionMessage={message => setNotice(message)}
        />
      )}
    </div>
  );
}
