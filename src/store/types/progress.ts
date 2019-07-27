export interface PointProgress {
  completed: boolean;

  elapsedTime?: number; // Only applicable for WaitPoint
  isCollected?: boolean; // Only applicable for QrPoint
}

export interface ProgressState {
  points: Map<number, PointProgress>;
}
