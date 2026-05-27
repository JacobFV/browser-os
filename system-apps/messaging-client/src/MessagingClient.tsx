import React, { useEffect, useRef, useState, useCallback } from 'react';
import './MessagingClient.css';

interface SynthuxChatMessage {
  message_id: string;
  channel_id: string;
  sender: string;
  text: string;
  t: number;
}
interface SynthuxChannel {
  channel_id: string;
  name: string;
  members: string[];
  message_count: number;
}
interface SynthuxClient {
  enabled: boolean;
  actor: string;
  chatChannels: () => Promise<{ channels?: SynthuxChannel[] }>;
  chatHistory: (channel_id: string) => Promise<{ messages?: SynthuxChatMessage[] }>;
  postChat: (channel_id: string, text: string) => Promise<unknown>;
  reactChat: (message_id: string, emoji: string) => Promise<unknown>;
}

export interface MessagingClientProps {
  windowId?: string;
  appId?: string;
  eventBus?: unknown;
  os?: unknown;
}

function getClient(): SynthuxClient | null {
  return (window as any).__synthuxInternet || null;
}

export const MessagingClient: React.FC<MessagingClientProps> = () => {
  const [client, setClient] = useState<SynthuxClient | null>(getClient());
  const [channels, setChannels] = useState<SynthuxChannel[]>([]);
  const [selected, setSelected] = useState<string>('#incident');
  const [messages, setMessages] = useState<SynthuxChatMessage[]>([]);
  const [composer, setComposer] = useState<string>('');
  const listRef = useRef<HTMLDivElement | null>(null);

  // Initial probe — if the client wasn't ready, try again briefly.
  useEffect(() => {
    if (client && client.enabled) return;
    const id = setInterval(() => {
      const c = getClient();
      if (c) {
        setClient(c);
        clearInterval(id);
      }
    }, 200);
    return () => clearInterval(id);
  }, [client]);

  const refresh = useCallback(async () => {
    if (!client || !client.enabled) return;
    const [chList, hist] = await Promise.all([
      client.chatChannels(),
      client.chatHistory(selected),
    ]);
    if (Array.isArray(chList?.channels)) setChannels(chList.channels);
    if (Array.isArray(hist?.messages)) {
      setMessages(hist.messages);
      requestAnimationFrame(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
      });
    }
  }, [client, selected]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 700);
    return () => clearInterval(id);
  }, [refresh]);

  const send = useCallback(async () => {
    if (!client || !composer.trim()) return;
    const text = composer.trim();
    setComposer('');
    await client.postChat(selected, text);
    await refresh();
  }, [client, composer, selected, refresh]);

  const me = client?.actor || 'local';
  const connected = !!client?.enabled;
  const current = channels.find((c) => c.channel_id === selected);

  return (
    <div className="messaging-client-app" style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 720 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
        background: '#1f1f1f', color: 'white', fontSize: 13 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%',
          background: connected ? '#34c759' : '#d33' }} />
        <strong>{me}</strong>
        <span style={{ flex: 1, textAlign: 'center', opacity: 0.85 }}>SynthUX Chat</span>
        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, opacity: 0.85 }}>
          {connected ? 'virtual-internet' : 'offline'}
        </span>
      </header>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <aside style={{ width: 220, minWidth: 200, background: '#f4f4f4', borderRight: '1px solid #ddd',
          display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 14px 6px', fontSize: 11, textTransform: 'uppercase',
            color: '#666', fontWeight: 700, letterSpacing: '0.05em' }}>Channels</div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {channels.map((ch) => (
              <button
                key={ch.channel_id}
                className={`channel ${selected === ch.channel_id ? 'active' : ''}`}
                onClick={() => setSelected(ch.channel_id)}
                style={{
                  display: 'flex', width: '100%', alignItems: 'center', gap: 8,
                  padding: '8px 14px', background: selected === ch.channel_id ? '#0078d4' : 'none',
                  color: selected === ch.channel_id ? 'white' : 'inherit',
                  border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13,
                }}
              >
                <span style={{ width: 14, fontWeight: 700, opacity: 0.7 }}>#</span>
                <span style={{ flex: 1 }}>{ch.name || ch.channel_id}</span>
                <span style={{ fontSize: 11, opacity: 0.7 }}>{ch.message_count}</span>
              </button>
            ))}
            {channels.length === 0 && (
              <div style={{ padding: 16, color: '#888' }}>No channels</div>
            )}
          </div>
        </aside>
        <section style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
          <header style={{ display: 'flex', alignItems: 'baseline', gap: 10,
            padding: '12px 18px', borderBottom: '1px solid #ddd' }}>
            <span style={{ fontWeight: 700, opacity: 0.7 }}>#</span>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{current?.name || selected}</span>
            <span style={{ fontSize: 12, color: '#666' }}>{current?.members.join(', ') || ''}</span>
          </header>
          <div className="messages" ref={listRef}
            style={{ flex: 1, overflowY: 'auto', padding: '14px 18px',
              display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m) => (
              <div key={m.message_id} className={m.sender === me ? 'msg me' : 'msg'}
                style={{ display: 'flex', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: '#0078d4', color: 'white', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                }}>{m.sender.slice(0, 1).toUpperCase()}</div>
                <div style={{
                  background: m.sender === me ? '#deecf9' : '#f4f4f4',
                  padding: '8px 12px', borderRadius: 6, maxWidth: '70%',
                }}>
                  <div style={{ fontSize: 12, color: '#0078d4', fontWeight: 700 }}>{m.sender}</div>
                  <div style={{ fontSize: 14, marginTop: 2 }}>{m.text}</div>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div style={{ color: '#888', textAlign: 'center', padding: 20 }}>
                No messages in {selected}
              </div>
            )}
          </div>
          <form
            className="composer"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            style={{ display: 'flex', gap: 8, padding: '12px 18px', borderTop: '1px solid #ddd' }}
          >
            <input
              className="composer-input"
              placeholder={`Message ${selected}`}
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              style={{ flex: 1, padding: '10px 14px', borderRadius: 4,
                border: '1px solid #ccc', fontSize: 14, outline: 'none' }}
            />
            <button
              type="submit"
              className="send-btn"
              style={{ padding: '0 18px', background: '#0078d4', color: 'white',
                border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}
            >Send</button>
          </form>
        </section>
      </div>
    </div>
  );
};
