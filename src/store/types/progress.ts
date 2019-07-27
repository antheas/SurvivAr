export interface PointProgress {
  completed: boolean;

  elapsedTime?: number; // Only applicable for WaitPoint
  isCollected?: boolean; // Only applicable for QrPoint
}

export interface Progress {
  points: Map<number, PointProgress>;
}
