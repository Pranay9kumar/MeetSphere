import React, { useState, useEffect } from 'react';
import {
  X,
  MessageCircle,
  Video,
  Users,
  Download,
  Calendar,
  Clock,
  Mail,
  Loader2,
  Search,
  ExternalLink
} from 'lucide-react';
import { getMeetingDetails } from '../services/meetingService';

export default function MeetingDetailsModal({ isOpen, onClose, meetingId, roomName, initialMeeting }) {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'recording', 'details'
  const [meeting, setMeeting] = useState(initialMeeting || null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const targetRoom = roomName || initialMeeting?.roomName || meetingId;

  useEffect(() => {
    if (!isOpen || !targetRoom) return;

    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        const data = await getMeetingDetails(targetRoom);
        if (!cancelled) {
          setMeeting(data.meeting || initialMeeting);
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error('[MeetingDetailsModal] Failed to fetch meeting details:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [isOpen, targetRoom, initialMeeting]);

  if (!isOpen) return null;

  const recordings = meeting?.recordings || [];
  const latestRecording = recordings.length > 0 ? recordings[recordings.length - 1] : null;

  const filteredMessages = messages.filter((m) =>
    (m.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.senderName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative flex h-[85vh] w-full max-w-4xl flex-col rounded-3xl border border-outline-variant bg-surface-container-low shadow-2xl overflow-hidden text-on-surface">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4 bg-surface-container">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-on-surface">
                {meeting?.title || `Meeting: ${targetRoom}`}
              </h2>
              <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                {targetRoom}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Session Inspector • Chat Logs & Cloud Recordings
            </p>
          </div>

          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-outline-variant px-6 bg-surface-container-low">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-bold transition-all ${
              activeTab === 'chat'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            <span>Chat Transcript ({messages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('recording')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-bold transition-all ${
              activeTab === 'recording'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Video className="h-4 w-4" />
            <span>
              Cloud Recording {recordings.length > 0 && `(${recordings.length})`}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-bold transition-all ${
              activeTab === 'details'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Session Metadata</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex h-full items-center justify-center gap-2 text-xs text-on-surface-variant">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading meeting assets...
            </div>
          ) : (
            <>
              {/* TAB 1: Chat Transcript */}
              {activeTab === 'chat' && (
                <div className="flex h-full flex-col space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-on-surface-variant" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search messages or participant names..."
                      className="w-full rounded-xl border border-outline-variant bg-surface py-2 pl-10 pr-4 text-xs text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:border-primary"
                    />
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-outline-variant bg-surface-container p-4">
                    {filteredMessages.length === 0 ? (
                      <div className="py-16 text-center text-xs text-on-surface-variant">
                        {messages.length === 0
                          ? 'No chat messages were recorded for this meeting session.'
                          : 'No messages match your search criteria.'}
                      </div>
                    ) : (
                      filteredMessages.map((m) => (
                        <div key={m.id} className="rounded-xl bg-surface-container-high p-3 border border-outline-variant/30">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-bold text-primary">{m.senderName}</span>
                            <span className="text-on-surface-variant text-[10px]">
                              {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface leading-relaxed break-words">{m.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: Cloud Recording Player */}
              {activeTab === 'recording' && (
                <div className="space-y-6">
                  {latestRecording ? (
                    <div className="rounded-2xl border border-outline-variant bg-surface-container p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-on-surface">Room Composite Video Recording</h3>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            Delivered to: <span className="text-on-surface font-semibold">{latestRecording.targetEmail || 'Host email'}</span>
                          </p>
                        </div>
                        <a
                          href={latestRecording.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-on-primary hover:brightness-110 shadow-md transition-all"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download MP4</span>
                        </a>
                      </div>

                      {/* Video Player */}
                      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-inner flex items-center justify-center">
                        <video
                          src={latestRecording.fileUrl}
                          controls
                          className="h-full w-full object-contain"
                          poster="/poster.jpg"
                        >
                          Your browser does not support HTML5 video playback.
                        </video>
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-2 text-xs text-on-surface-variant">
                        <div className="rounded-xl bg-surface-container-high p-3 border border-outline-variant/30">
                          <span className="block text-[10px] uppercase font-bold text-on-surface-variant/70">Duration</span>
                          <span className="font-semibold text-on-surface">
                            {latestRecording.duration ? `${Math.floor(latestRecording.duration / 60)}m ${latestRecording.duration % 60}s` : 'Full Session'}
                          </span>
                        </div>
                        <div className="rounded-xl bg-surface-container-high p-3 border border-outline-variant/30">
                          <span className="block text-[10px] uppercase font-bold text-on-surface-variant/70">Recorded Date</span>
                          <span className="font-semibold text-on-surface">
                            {latestRecording.recordedAt ? new Date(latestRecording.recordedAt).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                        <div className="rounded-xl bg-surface-container-high p-3 border border-outline-variant/30">
                          <span className="block text-[10px] uppercase font-bold text-on-surface-variant/70">Format</span>
                          <span className="font-semibold text-on-surface">1080p H.264 / AAC</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-20 text-center rounded-2xl border border-dashed border-outline-variant bg-surface-container/40 p-8">
                      <Video className="mx-auto h-12 w-12 text-on-surface-variant/40 mb-3" />
                      <h4 className="text-sm font-bold text-on-surface">No Video Recording Available</h4>
                      <p className="mt-1 text-xs text-on-surface-variant max-w-sm mx-auto">
                        Cloud recording was not triggered during this meeting session. You can record future meetings by clicking 'Record' in the in-room control bar.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Metadata */}
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-outline-variant bg-surface-container p-5 space-y-3">
                    <h3 className="text-sm font-bold text-on-surface mb-2">Meeting Configuration</h3>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="block text-on-surface-variant text-[11px]">Room Code</span>
                        <span className="font-semibold text-on-surface font-mono">{targetRoom}</span>
                      </div>
                      <div>
                        <span className="block text-on-surface-variant text-[11px]">Status</span>
                        <span className="font-semibold capitalize text-primary">{meeting?.status || 'Active'}</span>
                      </div>
                      <div>
                        <span className="block text-on-surface-variant text-[11px]">Created At</span>
                        <span className="font-semibold text-on-surface">
                          {meeting?.createdAt ? new Date(meeting.createdAt).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-on-surface-variant text-[11px]">Participants</span>
                        <span className="font-semibold text-on-surface">{meeting?.participants?.length || 0}</span>
                      </div>
                      <div>
                        <span className="block text-on-surface-variant text-[11px]">AI Minutes</span>
                        <span className="font-semibold text-on-surface">{meeting?.aiMinutes?.summary || 'Not generated'}</span>
                      </div>
                      <div>
                        <span className="block text-on-surface-variant text-[11px]">Host Identity</span>
                        <span className="font-semibold text-on-surface">
                          {meeting?.hostId?.name || meeting?.hostId?.email || 'Authorized User'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
