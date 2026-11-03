export type SupportedPlatform = 
  | 'youtube' 
  | 'reddit' 
  | 'tiktok' 
  | 'instagram' 
  | 'twitter' 
  | 'soundcloud' 
  | 'vimeo' 
  | 'direct';

export type OutputFormat = 'MP4' | 'MP3' | 'WAV' | 'FLAC' | 'AAC';

export type VideoResolution = '2160p' | '1440p' | '1080p' | '720p' | '480p' | '360p';

export type AudioBitrate = '320k' | '256k' | '192k' | '128k' | 'lossless';

export type AudioSampleRate = '44100' | '48000' | '96000';

export interface MediaMetadata {
  id: string;
  url: string;
  platform: SupportedPlatform;
  title: string;
  author: string;
  duration: number; // in seconds
  thumbnail: string;
  sourceQuality: string;
  availableResolutions: VideoResolution[];
  availableBitrates: AudioBitrate[];
  filesizeApprox: number; // in MB
  views?: string;
  likes?: string;
}

export interface TrimRange {
  start: number; // seconds
  end: number; // seconds
  enabled: boolean;
}

export interface ConversionTask {
  id: string;
  metadata: MediaMetadata;
  format: OutputFormat;
  resolution?: VideoResolution;
  bitrate?: AudioBitrate;
  sampleRate?: AudioSampleRate;
  channels?: 'stereo' | 'mono';
  trim: TrimRange;
  normalizeAudio: boolean;
  status: 'idle' | 'analyzing' | 'downloading' | 'converting' | 'completed' | 'error' | 'paused';
  progress: number; // 0 - 100
  downloadSpeed: string; // e.g. "12.4 MB/s"
  outputFilePath: string;
  outputFileName: string;
  fileBlob?: Blob;
  fileSizeText?: string;
  error?: string;
}

export interface DownloadHistoryItem {
  id: string;
  title: string;
  author: string;
  originalUrl: string;
  platform: SupportedPlatform;
  format: OutputFormat;
  quality: string; // e.g. "1080p 60fps" or "320 kbps"
  duration: number;
  fileSizeText: string;
  folderPath: string;
  fileName: string;
  timestamp: number;
  thumbnail: string;
  blobUrl?: string;
  trimUsed?: boolean;
  trimInfo?: string;
}

export interface AppSettings {
  defaultFolder: string;
  namingPattern: '{title} - {author}' | '{title} [{quality}]' | '{author} - {title}' | '{title}';
  autoStartDownload: boolean;
  parallelDownloads: number;
  prefer60fps: boolean;
  audioNormalization: boolean;
  defaultVideoFormat: OutputFormat;
  defaultVideoRes: VideoResolution;
  defaultAudioFormat: OutputFormat;
  defaultAudioBitrate: AudioBitrate;
  notifyOnComplete: boolean;
}
