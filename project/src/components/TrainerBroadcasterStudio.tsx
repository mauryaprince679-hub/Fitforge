import { useState, useEffect, useRef } from 'react';
import {
  Video, VideoOff, Mic, MicOff, MonitorUp, Square, Send, Users, MessageCircle,
  Camera, Settings, Play, Radio, Wifi, WifiOff, AlertCircle, CheckCircle2, Upload,
} from 'lucide-react';
import { useLive } from '../lib/live';
import { useAuth } from '../lib/auth';
import { getWorkoutsForTrainer, MOCK_LIVE_PARTICIPANTS, getWorkoutById } from '../data';
import type { LiveParticipant } from '../types';
import { listTrainingVideos, uploadTrainingVideo, type TrainingVideo } from '../lib/videos';
import VideoPlayer from './VideoPlayer';

export default function TrainerBroadcasterStudio() {
  const { activeSession, startStream, endStream, chatMessages, addChatMessage, viewerCount } = useLive();
  const { profile } = useAuth();

  // Setup state
  const [title, setTitle] = useState('');
  const [linkedWorkoutId, setLinkedWorkoutId] = useState('');
  const [camReady, setCamReady] = useState(false);
  const [micReady, setMicReady] = useState(false);

  // Active stream state
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sideTab, setSideTab] = useState<'chat' | 'clients'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [simChatTick, setSimChatTick] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoMessage, setVideoMessage] = useState<string | null>(null);
  const [uploadedVideos, setUploadedVideos] = useState<TrainingVideo[]>([]);
  const isVideoPublisher = profile?.role === 'trainer' || profile?.role === 'admin';

  // Video element references & stream tracking
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const trainerWorkouts = profile ? getWorkoutsForTrainer('u_trainer_1') : [];

  // Initialize actual camera & microphone
  useEffect(() => {
    let isMounted = true;

    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        mediaStreamRef.current = stream;

        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = stream;
        }
        if (activeVideoRef.current) {
          activeVideoRef.current.srcObject = stream;
        }

        setCamReady(true);
        setMicReady(true);
      } catch (err) {
        console.error('Failed to access camera/microphone:', err);
        if (isMounted) {
          setCamReady(false);
          setMicReady(false);
        }
      }
    }

    initMedia();

    return () => {
      isMounted = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, []);

  // Sync video/audio tracks with cameraOn and micOn toggles
  useEffect(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = cameraOn;
      });
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = micOn;
      });
    }
  }, [cameraOn, micOn]);

  // Attach media stream when switching to active session
  useEffect(() => {
    if (activeSession && activeVideoRef.current && mediaStreamRef.current) {
      activeVideoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [activeSession]);

  useEffect(() => {
    if (!isVideoPublisher) return;
    listTrainingVideos().then(setUploadedVideos).catch(() => setVideoMessage('Unable to load uploaded videos.'));
  }, [isVideoPublisher]);

  // Stream timer
  useEffect(() => {
    if (!activeSession) { setElapsed(0); return; }
    const interval = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  // Simulated incoming client chat messages
  useEffect(() => {
    if (!activeSession) return;
    const simMessages = [
      { name: 'Sarah Chen', role: 'client' as const, msg: 'This is tough!' },
      { name: 'Tom Reyes', role: 'client' as const, msg: 'Feeling the burn 🔥' },
      { name: 'Alex Rivera', role: 'client' as const, msg: 'How many more rounds?' },
      { name: 'Mia Cole', role: 'client' as const, msg: 'Got it, thanks coach!' },
      { name: 'Jake Morrison', role: 'client' as const, msg: 'My legs are shaking' },
    ];
    const interval = setInterval(() => {
      const m = simMessages[simChatTick % simMessages.length];
      addChatMessage({ userId: 'sim', userName: m.name, userRole: m.role, message: m.msg });
      setSimChatTick(prev => prev + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, [activeSession, addChatMessage, simChatTick]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}` : `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleGoLive = () => {
    if (!title.trim()) return;
    startStream(title.trim(), linkedWorkoutId || undefined);
  };

  const sendChat = () => {
    if (!chatInput.trim() || !profile) return;
    addChatMessage({ userId: profile.id, userName: profile.name, userRole: 'trainer', message: chatInput.trim() });
    setChatInput('');
  };

  const handleVideoUpload = async () => {
    if (!profile || !selectedVideo || !isVideoPublisher) return;
    setUploadingVideo(true);
    setVideoMessage(null);
    try {
      const video = await uploadTrainingVideo(selectedVideo, videoTitle, profile.id);
      setUploadedVideos(current => [video, ...current]);
      setSelectedVideo(null);
      setVideoTitle('');
      setVideoMessage('Video uploaded and ready to watch.');
    } catch (error) {
      setVideoMessage(error instanceof Error ? error.message : 'Video upload failed.');
    } finally {
      setUploadingVideo(false);
    }
  };

  // ---- SETUP SCREEN ----
  if (!activeSession) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Streaming Studio</h1>
          <p className="text-slate-400 text-sm mt-1">Configure your devices and start broadcasting to your clients.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Device preview */}
          <div className="card p-5">
            <h2 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
              <Camera size={16} className="text-blue-400" /> Device Preview
            </h2>
            <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-700/50 flex items-center justify-center">
              {!camReady ? (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
                  <span className="text-xs">Initializing camera...</span>
                </div>
              ) : (
                <>
                  <video
                    ref={previewVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-md font-semibold ${camReady ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                      {camReady ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />} Cam
                    </span>
                    <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-md font-semibold ${micReady ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                      {micReady ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />} Mic
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2.5 bg-slate-800/50 rounded-lg">
                {camReady ? <Camera size={14} className="text-green-400" /> : <Camera size={14} className="text-slate-500" />}
                <span className="text-xs text-slate-400">Camera {camReady ? 'Ready' : 'Loading'}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-slate-800/50 rounded-lg">
                {micReady ? <Mic size={14} className="text-green-400" /> : <Mic size={14} className="text-slate-500" />}
                <span className="text-xs text-slate-400">Microphone {micReady ? 'Ready' : 'Loading'}</span>
              </div>
            </div>
          </div>

          {/* Stream config */}
          <div className="card p-5">
            <h2 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
              <Settings size={16} className="text-blue-400" /> Stream Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Stream Title</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Live Full Body HIIT - 9:00 AM"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Link Workout Routine (Optional)</label>
                <select
                  value={linkedWorkoutId}
                  onChange={e => setLinkedWorkoutId(e.target.value)}
                  className="input-field w-full appearance-none cursor-pointer"
                >
                  <option value="">No linked workout</option>
                  {trainerWorkouts.map(w => (
                    <option key={w.id} value={w.id}>{w.title}</option>
                  ))}
                </select>
                {linkedWorkoutId && (
                  <div className="mt-2 p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-blue-400 shrink-0" />
                    <span className="text-xs text-blue-300">Clients will see the exercise list during the stream</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleGoLive}
                disabled={!title.trim() || !camReady}
                className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-red-500/30"
              >
                <Radio size={16} /> Go Live
              </button>
              {!camReady && <p className="text-xs text-slate-500 text-center">Waiting for device initialization...</p>}
            </div>
          </div>
        </div>

        <section className="card p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="flex items-center gap-2 text-sm font-semibold text-white"><Upload size={16} className="text-emerald-400" /> Training video library</h2><p className="mt-1 text-xs text-slate-400">Upload MP4 videos for your members to watch in the app.</p></div>
            <span className="mt-2 w-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 sm:mt-0">Trainer / admin only</span>
          </div>
          {isVideoPublisher ? <div className="mt-4 grid gap-3 rounded-xl border border-slate-700/60 bg-[#030712]/70 p-3 md:grid-cols-[1fr_1fr_auto]">
            <input type="text" value={videoTitle} onChange={event => setVideoTitle(event.target.value)} placeholder="Video title (optional)" className="input-field w-full text-sm" />
            <input type="file" accept="video/mp4" onChange={event => setSelectedVideo(event.target.files?.[0] ?? null)} className="block w-full text-xs text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-500/15 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-emerald-200 hover:file:bg-emerald-500/25" />
            <button type="button" onClick={handleVideoUpload} disabled={!selectedVideo || uploadingVideo} className="btn-primary flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"><Upload size={15} />{uploadingVideo ? 'Uploading...' : 'Upload MP4'}</button>
          </div> : <p className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">Only trainers and admins can upload videos.</p>}
          {videoMessage && <p className={`mt-3 text-xs ${videoMessage.includes('ready') ? 'text-emerald-300' : 'text-rose-300'}`}>{videoMessage}</p>}
          {uploadedVideos.length > 0 && <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{uploadedVideos.slice(0, 3).map(video => <VideoPlayer key={video.id} video={video} />)}</div>}
        </section>
      </div>
    );
  }

  // ---- ACTIVE STREAM CONTROL CENTER ----
  const linkedWorkout = activeSession.linkedWorkoutId ? getWorkoutById(activeSession.linkedWorkoutId) : null;

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 lg:h-[calc(100vh-4rem)]">
        {/* Main camera canvas */}
        <div className="relative bg-black rounded-2xl overflow-hidden border border-slate-700/50 flex items-center justify-center aspect-video lg:aspect-auto lg:h-full">
          <div className="w-full h-full bg-black flex items-center justify-center transition-all relative">
            <video
              ref={activeVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${cameraOn ? 'block' : 'hidden'}`}
            />
            {!cameraOn && (
              <div className="flex flex-col items-center gap-2">
                <VideoOff size={48} className="text-slate-700" />
                <span className="text-xs text-slate-600">Camera off</span>
              </div>
            )}
          </div>

          {/* Top overlay: LIVE badge + timer + viewer count */}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            <span className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE
            </span>
            <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-mono px-2.5 py-1 rounded-md">
              {formatTime(elapsed)}
            </span>
          </div>
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-md z-10">
            <Users size={12} /> {viewerCount}
          </div>

          {/* Screen share indicator */}
          {sharing && (
            <div className="absolute top-16 left-4 flex items-center gap-1.5 bg-blue-500/80 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-md z-10">
              <MonitorUp size={12} /> Screen sharing
            </div>
          )}

          {/* Stream toolbar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#1E2937]/90 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-slate-600/50 z-10">
            <button
              onClick={() => setCameraOn(c => !c)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${cameraOn ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-red-500/20 text-red-400'}`}
              title="Toggle camera"
            >
              {cameraOn ? <Video size={18} /> : <VideoOff size={18} />}
            </button>
            <button
              onClick={() => setMicOn(m => !m)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${micOn ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-red-500/20 text-red-400'}`}
              title="Toggle microphone"
            >
              {micOn ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
            <button
              onClick={() => setSharing(s => !s)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${sharing ? 'bg-blue-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
              title="Share screen"
            >
              <MonitorUp size={18} />
            </button>
            <div className="w-px h-6 bg-slate-600/50 mx-1" />
            <button
              onClick={endStream}
              className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all active:scale-95 shadow-lg shadow-red-500/30"
            >
              <Square size={14} className="fill-current" /> End Live
            </button>
          </div>
        </div>

        {/* Side panel: dual-tab */}
        <div className="card flex flex-col overflow-hidden h-full max-h-[50vh] lg:max-h-none">
          {/* Tab header */}
          <div className="flex border-b border-slate-700/50 shrink-0">
            <button
              onClick={() => setSideTab('chat')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${sideTab === 'chat' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <MessageCircle size={15} /> Chat
              <span className="badge bg-slate-700 text-slate-300 text-[10px]">{chatMessages.length}</span>
            </button>
            <button
              onClick={() => setSideTab('clients')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${sideTab === 'clients' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Users size={15} /> Clients
              <span className="badge bg-slate-700 text-slate-300 text-[10px]">{MOCK_LIVE_PARTICIPANTS.length}</span>
            </button>
          </div>

          {/* Chat tab */}
          {sideTab === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {chatMessages.map(m => (
                  <div key={m.id} className="flex items-start gap-2 animate-fade-in">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${m.userRole === 'trainer' ? 'bg-blue-500 text-white' : 'bg-slate-600 text-slate-200'}`}>
                      {m.userName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-semibold ${m.userRole === 'trainer' ? 'text-blue-400' : 'text-slate-300'}`}>{m.userName}</span>
                        {m.userRole === 'trainer' && <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1 rounded">COACH</span>}
                      </div>
                      <p className="text-sm text-slate-300 break-words">{m.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-slate-700/50 shrink-0 flex items-center gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder="Reply to chat..."
                  className="input-field flex-1 text-sm"
                />
                <button onClick={sendChat} disabled={!chatInput.trim()} className="btn-primary px-3 py-2.5 text-sm disabled:opacity-40 shrink-0">
                  <Send size={15} />
                </button>
              </div>
            </>
          )}

          {/* Clients tab */}
          {sideTab === 'clients' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {MOCK_LIVE_PARTICIPANTS.map(p => (
                <ClientThumb key={p.id} participant={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Linked workout info bar */}
      {linkedWorkout && (
        <div className="mt-3 flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
            <Play size={14} className="text-blue-400 fill-current" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Linked Routine</span>
            <span className="text-sm text-white ml-2">{linkedWorkout.title}</span>
            <span className="text-xs text-slate-400 ml-2">{linkedWorkout.exercises.length} exercises</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ClientThumb({ participant }: { participant: LiveParticipant }) {
  const signalIcon = participant.connectionStatus === 'good' ? <Wifi size={12} className="text-green-400" />
    : participant.connectionStatus === 'fair' ? <Wifi size={12} className="text-yellow-400" />
    : <WifiOff size={12} className="text-red-400" />;
  const signalColor = participant.connectionStatus === 'good' ? 'border-green-500/30' : participant.connectionStatus === 'fair' ? 'border-yellow-500/30' : 'border-red-500/30';

  return (
    <div className={`flex items-center gap-3 p-2.5 bg-slate-800/50 rounded-xl border ${signalColor}`}>
      <div className="w-9 h-9 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
        {participant.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">{participant.name}</div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          {signalIcon}
          <span className="capitalize">{participant.connectionStatus}</span>
          {!participant.isVideoOn && <span className="text-slate-500">· camera off</span>}
        </div>
      </div>
    </div>
  );
}