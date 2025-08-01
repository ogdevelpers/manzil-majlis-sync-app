'use client';

import { useEffect, useState, useRef } from 'react';
import { videos, Video } from '../data/videos';
import Image from 'next/image';
import { Play, Pause, RotateCcw } from 'lucide-react';

const CHANNEL_NAME = 'video-sync-channel';

interface VideoState {
  videoId: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
}

// CSS Module styles (inline for demonstration)
const styles = {
  mainContent: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    marginBottom: '8px',
    color: '#333'
  },
  subtitle: {
    fontSize: '16px',
    textAlign: 'center' as const,
    marginBottom: '30px',
    color: '#666'
  },
  currentVideoProgress: {
    maxWidth: '600px',
    margin: '0 auto 30px auto',
    padding: '0 20px'
  },
  progressInput: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: '#e0e0e0',
    outline: 'none',
    cursor: 'pointer'
  },
  videoGrid: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexWrap: 'wrap' as const,
    maxWidth: '100vw',
    margin: '0 auto'
  },
  videoCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '16px',
    width: '320px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease'
  },
  videoCardActive: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '16px',
    width: '320px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    border: '2px solid #8B4513',
    transform: 'scale(1.02)'
  },
  videoThumbnail: {
    width: '100%',
    height: '180px',
    backgroundColor: '#000',
    borderRadius: '8px',
    marginBottom: '12px',
    position: 'relative' as const,
    overflow: 'hidden'
  },
  videoInfo: {
    display: 'flex',
    flexDirection: 'column' as const
  },
  videoTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#333'
  },
  videoDescription: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.4',
    marginBottom: '16px'
  },
  videoControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  controlButton: {
    width: '40px',
    height: '40px',
    backgroundColor: '#8B4513',
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  controlButtonHover: {
    backgroundColor: '#A0522D',
    transform: 'scale(1.05)'
  },
  progressContainer: {
    flex: 1,
    height: '4px',
    backgroundColor: '#e0e0e0',
    borderRadius: '2px',
    overflow: 'hidden',
    cursor: 'pointer',
    marginLeft: '8px',
    marginRight: '8px'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8B4513',
    borderRadius: '2px',
    transition: 'width 0.3s ease'
  },
  timeDisplay: {
    fontSize: '12px',
    color: '#666',
    minWidth: '80px',
    textAlign: 'right' as const
  }
};

export default function HomePage() {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const isSeekingRef = useRef<boolean>(false);

  const handleAction = (videoId: string, action: 'PLAY' | 'PAUSE' | 'RESTART'): void => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: 'VIDEO_ACTION', videoId, action });
      channel.close();
      setActiveVideoId(videoId);
      if (action === 'PLAY') {
        setIsPlaying(true);
      } else if (action === 'PAUSE') {
        setIsPlaying(false);
      } else if (action === 'RESTART') {
        setIsPlaying(true);
        setProgress(0);
        setCurrentTime(0);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (isSeekingRef.current && typeof window !== 'undefined' && 'BroadcastChannel' in window && activeVideoId) {
      const seekTime = (e.target.valueAsNumber / 100) * duration;
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: 'SEEK_VIDEO', videoId: activeVideoId, seekTime });
      channel.close();
    }
  };

  const handleProgressClick = (e: React.MouseEvent, videoDuration: number) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window && activeVideoId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const newProgress = (clickX / width) * 100;
      const seekTime = (newProgress / 100) * videoDuration;
      
      setProgress(newProgress);
      setCurrentTime(seekTime);
      
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: 'SEEK_VIDEO', videoId: activeVideoId, seekTime });
      channel.close();
    }
  };

  const handleSeekStart = (): void => {
    isSeekingRef.current = true;
  };

  const handleSeekEnd = (): void => {
    isSeekingRef.current = false;
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Listen for progress updates from the display page
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      const handleMessage = (event: MessageEvent) => {
        const data = event.data as VideoState;
        if (data.videoId === activeVideoId && !isSeekingRef.current) {
          setProgress((data.currentTime / data.duration) * 100);
          setDuration(data.duration);
          setCurrentTime(data.currentTime);
          setIsPlaying(data.isPlaying);
        }
      };
      channel.addEventListener('message', handleMessage);
      return () => {
        channel.removeEventListener('message', handleMessage);
        channel.close();
      };
    }
  }, [activeVideoId]);

  return (
    <main className="main-content" style={styles.mainContent}>
      <h1 className="title" style={styles.title}>Explore Manzil Majlis Properties</h1>
      <p className="subtitle" style={styles.subtitle}>Tap on play to begin</p>

      {activeVideoId && (
        <div className="current-video-progress" style={styles.currentVideoProgress}>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            style={styles.progressInput}
            onMouseDown={handleSeekStart}
            onMouseUp={handleSeekEnd}
            onChange={(e) => {
              setProgress(e.target.valueAsNumber);
              handleSeek(e);
            }}
          />
        </div>
      )}

      <div className="video-grid" style={styles.videoGrid}>
        {videos.map((video: Video) => (
          <div 
            key={video.id} 
            className={activeVideoId === video.id ? "video-card active" : "video-card"}
            style={activeVideoId === video.id ? styles.videoCardActive : styles.videoCard}
          >
            <div className="video-thumbnail" style={styles.videoThumbnail}>
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill={true}
                style={{ objectFit: 'cover' }}
              />
            </div>
            
            <div className="video-info" style={styles.videoInfo}>
              <h3 className="video-title" style={styles.videoTitle}>
                {video.title}
              </h3>
              <p className="video-description" style={styles.videoDescription}>
                {video.description}
              </p>
              
              <div className="video-controls" style={styles.videoControls}>
                {activeVideoId === video.id && isPlaying ? (
                  <button
                    className="control-button"
                    style={{
                      ...styles.controlButton,
                      ...(hoveredButton === `${video.id}-pause` ? styles.controlButtonHover : {})
                    }}
                    onMouseEnter={() => setHoveredButton(`${video.id}-pause`)}
                    onMouseLeave={() => setHoveredButton(null)}
                    onClick={() => handleAction(video.id, 'PAUSE')}
                  >
                    <Pause size={16} color="white" />
                  </button>
                ) : (
                  <button
                    className="control-button"
                    style={{
                      ...styles.controlButton,
                      ...(hoveredButton === `${video.id}-play` ? styles.controlButtonHover : {})
                    }}
                    onMouseEnter={() => setHoveredButton(`${video.id}-play`)}
                    onMouseLeave={() => setHoveredButton(null)}
                    onClick={() => handleAction(video.id, 'PLAY')}
                  >
                    <Play size={16} color="white" style={{ marginLeft: '1px' }} />
                  </button>
                )}
                
                <div 
                  className="progress-container"
                  style={styles.progressContainer}
                  onClick={(e) => handleProgressClick(e, duration || 300)}
                >
                  <div 
                    className="progress-bar"
                    style={{
                      ...styles.progressBar,
                      width: `${progress}%`
                    }}
                  />
                </div>
                
                <div className="time-display" style={styles.timeDisplay}>
                  {formatTime(currentTime)} / {formatTime(duration || 300)}
                </div>
                
                <button
                  className="control-button"
                  style={{
                    ...styles.controlButton,
                    ...(hoveredButton === `${video.id}-restart` ? styles.controlButtonHover : {})
                  }}
                  onMouseEnter={() => setHoveredButton(`${video.id}-restart`)}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={() => handleAction(video.id, 'RESTART')}
                >
                  <RotateCcw size={16} color="white" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}