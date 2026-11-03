import React, { useState, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Film, 
  Music
} from 'lucide-react';
import { DownloadHistoryItem } from '../types';
import { formatDurationSimple } from '../utils/mediaParser';

interface MediaPlayerModalProps {
  item: DownloadHistoryItem | null;
  onClose: () => void;
}

export const MediaPlayerModal: React.FC<MediaPlayerModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const isVideo = item.format === 'MP4';
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (isVideo && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLMediaElement>) => {
    setCurrentTime(e.currentTarget.currentTime);
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (isVideo && videoRef.current) {
      videoRef.current.currentTime = newTime;
    } else if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (videoRef.current) videoRef.current.volume = newVol;
    if (audioRef.current) audioRef.current.volume = newVol;
  };

  const numBars = 32;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-md shadow-2xl overflow-hidden flex flex-col">
        {/* Title bar */}
        <div className="h-8 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between px-3 text-xs select-none">
          <div className="flex items-center gap-2">
            {isVideo ? <Film className="w-3.5 h-3.5 text-neutral-300" /> : <Music className="w-3.5 h-3.5 text-neutral-300" />}
            <span className="font-medium text-white truncate max-w-md">
              A.U.R.A. Player · {item.fileName}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center rounded text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {isVideo && item.blobUrl ? (
            <video
              ref={videoRef}
              src={item.blobUrl}
              autoPlay
              loop={isLooping}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => !isLooping && setIsPlaying(false)}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4 text-center space-y-3">
              {item.blobUrl && (
                <audio
                  ref={audioRef}
                  src={item.blobUrl}
                  autoPlay
                  loop={isLooping}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => !isLooping && setIsPlaying(false)}
                />
              )}

              {/* Minimalist spectrum */}
              <div className="flex items-center justify-center gap-1.5 h-12 w-full max-w-xs">
                {Array.from({ length: numBars }).map((_, i) => {
                  const animHeight = isPlaying
                    ? Math.abs(Math.sin((currentTime * 4) + i * 0.3) * 36) + 4
                    : 3;
                  return (
                    <div
                      key={i}
                      className="w-1 bg-neutral-300 rounded-full transition-all duration-75"
                      style={{ height: `${animHeight}px` }}
                    />
                  );
                })}
              </div>

              <div>
                <h3 className="font-semibold text-xs text-white max-w-sm mx-auto line-clamp-1">{item.title}</h3>
                <div className="text-[11px] font-mono text-neutral-400 mt-0.5">{item.author}</div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-3 bg-neutral-950 border-t border-neutral-800 space-y-2">
          <div className="flex items-center gap-2.5 text-xs font-mono text-neutral-400">
            <span>{formatDurationSimple(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={Math.max(1, item.duration)}
              step={0.1}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="flex-1 cursor-pointer"
            />
            <span>{formatDurationSimple(item.duration)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
              <span className="text-white font-bold">{item.format}</span>
              <span>·</span>
              <span>{item.quality}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  isLooping ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-white'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-white hover:bg-neutral-200 text-neutral-950 flex items-center justify-center cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleVolumeChange(isMuted ? 0.85 : 0)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-14 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
