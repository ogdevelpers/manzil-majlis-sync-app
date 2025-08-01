'use client';

import { useEffect, useState, useRef } from 'react';
import { videos, Video } from '../data/videos';
import Image from 'next/image';
// import { Play, Pause, RotateCcw } from 'lucide-react';

const CHANNEL_NAME = 'video-sync-channel';

interface VideoState {
  videoId: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
}

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

    const handleHomeClick = (): void => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: 'HOME_ACTION' });
      channel.close();
      
      // Reset the active video state
      setActiveVideoId(null);
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
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
    <>
      <style jsx>{`
        .main-content {
          width: 1920px;
          height: calc(1080px - 106px); /* Subtract header height */
          padding: 60px 80px;
          background: #FFFAF7;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          overflow: hidden;
        }

        .title {
          font-size: 56px;
          font-weight: 700;
          color: #69181D;
          text-align: center;
          margin: 0 0 16px 0;
          letter-spacing: -0.5px;
        }

        .subtitle {
          font-size: 44px;
          font-weight: 400;
          color: #69181D;
          text-align: center;
          margin: 0 0 80px 0;
        }

        .current-video-progress {
          width: 600px;
          margin-bottom: 60px;
        }

        .progress-input {
          width: 100%;
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          outline: none;
          cursor: pointer;
          -webkit-appearance: none;
          appearance: none;
        }

        .progress-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #8B4513;
          border-radius: 50%;
          cursor: pointer;
        }

        .progress-input::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #8B4513;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }

        .video-grid {
          display: flex;
          justify-content: space-evenly;
          align-items: flex-start;
          width: 100%;
          max-width: 1760px;
        }

        .video-card {
          border-radius: 16px;
          padding: 24px;
          width: 560px;
          height: 601px;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
        }

        .video-card.active {
          border: 3px solid #69181D;
          border-radius: 40px;
        }

        .video-thumbnail {
          width: 100%;
          height: 270px;
          background: #000;
          border-radius: 40px;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
        }

        .video-info {
          display: flex;
          flex-direction: column;
          padding-top: 1.5rem;
        }

        .video-title {
          font-size: 24px;
          font-weight: 700;
          color: #333;
          margin: 0 0 12px 0;
          line-height: 1.3;
        }

        .video-description {
          font-size: 20px;
          color: #666;
          line-height: 1.5;
          margin: 0 0 24px 0;
        }

        .video-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .control-button {
          width: 50px;
          height: 50px;
          background: #8B4513;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
        }

        .control-button:hover {
          background: #A0522D;
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(139, 69, 19, 0.4);
        }

        .progress-container {
          flex: 1;
          height: 6px;
          background: #e0e0e0;
          border-radius: 3px;
          overflow: hidden;
          cursor: pointer;
          margin: 0 12px;
          position: relative;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #8B4513 0%, #A0522D 100%);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .time-display {
          font-size: 14px;
          font-weight: 500;
          color: #666;
          min-width: 100px;
          text-align: right;
          font-family: 'SF Mono', Monaco, monospace;
        }

        /* Responsive adjustments for exact layout */
        @media (max-width: 1920px) {
          .main-content {
            width: 100vw;
          }
        }
      `}</style>

      <header className="header">
          <div className="logo">
            <Image src="images/Logo.svg" alt="Manzil Majlis Logo" width={161} height={106} />
          </div>
          <a href="/" onClick={handleHomeClick}>
            <div className="home-icon">
              <Image src="images/Home.svg" alt="Home" width={80} height={80} />
            </div>
          </a>
        </header>

      <main className="main-content">
        <h1 className="title">Explore Manzil Majlis Properties</h1>
        <p className="subtitle">Tap on play to begin</p>

        <div className="video-grid">
          {videos.map((video: Video) => (
            <div 
              key={video.id} 
              className={activeVideoId === video.id ? "video-card active" : "video-card"}
            >
              <div className="video-thumbnail">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill={true}
                  style={{ objectFit: 'cover' }}
                />
              </div>
              
              <div className="video-info">
                <h3 className="video-title">
                  {video.title}
                </h3>
                <p className="video-description">
                  {video.description}
                </p>
                
                <div className="video-controls">
                  {activeVideoId === video.id && isPlaying ? (
                    <button
                      className="control-button"
                      onClick={() => handleAction(video.id, 'PAUSE')}
                    >
                      <Image src="images/pause.svg" alt="Pause" width={80} height={80} />
                      {/* <Pause size={20} color="white" /> */}
                    </button>
                  ) : (
                    <button
                      className="control-button"
                      onClick={() => handleAction(video.id, 'PLAY')}
                    >
                      <Image src="images/play.svg" alt="Play" width={80} height={80} />
                      {/* <Play size={20} color="white" style={{ marginLeft: '2px' }} /> */}
                    </button>
                  )}
                  
                  {activeVideoId === video.id && (
                    <>
                      <div 
                        className="progress-container"
                        onClick={(e) => handleProgressClick(e, duration || 300)}
                      >
                        <div 
                          className="progress-bar"
                          style={{
                            width: `${progress}%`
                          }}
                        />
                      </div>
                      
                      <div className="time-display">
                        {formatTime(currentTime)} / {formatTime(duration || 300)}
                      </div>
                      
                      {/* <button
                        className="control-button"
                        onClick={() => handleAction(video.id, 'RESTART')}
                      >
                        <Image src="images/restart.png" alt="Restart" width={80} height={80} />
                      </button> */}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}