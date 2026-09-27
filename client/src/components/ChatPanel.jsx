import React, { useEffect, useState, useRef } from 'react';
import { RefreshCw, Send, Loader2 } from 'lucide-react';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { sendRoomChatMessage, getRoomChatMessages } from '../services/meetingService';

function messageId(event, participant) {
  return event.id || `${participant?.identity || 'local'}-${event.sentAt}-${event.content}`;
}

export default function ChatPanel() {
  const room = useRoomContext();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState('');
  const [historyAttempt, setHistoryAttempt] = useState(0);
  const [persisting, setPersisting] = useState(false);
  const messagesEndRef = useRef(null);

  const roomIdentifier = room?.name || 'lobby';
  const localParticipantName = room?.localParticipant?.name || room?.localParticipant?.identity || 'You';

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load persistent chat history from MongoDB on mount
  useEffect(() => {
    let cancelled = false;
    setHistoryError('');

    async function loadChatHistory() {
      if (!roomIdentifier) return;
      try {
        setIsLoadingHistory(true);
        const res = await getRoomChatMessages(roomIdentifier, 100);
        if (!cancelled && res?.messages) {
          const formatted = res.messages.map((m) => ({
            id: m.id,
            sender: m.senderName || 'Participant',
            content: m.content,
            sentAt: m.createdAt,
            isPersisted: true
          }));
          setMessages(formatted);
        }
      } catch (err) {
        if (!cancelled) setHistoryError('Could not load the saved chat history.');
        console.warn('[ChatPanel] Could not load persisted chat history:', err.message);
      } finally {
        if (!cancelled) setIsLoadingHistory(false);
      }
    }

    loadChatHistory();

    return () => {
      cancelled = true;
    };
  }, [roomIdentifier, historyAttempt]);

  // Listen to in-room LiveKit DataChannel real-time broadcasts
  useEffect(() => {
    if (!room) return;

    const onData = (payload, participant) => {
      try {
        const event = JSON.parse(new TextDecoder().decode(payload));
        if (event.type !== 'chat-message' || !event.content) return;

        const senderDisplayName = participant?.name || participant?.identity || 'Participant';
        const newMsg = {
          id: messageId(event, participant),
          sender: senderDisplayName,
          content: event.content,
          sentAt: event.sentAt || new Date().toISOString()
        };

        setMessages((current) => {
          if (current.some((item) => item.id === newMsg.id)) return current;
          return [...current, newMsg];
        });
      } catch {
        // Ignore malformed packet
      }
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => room.off(RoomEvent.DataReceived, onData);
  }, [room]);

  // Dual-Write: LiveKit DataChannel + Async MongoDB Persistence
  const sendMessage = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !room) return;

    const sentAt = new Date().toISOString();
    const localId = `${room.localParticipant.identity}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // 1. Instant local optimistic update
    const localMessage = {
      id: localId,
      sender: localParticipantName,
      content,
      sentAt,
      isSelf: true
    };
    setMessages((current) => [...current, localMessage]);
    setDraft('');

    // 2. Publish to LiveKit DataChannel for instant zero-latency peer sync
    try {
      const payload = JSON.stringify({
        type: 'chat-message',
        id: localId,
        content,
        sentAt,
        senderName: localParticipantName
      });
      await room.localParticipant.publishData(new TextEncoder().encode(payload), { reliable: true });
    } catch (err) {
      console.warn('[ChatPanel] LiveKit DataChannel broadcast error:', err.message);
    }

    // 3. Asynchronously persist to MongoDB via backend API
    setPersisting(true);
    try {
      await sendRoomChatMessage(roomIdentifier, content, localParticipantName);
    } catch (err) {
      console.warn('[ChatPanel] MongoDB chat persistence error:', err.message);
      setHistoryError('Message sent live, but could not be saved.');
    } finally {
      setPersisting(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-surface-container-low text-on-surface">
      <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">In-Meeting Chat</h3>
        <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Live & Synced
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {isLoadingHistory && (
          <div className="flex items-center justify-center py-6 text-xs text-on-surface-variant gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading chat transcript...
          </div>
        )}

        {historyError && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-200">
            <span>{historyError}</span>
            <button type="button" onClick={() => setHistoryAttempt((value) => value + 1)} className="flex shrink-0 items-center gap-1 font-bold hover:text-white"><RefreshCw className="h-3 w-3" /> Retry</button>
          </div>
        )}

        {!isLoadingHistory && !historyError && messages.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-xs text-on-surface-variant">No messages yet.</p>
            <p className="mt-1 text-[11px] text-on-surface-variant/70">Messages sent here are saved with the meeting record.</p>
          </div>
        )}

        {messages.map((message) => {
          const isSelf = message.sender === localParticipantName || message.isSelf || message.sender === 'You';
          const time = message.sentAt
            ? new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '';

          return (
            <div
              key={message.id}
              className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
            >
              <div className="mb-1 flex items-center gap-2 px-1 text-[10px] text-on-surface-variant">
                <span className={`font-semibold ${isSelf ? 'text-primary' : 'text-on-surface'}`}>
                  {isSelf ? 'You' : message.sender}
                </span>
                <span>{time}</span>
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-5 break-words shadow-sm ${
                  isSelf
                    ? 'bg-primary text-on-primary rounded-br-xs'
                    : 'bg-surface-container-high text-on-surface rounded-bl-xs border border-outline-variant/40'
                }`}
              >
                {message.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-outline-variant p-3 bg-surface-container">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Send a message to everyone..."
          aria-label="Chat message"
          className="min-w-0 flex-1 rounded-xl border border-outline-variant bg-surface px-3.5 py-2 text-xs text-on-surface outline-none placeholder:text-on-surface-variant/60 focus:border-primary transition-colors"
        />
        <button
          type="submit"
          disabled={!draft.trim() || persisting}
          title="Send message"
          aria-label="Send message"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-on-primary disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all shadow-md"
        >
          {persisting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
