import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, FolderOpen, Repeat, Shuffle } from 'lucide-react';
import './MusicPlayer.css';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url?: string;
  path?: string;
}

const MOCK_TRACKS: Track[] = [
  { id: '1', title: 'Synthwave Chill', artist: 'Browser OS', duration: 185, url: '' },
  { id: '2', title: 'Coding Focus', artist: 'System', duration: 240, url: '' },
  { id: '3', title: 'Night Drive', artist: 'Kernel', duration: 210, url: '' },
  { id: '4', title: 'Error 404', artist: 'The Protocols', duration: 195, url: '' },
  { id: '5', title: 'Boot Sequence', artist: 'Startup', duration: 150, url: '' },
];

export const MusicPlayer: React.FC<{ os: any }> = ({ os }) => {
  const [tracks, setTracks] = useState<Track[]>(MOCK_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const currentTrack = tracks[currentTrackIndex];

  // Simulated playback
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= currentTrack.duration) {
            // Next track
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, currentTrack]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrackIndex(prev => (prev + 1) % tracks.length);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (currentTime > 3) {
      setCurrentTime(0);
    } else {
      setCurrentTrackIndex(prev => (prev - 1 + tracks.length) % tracks.length);
      setCurrentTime(0);
    }
    setIsPlaying(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOpenFile = async () => {
    try {
      // In a real implementation, this would open a file picker
      // For now, we'll just simulate scanning for music
      await os.syscall('notification.create', {
        title: 'Library Updated',
        message: 'Scanned /home/user/music for new tracks',
        appId: 'music'
      });
    } catch (e) {
      console.error('Failed to open file:', e);
    }
  };

  return (
    <div className="music-app">
      <div className="music-container">
        <div className="music-sidebar">
          <div className="library-header">Library</div>
          <div className="track-list">
            {tracks.map((track, index) => (
              <div 
                key={track.id} 
                className={`track-item ${index === currentTrackIndex ? 'active' : ''}`}
                onClick={() => {
                  setCurrentTrackIndex(index);
                  setCurrentTime(0);
                  setIsPlaying(true);
                }}
              >
                <div className="track-title">{track.title}</div>
                <div className="track-artist">{track.artist}</div>
              </div>
            ))}
          </div>
          <div className="library-header">
             <button className="monitor-btn" onClick={handleOpenFile} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
               <FolderOpen size={14} /> Open Files
             </button>
          </div>
        </div>

        <div className="music-main">
          <div className="album-art">
            <Music className="album-art-placeholder" />
            {isPlaying && (
              <div className="visualizer" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%', opacity: 0.3, alignItems: 'flex-end', justifyContent: 'center', gap: 2 }}>
                {Array.from({ length: 20 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="visualizer-bar" 
                    style={{ 
                      height: `${Math.random() * 100}%`,
                      width: 8,
                      animationDuration: `${0.2 + Math.random() * 0.5}s`
                    }} 
                  />
                ))}
              </div>
            )}
          </div>

          <div className="current-track-info">
            <div className="current-title">{currentTrack.title}</div>
            <div className="current-artist">{currentTrack.artist}</div>
          </div>
        </div>
      </div>

      <div className="controls-bar">
        <div className="control-buttons">
          <button className="control-btn" onClick={handlePrev}>
            <SkipBack size={20} />
          </button>
          <button className="control-btn primary" onClick={handlePlayPause}>
            {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
          </button>
          <button className="control-btn" onClick={handleNext}>
            <SkipForward size={20} />
          </button>
        </div>

        <div className="progress-container">
          <div className="progress-time">{formatTime(currentTime)}</div>
          <div className="progress-bar" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            setCurrentTime(percent * currentTrack.duration);
          }}>
            <div 
              className="progress-fill" 
              style={{ width: `${(currentTime / currentTrack.duration) * 100}%` }} 
            />
          </div>
          <div className="progress-time">{formatTime(currentTrack.duration)}</div>
        </div>

        <div className="volume-control">
          <button className="control-btn" onClick={() => setIsMuted(!isMuted)}>
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <div className="volume-slider" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            setVolume(percent);
            setIsMuted(false);
          }}>
            <div 
              className="volume-fill" 
              style={{ width: `${isMuted ? 0 : volume * 100}%` }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

