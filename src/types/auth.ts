export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface CurrentUser {
  username: string;
  loginAt: number;
}

export interface UserDevice {
  username: string;
  deviceType: DeviceType;
  fingerprint: string;
  loginAt: number;
}

export interface LearningProgress {
  username: string;
  videoId: string;
  progress: number;
  updatedAt: number;
}

export interface CompletedVideo {
  username: string;
  videoId: string;
  completedAt: number;
}
