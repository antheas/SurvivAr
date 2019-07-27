export interface PointProgress {
  completed: boolean;

  elapsedTime?: number; // Only applicable for WaitPoint
}

export interface Progress {
  points: Map<number, PointProgress>;
}
