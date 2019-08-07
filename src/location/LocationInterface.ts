import { PositionState, PointEvent } from "../store/types";

export interface LocationCallback {
  (): PositionState;
}

export interface LocationManagerInterface {
  startJsCallbacks(callback: () => PositionState): void;

  stopJsCallbacks(): void;

  enableBackgroundTracking(point: AreaPoint): void;

  disableBackgroundTracking(): void;

  loadBackgroundEvents(): Promise<PointEvent[]>;

  supportsBackgroundTracking: boolean;
}
