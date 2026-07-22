import { useEffect, useMemo, useState } from 'react';
import { Send, Video, MessageCircle, Lock, Mic, Crown, EyeOff, Search, Plus, ArrowLeft, Menu } from 'lucide-react';
import type { ChatMessage, UserProfile } from '../types';
import { MOCK_GROUP_CHAT_MESSAGES, MOCK_USERS, CURRENT_CLIENT_ID, CURRENT_TRAINER_ID } from '../data';

type GroupType = 'community' | 'squad' | 'broadcast';

type GroupOption = {
  id: string;
  label: string;
  type: GroupType;
  description: string;
  premiumRequired: boolean;
  members: { id: string; label: string }[];
};

type ChatThread = {
  id: string;
  title: string;
  subtitle: string;
  avatar: string;
  kind: 'favorite' | 'group';
  badge?: string;
};

const groupOptions: GroupOption[] = [
  {
    id: 'community',
    label: 'Community Hub',
    type: 'community',
    description: 'App public group for shared updates.',
    premiumRequired: false,
    members: [
      { id: 'u_trainer_1', label: 'Trainer' },
      { id: 'u_client_2', label: 'Sarah' },
    ],
  },
  {
    id: 'squad',
    label: 'My Squads',
    type: 'squad',
    description: 'Invite friends into a private squad.',
    premiumRequired: false,
    members: [
      { id: 'u_client_2', label: 'Sarah' },
      { id: 'u_client_3', label: 'Jake' },
    ],
  },
  {
    id: 'broadcast',
    label: 'Trainer Broadcast',
    type: 'broadcast',
    description: 'Coach-led updates with private replies.',
    premiumRequired: true,
    members: [
      { id: 'u_trainer_1', label: 'Trainer' },
      { id: 'u_client_2', label: 'Sarah' },
    ],
  },
];

export default function ClientMessenger({ user, onUpgrade, onActiveChatChange }: { user: UserProfile; onUpgrade?: () => void; onActiveChatChange?: (active: boolean) => void }) {
  const [allMessages, setAllMessages] = useState<ChatMessage[]>(MOCK_GROUP_CHAT_MESSAGES);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>('community');
  const [activeChat, setActiveChat] = useState<ChatThread | null>(null);
  const [input, setInput] = useState('');
  const [whisperMode, setWhisperMode] = useState(false);
  const [whisperTarget, setWhisperTarget] = useState<string | null>('u_trainer_1');
  const [premiumModalGroup, setPremiumModalGroup] = useState<GroupOption | null>(null);
  const [premiumUnlocked, setPremiumUnlocked] = useState(Boolean(user.premium_feature_unlocked));
  const trainer = MOCK_USERS.find(u => u.id === CURRENT_TRAINER_ID);

  const selectedGroup = selectedGroupId ? groupOptions.find(group => group.id === selectedGroupId) ?? null : null;
  const whisperOptions = selectedGroup?.members.filter(member => member.id !== CURRENT_CLIENT_ID) ?? [];

  useEffect(() => {
    onActiveChatChange?.(Boolean(activeChat));
  }, [activeChat, onActiveChatChange]);
  const favorites = [
    { id: 'trainer', label: trainer?.name ?? 'Coach', initials: trainer?.avatarInitials ?? 'MW', online: true },
    { id: 'sarah', label: 'Sarah', initials: 'SC', online: true },
    { id: 'jake', label: 'Jake', initials: 'JM', online: false },
  ];

  const visibleMessages = useMemo(() => selectedGroup
    ? allMessages
        .filter(message => message.groupId === selectedGroup.id)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : [],
  [allMessages, selectedGroup?.id]);

  const activeThreadMessages = useMemo(() => {
    if (!activeChat) return [];
    const threadId = activeChat.kind === 'group' ? activeChat.id : selectedGroup?.id ?? 'community';
    return allMessages
      .filter(message => message.groupId === threadId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [activeChat, allMessages, selectedGroup?.id]);

  const handleSelectGroup = (group: GroupOption) => {
    if (group.premiumRequired && !premiumUnlocked) {
      setPremiumModalGroup(group);
      return;
    }
    setSelectedGroupId(group.id);
    setWhisperTarget(group.members.find(member => member.id !== CURRENT_CLIENT_ID)?.id ?? null);
    setWhisperMode(false);
    setActiveChat({
      id: group.id,
      title: group.label,
      subtitle: group.description,
      avatar: group.label.split(' ').slice(0, 2).map(word => word[0]).join(''),
      kind: 'group',
      badge: group.premiumRequired ? 'Premium' : 'Live',
    });
  };

  const handleOpenFavorite = (favorite: { id: string; label: string; initials: string; online: boolean }) => {
    setActiveChat({
      id: favorite.id,
      title: favorite.label,
      subtitle: favorite.online ? 'Online now' : 'Away for now',
      avatar: favorite.initials,
      kind: 'favorite',
      badge: favorite.online ? 'Online' : 'Away',
    });
  };

  const handleBackToList = () => {
    setActiveChat(null);
    setSelectedGroupId(null);
    setWhisperMode(false);
    setWhisperTarget(null);
  };

  const handleUpgrade = () => {
    onUpgrade?.();
    setPremiumUnlocked(true);
    if (premiumModalGroup) {
      setSelectedGroupId(premiumModalGroup.id);
      setWhisperTarget(premiumModalGroup.members.find(member => member.id !== CURRENT_CLIENT_ID)?.id ?? null);
      setWhisperMode(false);
    }
    setPremiumModalGroup(null);
  };

  const send = () => {
    if (!input.trim()) return;
    const recipient = whisperMode ? whisperTarget : null;
    const threadId = activeChat?.kind === 'group' ? activeChat.id : selectedGroup?.id ?? 'community';
    const threadType = activeChat?.kind === 'group' ? selectedGroup?.type ?? 'community' : selectedGroup?.type ?? 'community';
    setAllMessages(prev => [...prev, {
      id: `msg${Date.now()}`,
      senderId: CURRENT_CLIENT_ID,
      receiverId: CURRENT_TRAINER_ID,
      text: input.trim(),
      timestamp: new Date().toISOString(),
      read: true,
      tag: 'general',
      groupId: threadId,
      groupType: threadType,
      whisper: whisperMode,
      whisperTo: recipient,
    }]);
    setInput('');
    setWhisperMode(false);
    setWhisperTarget(selectedGroup?.members.find(member => member.id !== CURRENT_CLIENT_ID)?.id ?? null);
  };

  const sendVideoMock = () => {
    const recipient = whisperMode ? whisperTarget : null;
    const threadId = activeChat?.kind === 'group' ? activeChat.id : selectedGroup?.id ?? 'community';
    const threadType = activeChat?.kind === 'group' ? selectedGroup?.type ?? 'community' : selectedGroup?.type ?? 'community';
    setAllMessages(prev => [...prev, {
      id: `msg${Date.now()}`,
      senderId: CURRENT_CLIENT_ID,
      receiverId: CURRENT_TRAINER_ID,
      text: 'Form check video attached',
      timestamp: new Date().toISOString(),
      read: true,
      tag: 'form_review',
      mediaUrl: 'mock-video',
      mediaType: 'video',
      groupId: threadId,
      groupType: threadType,
      whisper: whisperMode,
      whisperTo: recipient,
    }]);
  };

  const renderMediaPreview = (message: ChatMessage) => {
    if (!message.mediaUrl) return null;

    if (message.mediaType === 'audio') {
      return (
        <div className="mb-2 flex h-20 items-center justify-center rounded-xl border border-dashed border-emerald-400/30 bg-emerald-500/10 text-emerald-200">
          <div className="flex flex-col items-center gap-1">
            <Mic size={20} />
            <span className="text-[11px] uppercase tracking-[0.24em]">Voice note</span>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-2 flex h-24 items-center justify-center overflow-hidden rounded-xl border border-dashed border-emerald-400/30 bg-[#05111f]/80">
        <div className="flex flex-col items-center gap-1 text-emerald-100/80">
          <Video size={22} />
          <span className="text-xs font-mono uppercase tracking-[0.24em]">{message.mediaType === 'image' ? 'Shared image' : 'Form check video'}</span>
        </div>
      </div>
    );
  };

  if (activeChat) {
    const hasInput = input.trim().length > 0;
    const chatDisplayName = activeChat.kind === 'favorite' ? 'Coach Alex' : activeChat.title;
    const chatStatus = activeChat.kind === 'favorite' ? 'Coach • Online' : (activeChat.badge ?? 'Live');

    return (
      <div className="animate-fade-in">
        <div className="flex h-screen h-[100dvh] w-full flex-col overflow-hidden rounded-[1.6rem] border border-emerald-500/10 bg-[#030712]/95 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <div className="z-10 flex w-full shrink-0 flex-col border-b border-emerald-500/10 bg-[#091124]/95">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-500/10 bg-[#030712]/80 text-emerald-300 transition hover:border-emerald-500/20 hover:text-emerald-200">
                  <Menu size={16} />
                </button>
                <div>
                  <div className="text-sm font-semibold text-white">Messages</div>
                  <div className="text-[11px] text-slate-400">Coach & community</div>
                </div>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 text-[11px] font-semibold text-slate-950">
                p
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-emerald-500/10 px-4 py-3">
              <button
                onClick={() => setActiveChat(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-500/10 bg-[#030712]/80 text-emerald-300 transition hover:border-emerald-500/20 hover:text-emerald-200"
                aria-label="Go back"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-sm font-bold text-emerald-200">
                {activeChat.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white">{chatDisplayName}</div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-emerald-300">{chatStatus}</span>
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-500">
                {activeChat.kind === 'favorite' ? 'Direct' : 'Group'}
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.06),_transparent_45%)] px-4 py-4 pb-28">
            {activeThreadMessages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center rounded-[1rem] border border-dashed border-emerald-500/20 bg-[#091124]/60 p-6 text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                  <MessageCircle size={24} />
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">{activeChat.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{activeChat.subtitle}</p>
              </div>
            ) : (
              <div className="mx-auto flex w-full max-w-3xl flex-col space-y-4">
                {activeThreadMessages.map(message => {
                const isMe = message.senderId === CURRENT_CLIENT_ID;
                const isWhisper = Boolean(message.whisper);
                const canViewWhisper = !isWhisper || isMe || message.whisperTo === CURRENT_CLIENT_ID || message.whisperTo === CURRENT_TRAINER_ID;
                const isLocked = isWhisper && !canViewWhisper;

                return (
                  <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl border px-4 py-3 text-sm leading-relaxed backdrop-blur-xl ${
                      isMe ? 'rounded-tr-sm border-emerald-500/20 bg-emerald-950/30 text-slate-100' : 'rounded-tl-sm border-slate-800 bg-slate-900/50 text-slate-100'
                    } ${isWhisper && canViewWhisper ? 'border-dashed border-emerald-400/40 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : ''}`}>
                      {isLocked ? (
                        <div className="rounded-xl border border-dashed border-emerald-400/30 bg-[#030712]/80 p-3 text-center text-slate-300">
                          <div className="mb-2 flex items-center justify-center gap-2 text-emerald-200">
                            <EyeOff size={16} />
                            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-300">Private Whisper</span>
                          </div>
                          <p className="text-sm text-slate-400">🔒 Private Whisper (Only accessible to selected recipient)</p>
                        </div>
                      ) : (
                        <>
                          {isWhisper && canViewWhisper && (
                            <div className="mb-2 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-300">
                              <Lock size={12} />
                              Whisper for you
                            </div>
                          )}
                          {message.mediaUrl && renderMediaPreview(message)}
                          <div className="break-words">{message.text}</div>
                          <div className={`mt-2 flex items-center gap-2 font-mono text-[11px] ${isMe ? 'text-emerald-200' : 'text-slate-400'}`}>
                            <span>{new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="text-emerald-300">{isMe ? '✓✓' : '↺'}</span>
                            {message.tag === 'form_review' && <span className="ml-1.5 text-amber-400">· Form Review</span>}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
                })}
              </div>
            )}
          </div>

          <div className="flex w-full shrink-0 border-t border-emerald-500/10 bg-[#091124]/95 p-3 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-full border border-emerald-500/10 bg-[#091124]/70 px-3 py-2.5 shadow-[0_0_18px_rgba(16,185,129,0.08)]">
              <button
                onClick={sendVideoMock}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-500/10 bg-[#030712]/80 text-slate-300 transition-all hover:border-emerald-500/20 hover:text-emerald-200"
                title="Send form check video"
              >
                <Plus size={16} />
              </button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder={`Reply to ${activeChat.title}...`}
                className="h-9 flex-1 border-0 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
              />
              <button
                onClick={() => setWhisperMode(value => !value)}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all ${whisperMode ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'border-emerald-500/10 bg-[#030712]/80 text-slate-400 hover:border-emerald-500/20 hover:text-emerald-200'}`}
                title="Toggle whisper mode"
              >
                <Mic size={16} />
              </button>
              {whisperMode && (
                <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-950/20 px-2.5 py-1.5 text-[11px] text-emerald-200">
                  <span className="font-mono uppercase tracking-[0.24em]">Whisper to</span>
                  <select
                    value={whisperTarget ?? ''}
                    onChange={e => setWhisperTarget(e.target.value)}
                    className="bg-transparent text-emerald-100 outline-none"
                  >
                    {whisperOptions.map(option => (
                      <option key={option.id} value={option.id} className="bg-slate-900 text-slate-100">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <button
                onClick={send}
                disabled={!input.trim()}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${hasInput ? 'bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.22)]' : 'bg-slate-800/80 text-slate-500'}`}
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="rounded-[1.4rem] border border-emerald-500/10 bg-[#091124]/60 p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-400/80">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          Athletic Communication Console
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-wide text-white">Messages</h1>
        <p className="mt-1 text-sm text-slate-400">Private whispers, squad updates, and trainer broadcast replies in one place.</p>
      </div>

      <div className="overflow-hidden rounded-[1.6rem] border border-emerald-500/10 bg-[#030712]/95 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-emerald-500/10 bg-[#091124]/60 px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Messages</h2>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Secure coaching network</p>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/10 bg-[#030712]/80 text-emerald-300 transition hover:border-emerald-500/20 hover:text-emerald-200">
            <Search size={16} />
          </button>
        </div>

        <div className="flex min-h-[72vh] flex-col lg:flex-row">
          <aside className="w-full border-b border-emerald-500/10 bg-[#050b16]/90 p-3 lg:w-[320px] lg:border-b-0 lg:border-r">
            <div className="mb-3 rounded-2xl border border-emerald-500/10 bg-[#091124]/70 p-3">
              <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-400/80">
                <span>Favorites</span>
                <button className="rounded-full border border-emerald-500/10 bg-[#030712]/70 p-1 text-emerald-300">
                  <Plus size={12} />
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {favorites.map(favorite => (
                  <button
                    key={favorite.id}
                    onClick={() => handleOpenFavorite(favorite)}
                    className="flex min-w-[62px] flex-col items-center gap-1 text-center"
                  >
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-sm font-bold text-emerald-200">
                      {favorite.initials}
                      <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-[#050b16] ${favorite.online ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                    </div>
                    <span className="max-w-[62px] truncate text-[11px] text-slate-400">{favorite.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              {groupOptions.map(group => {
                const isActive = group.id === selectedGroup?.id;
                const locked = group.premiumRequired && !premiumUnlocked;
                return (
                  <button
                    key={group.id}
                    onClick={() => handleSelectGroup(group)}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all ${isActive ? 'border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_14px_rgba(16,185,129,0.08)]' : 'border-transparent bg-transparent hover:border-emerald-500/10 hover:bg-[#091124]/60'}`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-sm font-semibold ${isActive ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-slate-800 bg-slate-900/70 text-slate-300'}`}>
                      {group.label.split(' ').slice(0, 2).map(word => word[0]).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`truncate text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>{group.label}</span>
                        {group.premiumRequired && (
                          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-500">
                            Premium
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-slate-500">{group.type === 'squad' ? 'Invite friends' : group.description}</span>
                        <span className="font-mono text-[10px] text-emerald-300">{group.type === 'broadcast' ? '08:32' : 'now'}</span>
                      </div>
                    </div>
                    {locked && <Lock size={12} className="text-amber-500" />}
                  </button>
                );
              })}
            </div>
          </aside>

          {selectedGroup ? (
            <section className="flex min-h-[420px] flex-1 flex-col">
              <div className="flex shrink-0 flex-col border-b border-emerald-500/10 bg-[#091124]/60">
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={handleBackToList}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-500/10 bg-[#030712]/80 text-emerald-300 transition hover:border-emerald-500/20 hover:text-emerald-200"
                      aria-label="Go back"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div>
                      <div className="text-sm font-semibold text-white">FITFORGE Messages</div>
                      <div className="text-[11px] text-slate-400">Coach & community</div>
                    </div>
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 text-[11px] font-semibold text-slate-950">
                    p
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-emerald-500/10 px-4 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-sm font-bold text-emerald-200">
                    {selectedGroup.label.split(' ').slice(0, 2).map(word => word[0]).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white">{selectedGroup.label}</div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-emerald-300">Live now</span>
                    </div>
                  </div>
                  {selectedGroup.premiumRequired && !premiumUnlocked && (
                    <div className="shrink-0 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-500">
                      Premium
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.06),_transparent_45%)] p-4">
              {visibleMessages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center rounded-[1rem] border border-dashed border-emerald-500/20 bg-[#091124]/60 p-6 text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                    <MessageCircle size={24} />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-white">Your group is ready</h3>
                  <p className="mt-1 text-sm text-slate-400">Start a whisper or a group update with your circle.</p>
                </div>
              )}

              {visibleMessages.map(message => {
                const isMe = message.senderId === CURRENT_CLIENT_ID;
                const isWhisper = Boolean(message.whisper);
                const canViewWhisper = !isWhisper || isMe || message.whisperTo === CURRENT_CLIENT_ID || message.whisperTo === CURRENT_TRAINER_ID;
                const isLocked = isWhisper && !canViewWhisper;

                return (
                  <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl border p-3 text-sm leading-relaxed backdrop-blur-xl ${
                      isMe ? 'rounded-tr-sm border-emerald-500/20 bg-emerald-950/30 text-slate-100' : 'rounded-tl-sm border-slate-800 bg-slate-900/50 text-slate-100'
                    } ${isWhisper && canViewWhisper ? 'border-dashed border-emerald-400/40 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : ''}`}>
                      {isLocked ? (
                        <div className="rounded-xl border border-dashed border-emerald-400/30 bg-[#030712]/80 p-3 text-center text-slate-300">
                          <div className="mb-2 flex items-center justify-center gap-2 text-emerald-200">
                            <EyeOff size={16} />
                            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-300">Private Whisper</span>
                          </div>
                          <p className="text-sm text-slate-400">🔒 Private Whisper (Only accessible to selected recipient)</p>
                        </div>
                      ) : (
                        <>
                          {isWhisper && canViewWhisper && (
                            <div className="mb-2 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-300">
                              <Lock size={12} />
                              Whisper for you
                            </div>
                          )}
                          {message.mediaUrl && renderMediaPreview(message)}
                          <div className="break-words">{message.text}</div>
                          <div className={`mt-2 flex items-center gap-2 font-mono text-[11px] ${isMe ? 'text-emerald-200' : 'text-slate-400'}`}>
                            <span>{new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="text-emerald-300">{isMe ? '✓✓' : '↺'}</span>
                            {message.tag === 'form_review' && <span className="ml-1.5 text-amber-400">· Form Review</span>}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="shrink-0 border-t border-emerald-500/10 bg-[#091124]/60 p-3">
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/10 bg-[#091124]/60 px-4 py-2.5 backdrop-blur-md">
                <button
                  onClick={sendVideoMock}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-500/10 bg-[#030712]/80 text-slate-300 transition-all hover:border-emerald-500/20 hover:text-emerald-200"
                  title="Send form check video"
                >
                  <Plus size={16} />
                </button>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="Share an update or whisper privately..."
                  className="flex-1 border-0 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                />
                <button
                  onClick={() => setWhisperMode(value => !value)}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all ${whisperMode ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'border-emerald-500/10 bg-[#030712]/80 text-slate-400 hover:border-emerald-500/20 hover:text-emerald-200'}`}
                  title="Toggle whisper mode"
                >
                  <Mic size={16} />
                </button>
                {whisperMode && (
                  <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-950/20 px-2.5 py-1.5 text-[11px] text-emerald-200">
                    <span className="font-mono uppercase tracking-[0.24em]">Whisper to</span>
                    <select
                      value={whisperTarget ?? ''}
                      onChange={e => setWhisperTarget(e.target.value)}
                      className="bg-transparent text-emerald-100 outline-none"
                    >
                      {whisperOptions.map(option => (
                        <option key={option.id} value={option.id} className="bg-slate-900 text-slate-100">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  onClick={send}
                  disabled={!input.trim()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 transition disabled:opacity-40"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </section>
          ) : (
            <section className="flex min-h-[420px] flex-1 items-center justify-center border-l border-emerald-500/10 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.06),_transparent_45%)] p-6">
              <div className="max-w-sm text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                  <MessageCircle size={24} />
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">Pick a conversation</h3>
                <p className="mt-1 text-sm text-slate-400">Select a group or channel from the list to open the fixed chat view.</p>
              </div>
            </section>
          )}
        </div>
      </div>

      {premiumModalGroup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-[1.4rem] border border-emerald-500/20 bg-[#030712]/95 p-5 shadow-[0_0_35px_rgba(16,185,129,0.12)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                <Crown size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Upgrade to PRO</h3>
                <p className="text-sm text-slate-400">Unlock trainer broadcasts and private whisper channels with premium access.</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-slate-300">
              <ul className="space-y-2">
                <li>• Private squad rooms with invite-only access</li>
                <li>• Trainer broadcast channels with premium replies</li>
                <li>• Whisper media sharing with selected recipients only</li>
              </ul>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleUpgrade} className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 px-3 py-2.5 text-sm font-semibold text-slate-950">
                Upgrade Now
              </button>
              <button onClick={() => setPremiumModalGroup(null)} className="rounded-xl border border-slate-700/60 px-3 py-2.5 text-sm font-semibold text-slate-300">
                Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
