'use client';

import { useEffect, useState, useRef } from 'react';
import { videos, Video } from '../../data/videos';

const CHANNEL_NAME = 'video-sync-channel';

export default function DisplayPage() {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channelRef.current = new BroadcastChannel(CHANNEL_NAME);

      const handleMessage = (event: MessageEvent) => {
        const { type, videoId, action, seekTime } = event.data;
        if (type === 'VIDEO_ACTION') {
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
    if (videoRef.current) {
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
  }, [currentVideo]);

  return (
    <div className="display-container">
      {currentVideo ? (
        <video
          ref={videoRef}
          className="video-player"
          src={currentVideo.url}
          autoPlay={true}
          muted={true}
          controls={false}
          loop={true}
        />
      ) : (
        <div className="placeholder">
          <p>Waiting for a video to be selected...</p>
        </div>
      )}
    </div>
  );
}