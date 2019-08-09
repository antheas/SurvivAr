import { AreaPoint, PointEvent, PositionState } from "../store/types";

export type LocationCallback = (position: PositionState) => void;

export default interface LocationManagerInterface {
  supportsBackgroundTracking: boolean;

  startJsCallbacks(callback: LocationCallback): void;

  stopJsCallbacks(): void;

  enableBackgroundTracking(point: AreaPoint): void;

  disableBackgroundTracking(): void;

  loadBackgroundEvents(): Promise<PointEvent[]>;
}
