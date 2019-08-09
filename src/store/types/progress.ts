export interface PointEvent {
  duration: number;
  start: Date;
  end: Date;
}

export interface PointProgress {
  completed?: boolean; // Only applicable for QrPoint
  elapsedTime?: number; // Only applicable for WaitPoint
}

export interface ProgressState {
  points: Record<string, PointProgress>;
}
