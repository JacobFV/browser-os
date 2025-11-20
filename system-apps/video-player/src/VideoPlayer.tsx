import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  FolderOpen,
  Video as VideoIcon
} from 'lucide-react';
import './VideoPlayer.css';

interface VideoFile {
  path: string;
  name: string;
  url: string;
  duration?: number;
}

export const VideoPlayer: React.FC<{ os: any }> = ({ os }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const videosPath = '/home/user/videos';
      const exists = await os.syscall('fs.exists', { path: videosPath });
      if (exists) {
        const files = await os.syscall('fs.readdir', { path: videosPath });
        const videoFiles = files
          .filter((f: any) => f.name.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i))
          .map((f: any) => ({
            path: `${videosPath}/${f.name}`,
            name: f.name,
            url: ''
          }));
        setVideos(videoFiles);
        if (videoFiles.length > 0) {
          await loadVideoUrl(videoFiles[0], 0);
        }
      }
    } catch (e) {
      console.error('Failed to load videos:', e);
    }
  };

  const loadVideoUrl = async (video: VideoFile, index: number) => {
    try {
      const data = await os.syscall('fs.read', { path: video.path });
      const blob = new Blob([data], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      setVideos(prev => prev.map((v, i) => 
        i === index ? { ...v, url } : v
      ));
      if (videoRef.current) {
        videoRef.current.src = url;
      }
    } catch (e) {
      console.error('Failed to load video:', e);
    }
  };

  const currentVideo = videos[currentIndex];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      handleNext();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentVideo]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = percent * duration;
    }
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(percent);
    setIsMuted(false);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setIsPlaying(false);
      if (!videos[newIndex].url) {
        loadVideoUrl(videos[newIndex], newIndex);
      } else if (videoRef.current) {
        videoRef.current.src = videos[newIndex].url;
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setIsPlaying(true);
      if (!videos[newIndex].url) {
        loadVideoUrl(videos[newIndex], newIndex);
      } else if (videoRef.current) {
        videoRef.current.src = videos[newIndex].url;
        videoRef.current.play();
      }
    }
  };

  const handleFullscreen = () => {
    if (!isFullscreen) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleOpenFolder = async () => {
    try {
      await os.syscall('proc.spawn', {
        appId: 'file-browser',
        args: [],
        options: { cwd: '/home/user/videos' }
      });
    } catch (e) {
      console.error('Failed to open folder:', e);
    }
  };

  return (
    <div className="video-player-app" onMouseMove={handleMouseMove}>
      {videos.length === 0 ? (
        <div className="empty-state">
          <VideoIcon className="empty-state-icon" />
          <div className="empty-state-text">No videos found</div>
          <div className="empty-state-hint">Open a folder to view videos</div>
          <button 
            onClick={handleOpenFolder}
            style={{
              marginTop: 20,
              padding: '10px 20px',
              background: '#4285F4',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Open Videos Folder
          </button>
        </div>
      ) : (
        <>
          <div className="video-container">
            {currentVideo?.url && (
              <video
                ref={videoRef}
                className="video-element"
                src={currentVideo.url}
                onClick={handlePlayPause}
              />
            )}
            
            {currentVideo && (
              <div className="video-title">{currentVideo.name}</div>
            )}

            <div className={`video-controls ${showControls ? 'visible' : ''}`}>
              <div className="progress-container" onClick={handleSeek}>
                <div className="progress-buffer" style={{ width: '0%' }} />
                <div 
                  className="progress-bar" 
                  style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }} 
                />
              </div>

              <div className="controls-row">
                <button className="control-btn" onClick={handlePrev} disabled={currentIndex === 0}>
                  <SkipBack size={20} />
                </button>
                <button className="control-btn play-pause" onClick={handlePlayPause}>
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button className="control-btn" onClick={handleNext} disabled={currentIndex === videos.length - 1}>
                  <SkipForward size={20} />
                </button>

                <div className="time-display">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>

                <div className="spacer" />

                <div className="volume-control">
                  <button className="control-btn" onClick={() => setIsMuted(!isMuted)}>
                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <div className="volume-slider" onClick={handleVolumeChange}>
                    <div 
                      className="volume-fill" 
                      style={{ width: `${isMuted ? 0 : volume * 100}%` }} 
                    />
                  </div>
                </div>

                <button className="control-btn fullscreen-btn" onClick={handleFullscreen}>
                  {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
              </div>
            </div>
          </div>

          {videos.length > 1 && (
            <div className="playlist-sidebar">
              <div className="playlist-header">
                <span>Playlist</span>
                <button 
                  className="control-btn" 
                  onClick={handleOpenFolder}
                  style={{ padding: 4 }}
                >
                  <FolderOpen size={16} />
                </button>
              </div>
              <div className="playlist-list">
                {videos.map((video, index) => (
                  <div
                    key={index}
                    className={`playlist-item ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentIndex(index);
                      setIsPlaying(true);
                      if (!video.url) {
                        loadVideoUrl(video, index);
                      } else if (videoRef.current) {
                        videoRef.current.src = video.url;
                        videoRef.current.play();
                      }
                    }}
                  >
                    <div className="playlist-title">{video.name}</div>
                    {video.duration && (
                      <div className="playlist-duration">{formatTime(video.duration)}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

