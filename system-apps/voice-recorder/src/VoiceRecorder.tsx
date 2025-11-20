import React, { useState, useEffect, useRef } from 'react';
import { Mic, Play, Pause, Square, Trash2, Download, Circle } from 'lucide-react';
import './VoiceRecorder.css';

interface Recording {
  id: string;
  name: string;
  dataUrl: string;
  timestamp: number;
  duration: number;
}

export const VoiceRecorder: React.FC<{ os: any }> = ({ os }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    loadRecordings();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const showStatus = (type: 'success' | 'error' | 'info', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const loadRecordings = async () => {
    try {
      if (os?.fs) {
        const recordingsDir = '/home/user/Music/Recordings';
        try {
          await os.fs.mkdir(recordingsDir, { recursive: true });
          const files = await os.fs.readdir(recordingsDir);
          const loaded: Recording[] = [];
          
          for (const file of files) {
            if (file.endsWith('.webm') || file.endsWith('.ogg')) {
              try {
                const data = await os.fs.read(`${recordingsDir}/${file}`);
                // Create a temporary audio element to get duration
                const audio = new Audio(data);
                const duration = await new Promise<number>((resolve) => {
                  audio.onloadedmetadata = () => resolve(audio.duration);
                  audio.onerror = () => resolve(0);
                });
                
                loaded.push({
                  id: file,
                  name: file.replace(/\.(webm|ogg)$/, ''),
                  dataUrl: data,
                  timestamp: Date.now(), // In real implementation, get from file metadata
                  duration: duration || 0,
                });
              } catch (err) {
                console.error(`Error loading recording ${file}:`, err);
              }
            }
          }
          
          setRecordings(loaded.sort((a, b) => b.timestamp - a.timestamp));
        } catch (err) {
          console.log('Recordings directory does not exist yet');
        }
      }
    } catch (err) {
      console.error('Error loading recordings:', err);
    }
  };

  const startWaveform = async (stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateWaveform = () => {
        if (!analyserRef.current || !waveformRef.current || !isRecording) {
          return;
        }
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        if (waveformRef.current) {
          const bars = Math.min(50, bufferLength);
          const barWidth = 100 / bars;
          
          waveformRef.current.innerHTML = '';
          for (let i = 0; i < bars; i++) {
            const bar = document.createElement('div');
            bar.className = 'waveform-bar';
            const value = dataArray[i];
            const height = (value / 255) * 100;
            bar.style.height = `${Math.max(height, 4)}%`;
            if (value > 128) {
              bar.classList.add('active');
            }
            waveformRef.current.appendChild(bar);
          }
        }
        
        animationFrameRef.current = requestAnimationFrame(updateWaveform);
      };
      
      updateWaveform();
    } catch (err) {
      console.error('Error setting up waveform:', err);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const timestamp = Date.now();
          const name = `Recording ${new Date(timestamp).toLocaleString()}`;
          
          const newRecording: Recording = {
            id: `recording-${timestamp}.webm`,
            name,
            dataUrl,
            timestamp,
            duration: elapsedTime,
          };
          
          setCurrentRecording(newRecording);
          setRecordings(prev => [newRecording, ...prev]);
          saveRecording(newRecording);
        };
        reader.readAsDataURL(blob);
        
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setElapsedTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      // Start waveform visualization
      startWaveform(stream);
      
      showStatus('info', 'Recording started...');
    } catch (err: any) {
      console.error('Error starting recording:', err);
      if (err.name === 'NotAllowedError') {
        showStatus('error', 'Microphone permission denied');
      } else {
        showStatus('error', 'Failed to start recording');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      if (waveformRef.current) {
        waveformRef.current.innerHTML = '';
      }
      
      showStatus('success', 'Recording stopped');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        showStatus('info', 'Recording resumed');
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        showStatus('info', 'Recording paused');
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const saveRecording = async (recording: Recording) => {
    try {
      if (os?.fs) {
        const recordingsDir = '/home/user/Music/Recordings';
        await os.fs.mkdir(recordingsDir, { recursive: true });
        await os.fs.write(`${recordingsDir}/${recording.id}`, recording.dataUrl);
        showStatus('success', `Recording saved as ${recording.name}`);
      }
    } catch (err) {
      console.error('Error saving recording:', err);
      showStatus('error', 'Failed to save recording');
    }
  };

  const playRecording = (recording: Recording) => {
    if (playingId === recording.id) {
      // Stop playing
      setPlayingId(null);
      setCurrentRecording(null);
    } else {
      setPlayingId(recording.id);
      setCurrentRecording(recording);
    }
  };

  const deleteRecording = async (id: string) => {
    try {
      if (os?.fs) {
        const recordingsDir = '/home/user/Music/Recordings';
        await os.fs.write(`${recordingsDir}/${id}`, '');
        // Note: In a real implementation, you'd use fs.unlink or similar
      }
      
      setRecordings(prev => prev.filter(r => r.id !== id));
      if (playingId === id) {
        setPlayingId(null);
        setCurrentRecording(null);
      }
      showStatus('success', 'Recording deleted');
    } catch (err) {
      console.error('Error deleting recording:', err);
      showStatus('error', 'Failed to delete recording');
    }
  };

  const downloadRecording = (recording: Recording) => {
    const link = document.createElement('a');
    link.href = recording.dataUrl;
    link.download = `${recording.name}.webm`;
    link.click();
    showStatus('success', 'Recording downloaded');
  };

  return (
    <div className="voice-recorder-app">
      <div className="voice-recorder-header">
        <div className="voice-recorder-title">Voice Recorder</div>
      </div>

      <div className="voice-recorder-content">
        {statusMessage && (
          <div className={`status-message ${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        )}

        <div className="recorder-section">
          <div className="recorder-display">
            <div className="waveform-container">
              <div ref={waveformRef} className="waveform">
                {!isRecording && (
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    {recordings.length === 0 ? 'No recordings yet' : 'Ready to record'}
                  </div>
                )}
              </div>
            </div>

            <div className="time-display">
              {formatTime(elapsedTime)}
            </div>
            <div className="time-label">
              {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Duration'}
            </div>

            {isRecording && (
              <div className="recording-status">
                <div className="recording-indicator" />
                <span>Recording in progress...</span>
              </div>
            )}
          </div>

          <div className="recorder-controls">
            {!isRecording ? (
              <button
                className="record-btn stopped"
                onClick={startRecording}
                title="Start Recording"
              >
                <Mic size={32} />
              </button>
            ) : (
              <>
                <button
                  className={`control-btn ${isPaused ? 'play' : 'pause'}`}
                  onClick={pauseRecording}
                  title={isPaused ? 'Resume' : 'Pause'}
                >
                  {isPaused ? <Play size={20} /> : <Pause size={20} />}
                </button>
                <button
                  className="record-btn recording"
                  onClick={stopRecording}
                  title="Stop Recording"
                >
                  <Square size={24} fill="white" />
                </button>
                <button
                  className="control-btn stop"
                  onClick={stopRecording}
                  title="Stop"
                >
                  <Square size={16} fill="white" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="recordings-section">
          <div className="recordings-title">Recordings</div>
          {recordings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎤</div>
              <div className="empty-state-text">No recordings yet</div>
              <div style={{ fontSize: '14px', marginTop: '10px', color: '#666' }}>
                Click the microphone button to start recording
              </div>
            </div>
          ) : (
            <div className="recordings-list">
              {recordings.map(recording => (
                <div
                  key={recording.id}
                  className={`recording-item ${playingId === recording.id ? 'active' : ''}`}
                >
                  <div className="recording-icon">
                    <Circle size={20} fill="#4285F4" />
                  </div>
                  <div className="recording-info">
                    <div className="recording-name">{recording.name}</div>
                    <div className="recording-meta">
                      <span>{formatTime(Math.floor(recording.duration))}</span>
                      <span>{new Date(recording.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="recording-actions">
                    <button
                      className={`action-btn ${playingId === recording.id ? 'pause' : 'play'}`}
                      onClick={() => playRecording(recording)}
                      title={playingId === recording.id ? 'Stop' : 'Play'}
                    >
                      {playingId === recording.id ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                      className="action-btn download"
                      onClick={() => downloadRecording(recording)}
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => deleteRecording(recording.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {currentRecording && playingId === currentRecording.id && (
          <div className="audio-player">
            <audio
              src={currentRecording.dataUrl}
              controls
              autoPlay
              onEnded={() => {
                setPlayingId(null);
                setCurrentRecording(null);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

