import { AreaPoint, PointEvent, PositionState } from "../../store/types";

export type PositionCallback = (position: PositionState) => void;

export default interface LocationManagerInterface {
  supportsBackgroundTracking: boolean;

  registerJsCallbacks(position: PositionCallback): void;

  unregisterJsCallbacks(): void;

  startJsCallbacks(): void;

  stopJsCallbacks(): void;

  enableBackgroundTracking(point: AreaPoint): void;

  disableBackgroundTracking(): void;

  loadBackgroundEvents(): Promise<PointEvent[]>;
}
