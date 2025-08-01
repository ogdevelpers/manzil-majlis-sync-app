'use client';

import { useEffect, useState, useRef } from 'react';
import { videos, Video, landingVideo } from '../../data/videos';
import Image from 'next/image';

const CHANNEL_NAME = 'video-sync-channel';

export default function DisplayPage() {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [showLandingVideo, setShowLandingVideo] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channelRef.current = new BroadcastChannel(CHANNEL_NAME);

      const handleMessage = (event: MessageEvent) => {
        const { type, videoId, action, seekTime } = event.data;

        if (type === 'HOME_ACTION') {
          // Handle home button click - show landing video
          setCurrentVideo(null);
          setShowLandingVideo(true);
          if (videoRef.current) {
            videoRef.current.src = landingVideo.url;
            const playAfterLoad = () => {
              videoRef.current?.play().catch(err => console.error('Play failed:', err));
              videoRef.current?.removeEventListener('loadeddata', playAfterLoad);
            };

            videoRef.current.addEventListener('loadeddata', playAfterLoad);
          }
        } else if (type === 'VIDEO_ACTION') {
          setShowLandingVideo(false);
          if (videoId !== currentVideo?.id) {
            const videoToPlay: Video | undefined = videos.find(v => v.id === videoId);
            if (videoToPlay) {
              setCurrentVideo(videoToPlay);
            }
          }

          if (videoRef.current) {
            switch (action) {
              case 'PLAY':
                videoRef.current.play().catch(error => console.error("Play failed:", error));
                break;
              case 'PAUSE':
                videoRef.current.pause();
                break;
              case 'RESTART':
                videoRef.current.currentTime = 0;
                videoRef.current.play();
                break;
            }
          }
        } else if (type === 'SEEK_VIDEO' && videoRef.current) {
          videoRef.current.currentTime = seekTime;
        }
      };
      channelRef.current.addEventListener('message', handleMessage);
      return () => {
        if (channelRef.current) {
          channelRef.current.removeEventListener('message', handleMessage);
          channelRef.current.close();
        }
      };
    }
  }, [currentVideo]);

  // Effect to handle broadcasting video progress
  useEffect(() => {
    if (videoRef.current && currentVideo && !showLandingVideo) {
      const onTimeUpdate = () => {
        if (channelRef.current && videoRef.current && currentVideo) {
          channelRef.current.postMessage({
            videoId: currentVideo.id,
            currentTime: videoRef.current.currentTime,
            duration: videoRef.current.duration,
            isPlaying: !videoRef.current.paused,
          });
        }
      };

      videoRef.current.addEventListener('timeupdate', onTimeUpdate);

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('timeupdate', onTimeUpdate);
        }
      };
    }
  }, [currentVideo, showLandingVideo]);

  // Get the video source to display
  const getVideoSource = () => {
    if (showLandingVideo) {
      return landingVideo.url;
    } else if (currentVideo) {
      return currentVideo.url;
    } else {
      return landingVideo.url;
    }
  };

  return (
    <>
      <style jsx>{`
        .display-container {
          width: 1920px;
          height: 1080px;
          background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%);
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .logo-wrapper {
          position: absolute;
          top: 40px;
          left: 60px;
          z-index: 10;
        }

        .video-player {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>

      <div className="display-container">
        <div className="logo-wrapper">
          <Image src="images/Logo.svg" alt="Logo" width={118} height={78} />
        </div>

        <video
          ref={videoRef}
          className="video-player"
          src={getVideoSource()}
          autoPlay={true}
          muted={true}
          controls={false}
          loop={true}
        />
      </div>
    </>
  );
}