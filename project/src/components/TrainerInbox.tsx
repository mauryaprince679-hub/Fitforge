import { useEffect, useMemo, useState } from 'react';
import { Search, Send, Video, Inbox, ArrowLeft, ShieldCheck, Users, Trash2, Plus, Mic, Menu } from 'lucide-react';
import type { ChatMessage } from '../types';
import { MOCK_CHAT_MESSAGES, MOCK_GROUP_CHAT_MESSAGES, getTrainerClients, CURRENT_TRAINER_ID } from '../data';

type FilterTag = 'all' | 'unread' | 'high_priority' | 'form_review';
type ChatTier = 'direct' | 'subscribers' | 'community';
type MessageRole = 'trainer' | 'user';
type ActiveChat =
  | { kind: 'direct'; clientId: string }
  | { kind: 'group'; tier: Exclude<ChatTier, 'direct'> };

const PREMIUM_CLIENT_IDS = ['u_client_1', 'u_client_2'];
const PREMIUM_GROUP_ID = 'premium-group';
const COMMUNITY_GROUP_ID = 'community';

const tierConfig = {
  direct: {
    title: 'Unified Inbox',
    subtitle: 'Direct coaching conversations for premium clients.',
    placeholder: 'Reply to',
    accent: 'from-sky-500/20 to-cyan-600/10',
  },
  subscribers: {
    title: 'Premium Group',
    subtitle: 'Broadcasts and member discussions for your active subscribers.',
    placeholder: 'Message group...',
    accent: 'from-emerald-500/20 to-lime-600/10',
  },
  community: {
    title: 'Community Chat',
    subtitle: 'Open conversations for all members to engage and share.',
    placeholder: 'Post to community...',
    accent: 'from-violet-500/20 to-fuchsia-600/10',
  },
} as const;

const getInitialGroupMessages = (): ChatMessage[] => [
  {
    id: 'group-premium-1',
    senderId: CURRENT_TRAINER_ID,
    receiverId: PREMIUM_GROUP_ID,
    text: 'Premium subscribers: the mobility primer is live for tonight’s recovery block.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: true,
    tag: 'general',
    groupId: PREMIUM_GROUP_ID,
    groupType: 'squad',
  },
  {
    id: 'group-premium-2',
    senderId: 'u_client_1',
    receiverId: PREMIUM_GROUP_ID,
    text: 'Coach, I want to share a quick form note before tomorrow’s session.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: true,
    tag: 'form_review',
    mediaUrl: 'mock-video',
    mediaType: 'video',
    whisper: true,
    whisperTo: CURRENT_TRAINER_ID,
    groupId: PREMIUM_GROUP_ID,
    groupType: 'squad',
  },
  ...MOCK_GROUP_CHAT_MESSAGES.filter(message => message.groupId === COMMUNITY_GROUP_ID),
];

interface TrainerInboxProps {
  onActiveChatChange?: (active: boolean) => void;
}

export default function TrainerInbox({ onActiveChatChange }: TrainerInboxProps) {
  const clients = getTrainerClients(CURRENT_TRAINER_ID);
  const premiumClients = useMemo(() => clients.filter(client => PREMIUM_CLIENT_IDS.includes(client.id)), [clients]);

  const [filter, setFilter] = useState<FilterTag>('all');
  const [activeTier, setActiveTier] = useState<ChatTier>('direct');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(premiumClients[0]?.id ?? null);
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [...MOCK_CHAT_MESSAGES, ...getInitialGroupMessages()]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (activeTier === 'direct' && premiumClients.length > 0 && !selectedClientId) {
      setSelectedClientId(premiumClients[0].id);
    }
  }, [activeTier, premiumClients, selectedClientId]);

  useEffect(() => {
    onActiveChatChange?.(Boolean(activeChat));
  }, [activeChat, onActiveChatChange]);

  const directConversations = useMemo(() => premiumClients.map(client => {
    const convoMsgs = messages
      .filter(message => (message.senderId === client.id && message.receiverId === CURRENT_TRAINER_ID) || (message.senderId === CURRENT_TRAINER_ID && message.receiverId === client.id))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const lastMsg = convoMsgs[0];
    const unreadCount = convoMsgs.filter(message => message.receiverId === CURRENT_TRAINER_ID && !message.read).length;
    const hasHighPriority = convoMsgs.some(message => message.priority === 'high' && message.receiverId === CURRENT_TRAINER_ID && !message.read);
    const hasFormReview = convoMsgs.some(message => message.tag === 'form_review');
    return { client, lastMsg, unreadCount, hasHighPriority, hasFormReview, msgCount: convoMsgs.length };
  }), [messages, premiumClients]);

  const filteredConversations = directConversations.filter(conversation => {
    if (filter === 'unread' && conversation.unreadCount === 0) return false;
    if (filter === 'high_priority' && !conversation.hasHighPriority) return false;
    if (filter === 'form_review' && !conversation.hasFormReview) return false;
    if (search && !conversation.client.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selectedClient = premiumClients.find(client => client.id === selectedClientId);
  const activeConversationClient = activeChat?.kind === 'direct'
    ? premiumClients.find(client => client.id === activeChat.clientId) ?? selectedClient
    : undefined;

  const activeMessages = useMemo(() => {
    switch (activeTier) {
      case 'subscribers':
        return messages.filter(message => message.groupId === PREMIUM_GROUP_ID).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      case 'community':
        return messages.filter(message => message.groupId === COMMUNITY_GROUP_ID).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      default:
        return selectedClientId
          ? messages
              .filter(message => (message.senderId === selectedClientId && message.receiverId === CURRENT_TRAINER_ID) || (message.senderId === CURRENT_TRAINER_ID && message.receiverId === selectedClientId))
              .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          : [];
    }
  }, [activeTier, messages, selectedClientId]);

  const send = () => {
    if (!input.trim()) return;

    const baseMessage: ChatMessage = {
      id: `msg${Date.now()}`,
      senderId: CURRENT_TRAINER_ID,
      receiverId: activeTier === 'direct' ? selectedClientId ?? '' : activeTier === 'subscribers' ? PREMIUM_GROUP_ID : COMMUNITY_GROUP_ID,
      text: input.trim(),
      timestamp: new Date().toISOString(),
      read: true,
      tag: 'general',
      ...(activeTier === 'direct' ? {} : { groupId: activeTier === 'subscribers' ? PREMIUM_GROUP_ID : COMMUNITY_GROUP_ID, groupType: activeTier === 'subscribers' ? 'squad' : 'community' }),
    };

    if (activeTier === 'direct' && !selectedClientId) return;

    setMessages(prev => [...prev, baseMessage]);
    setInput('');
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(message => message.id !== messageId));
  };

  const getMessageRole = (senderId: string): MessageRole => (senderId === CURRENT_TRAINER_ID ? 'trainer' : 'user');

  const totalUnread = directConversations.reduce((count, conversation) => count + conversation.unreadCount, 0);
  const activeConfig = tierConfig[activeTier];

  const openDirectChat = (clientId: string) => {
    setSelectedClientId(clientId);
    setActiveChat({ kind: 'direct', clientId });
  };

  const openGroupChat = (tier: Exclude<ChatTier, 'direct'>) => {
    setActiveTier(tier);
    setActiveChat({ kind: 'group', tier });
  };

  const closeChat = () => {
    setActiveChat(null);
  };

  if (activeChat) {
    const chatTitle = activeChat.kind === 'direct'
      ? activeConversationClient?.name ?? 'Client conversation'
      : activeChat.tier === 'subscribers'
        ? 'Premium Group'
        : 'Community Chat';

    const chatSubtitle = activeChat.kind === 'direct'
      ? activeConversationClient?.email ?? 'Premium coaching access'
      : activeChat.tier === 'subscribers'
        ? 'Trainer + active subscribers'
        : 'Open discussion feed';

    return (
      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/80 shadow-[0_0_80px_rgba(0,0,0,0.25)] animate-fade-in">
        <div className="relative z-20 flex shrink-0 flex-col border-b border-white/10 bg-slate-950/95 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-3 py-3">
            <div className="flex items-center gap-2.5">
              <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-200 transition hover:bg-slate-800/80">
                <Menu size={16} />
              </button>
              <div>
                <div className="text-sm font-semibold text-white">FITFORGE Unified Inbox</div>
                <div className="text-[11px] text-slate-400">Trainer workspace</div>
              </div>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 text-[11px] font-semibold text-slate-950">
              p
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-white/10 px-3 py-3">
            <button
              onClick={closeChat}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-200 transition hover:bg-slate-800/80"
              aria-label="Go back"
              title="Go back"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 text-[11px] font-semibold text-white">
              {activeChat.kind === 'direct' ? (activeConversationClient?.avatarInitials ?? 'AR') : activeChat.tier === 'subscribers' ? 'G' : 'C'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white">{chatTitle}</div>
              <div className="truncate text-[11px] text-slate-400">{chatSubtitle}</div>
            </div>
            <span className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
              {activeChat.kind === 'direct' ? '1:1' : activeChat.tier === 'subscribers' ? 'Premium' : 'Community'}
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 pb-28">
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {activeMessages.length === 0 ? (
              <div className="flex min-h-[240px] items-center justify-center rounded-[1.4rem] border border-dashed border-white/10 bg-slate-900/50 p-6 text-center">
                <div>
                  <Inbox size={24} className="mx-auto mb-2 text-slate-500" />
                  <p className="text-sm text-slate-400">No messages yet in this conversation.</p>
                </div>
              </div>
            ) : (
              activeMessages.map(message => {
                const isMe = message.senderId === CURRENT_TRAINER_ID;
                const role = getMessageRole(message.senderId);
                return (
                  <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[78%] rounded-[1.25rem] px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${isMe ? 'bg-emerald-500/15 text-emerald-100' : 'bg-slate-800/90 text-slate-200'}`}>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${role === 'trainer' ? 'text-emerald-300' : 'text-slate-400'}`}>
                          {role === 'trainer' ? 'Trainer · Admin' : 'Member'}
                        </span>
                        {isMe && (
                          <button onClick={() => deleteMessage(message.id)} className="rounded-full p-1 text-slate-400 transition hover:bg-slate-700/70 hover:text-white">
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                      {message.mediaUrl && (
                        <div className="mb-2 flex h-20 items-center justify-center overflow-hidden rounded-xl bg-black/30">
                          <div className="flex flex-col items-center gap-1 text-white/80">
                            <Video size={17} />
                            <span className="text-[11px]">Form check video</span>
                          </div>
                        </div>
                      )}
                      <p>{message.text}</p>
                      <div className={`mt-2 text-[11px] ${isMe ? 'text-emerald-200/70' : 'text-slate-500'}`}>
                        {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        {message.priority === 'high' && <span className="ml-2 text-amber-300">· High Priority</span>}
                        {message.tag === 'form_review' && <span className="ml-2 text-cyan-300">· Form Review</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 shrink-0 border-t border-white/10 bg-slate-950/95 px-3 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-full border border-slate-800/80 bg-slate-900/95 px-2 py-2 shadow-lg shadow-black/20">
            <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800/80 text-slate-200 transition hover:bg-slate-700/80">
              <Plus size={16} />
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder={activeChat.kind === 'direct' ? `${activeConfig.placeholder} ${activeConversationClient?.name.split(' ')[0] ?? 'client'}...` : activeConfig.placeholder}
              className="h-9 flex-1 bg-transparent px-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
            />
            <div className="flex items-center gap-2">
              <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800/80 text-slate-200 transition hover:bg-slate-700/80">
                <Mic size={15} />
              </button>
              <button onClick={send} disabled={!input.trim() || (activeChat.kind === 'direct' && !activeConversationClient)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/90 text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40">
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full flex-col gap-3 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 py-1">
        <div>
          <h1 className="text-lg font-semibold text-white">{activeConfig.title}</h1>
          <p className="text-[11px] text-slate-400">{activeConfig.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTier === 'direct' && totalUnread > 0 && (
            <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-300">{totalUnread} unread</span>
          )}
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            {activeTier === 'direct' ? '1:1' : activeTier === 'subscribers' ? 'Premium' : 'Community'}
          </span>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="card flex min-h-0 flex-col overflow-hidden bg-slate-950/70">
          <div className="border-b border-white/10 px-3 py-2.5">
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(tierConfig).map(([key]) => {
                const isActive = activeTier === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      if (key === 'direct') {
                        setActiveTier('direct');
                        setActiveChat(null);
                      } else {
                        openGroupChat(key as Exclude<ChatTier, 'direct'>);
                      }
                    }}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all ${isActive ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20' : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700/80 hover:text-slate-200'}`}
                  >
                    {key === 'direct' ? 'Direct' : key === 'subscribers' ? 'Premium' : 'Community'}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTier === 'direct' ? (
            <>
              <div className="border-b border-white/10 px-3 py-2.5">
                <div className="relative">
                  <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search clients"
                    className="w-full rounded-full border border-slate-800/80 bg-slate-900/80 py-2 pl-8 pr-3 text-xs text-slate-100 outline-none transition focus:border-emerald-400/40"
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {([
                    { id: 'all' as FilterTag, label: 'All' },
                    { id: 'unread' as FilterTag, label: 'Unread' },
                    { id: 'high_priority' as FilterTag, label: 'Priority' },
                    { id: 'form_review' as FilterTag, label: 'Form' },
                  ]).map(filterOption => (
                    <button
                      key={filterOption.id}
                      onClick={() => setFilter(filterOption.id)}
                      className={`rounded-full px-2 py-1 text-[10px] font-medium transition-all ${filter === filterOption.id ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800/70 text-slate-400 hover:bg-slate-700/80'}`}
                    >
                      {filterOption.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map(({ client, lastMsg, unreadCount, hasHighPriority, hasFormReview }) => (
                  <button
                    key={client.id}
                    onClick={() => openDirectChat(client.id)}
                    className={`w-full border-b border-white/5 px-3 py-3 text-left transition ${selectedClientId === client.id ? 'bg-emerald-500/10' : 'hover:bg-slate-800/70'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 text-[11px] font-semibold text-white">
                        {client.avatarInitials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-white">{client.name}</span>
                          {lastMsg && <span className="shrink-0 text-[10px] text-slate-500">{new Date(lastMsg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          {lastMsg && <span className="flex-1 truncate text-xs text-slate-400">{lastMsg.text}</span>}
                          {unreadCount > 0 && <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-300">{unreadCount}</span>}
                        </div>
                        {(hasHighPriority || hasFormReview) && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {hasHighPriority && <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold text-amber-300">Priority</span>}
                            {hasFormReview && <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-semibold text-cyan-300">Form</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 space-y-3 p-3">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                <div className="flex items-center gap-2 text-[12px] font-semibold">
                  <Users size={14} /> {activeTier === 'subscribers' ? 'Premium subscribers group' : 'Community group'}
                </div>
                <p className="mt-1 text-[11px] text-emerald-100/80">
                  {activeTier === 'subscribers'
                    ? 'Training updates, subscriber check-ins, and premium-only announcements in one place.'
                    : 'Open discussion feed for members to share wins, ask questions, and stay connected.'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-sm text-slate-300">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-white">
                  <ShieldCheck size={14} className="text-emerald-400" /> Roles & access
                </div>
                <ul className="mt-2 space-y-1 text-[11px] text-slate-400">
                  <li>• Trainer: admin access and message deletion</li>
                  <li>• Subscribers: group posting and replies</li>
                  <li>• Community: open posting and public visibility</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="card flex min-h-0 flex-col overflow-hidden bg-slate-950/70">
          <div className="flex items-center gap-3 border-b border-white/10 px-3 py-2.5">
            {activeTier === 'direct' ? (
              <>
                <button onClick={closeChat} className="rounded-full p-1 text-slate-400 transition hover:bg-slate-800/70 hover:text-white lg:hidden">
                  <ArrowLeft size={16} />
                </button>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 text-[11px] font-semibold text-white">
                  {selectedClient?.avatarInitials ?? '✦'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-white">{selectedClient?.name ?? 'Select a client'}</div>
                  <div className="truncate text-[11px] text-slate-400">{selectedClient?.email ?? 'Premium coaching access'}</div>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 text-[11px] font-semibold text-slate-950">
                  {activeTier === 'subscribers' ? 'G' : 'C'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-white">{activeTier === 'subscribers' ? 'Premium Group' : 'Community Chat'}</div>
                  <div className="truncate text-[11px] text-slate-400">{activeTier === 'subscribers' ? 'Trainer + active subscribers' : 'Open discussion feed'}</div>
                </div>
              </>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {activeMessages.length === 0 ? (
                <div className="flex h-full min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-900/50 p-6 text-center">
                  <div>
                    <Inbox size={24} className="mx-auto mb-2 text-slate-500" />
                    <p className="text-sm text-slate-400">No messages in this tier yet.</p>
                  </div>
                </div>
              ) : (
                activeMessages.map(message => {
                  const isMe = message.senderId === CURRENT_TRAINER_ID;
                  const role = getMessageRole(message.senderId);
                  return (
                    <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${isMe ? 'bg-emerald-500/15 text-emerald-100' : 'bg-slate-800/90 text-slate-200'}`}>
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${role === 'trainer' ? 'text-emerald-300' : 'text-slate-400'}`}>
                            {role === 'trainer' ? 'Trainer · Admin' : 'Member'}
                          </span>
                          {isMe && (
                            <button onClick={() => deleteMessage(message.id)} className="rounded-full p-1 text-slate-400 transition hover:bg-slate-700/70 hover:text-white">
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                        {message.mediaUrl && (
                          <div className="mb-2 flex h-20 items-center justify-center overflow-hidden rounded-xl bg-black/30">
                            <div className="flex flex-col items-center gap-1 text-white/80">
                              <Video size={17} />
                              <span className="text-[11px]">Form check video</span>
                            </div>
                          </div>
                        )}
                        <p>{message.text}</p>
                        <div className={`mt-2 text-[11px] ${isMe ? 'text-emerald-200/70' : 'text-slate-500'}`}>
                          {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          {message.priority === 'high' && <span className="ml-2 text-amber-300">· High Priority</span>}
                          {message.tag === 'form_review' && <span className="ml-2 text-cyan-300">· Form Review</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="border-t border-white/10 px-3 py-3">
            <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-full border border-slate-800/80 bg-slate-900/90 px-2 py-2 shadow-lg shadow-black/20">
              <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800/80 text-slate-200 transition hover:bg-slate-700/80">
                <Plus size={16} />
              </button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder={activeTier === 'direct' ? `${activeConfig.placeholder} ${selectedClient?.name.split(' ')[0] ?? 'client'}...` : activeConfig.placeholder}
                className="h-9 flex-1 bg-transparent px-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
              />
              <div className="flex items-center gap-2">
                <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800/80 text-slate-200 transition hover:bg-slate-700/80">
                  <Mic size={15} />
                </button>
                <button onClick={send} disabled={!input.trim() || (activeTier === 'direct' && !selectedClientId)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/90 text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40">
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
