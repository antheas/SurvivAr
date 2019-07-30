import { NavigationState, PointEvent } from "../store/types";

export interface LocationCallback {
  (): NavigationState;
}

export interface LocationManagerInterface {
  startJsCallbacks(callback: LocationCallback): void;

  stopJsCallbacks(): void;

  enableBackgroundTracking(point: AreaPoint): void;

  disableBackgroundTracking(): void;

  loadBackgroundEvents(): Promise<PointEvent[]>;

  supportsBackgroundTracking: boolean;
}
