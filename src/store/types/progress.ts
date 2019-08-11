export interface PointEvent {
  duration: number;
  start: Date;
  end: Date;
}

export interface WaitPointProgress {
  elapsedTime: number;
}

export interface QrPointProgress {
  completed: boolean;
}

export interface CollectPointProgress {
  qrPoints: Record<string, QrPointProgress>;
}

export interface ProgressState {
  waitPoints: Record<string, WaitPointProgress>;
  collectPoints: Record<string, CollectPointProgress>;
}
