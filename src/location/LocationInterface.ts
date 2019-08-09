import { PositionState, PointEvent, AreaPoint } from "../store/types";

export interface LocationCallback {
  (position: PositionState): void;
}

export default interface LocationManagerInterface {
  startJsCallbacks(callback: () => PositionState): void;

  stopJsCallbacks(): void;

  enableBackgroundTracking(point: AreaPoint): void;

  disableBackgroundTracking(): void;

  loadBackgroundEvents(): Promise<PointEvent[]>;

  supportsBackgroundTracking: boolean;
}
