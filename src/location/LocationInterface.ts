import {
  AreaPoint,
  PointEvent,
  PositionState,
  HeadingState
} from "../store/types";

export type PositionCallback = (position: PositionState) => void;
export type HeadingCallback = (heading: HeadingState) => void;

export default interface LocationManagerInterface {
  supportsBackgroundTracking: boolean;

  registerJsCallbacks(
    position: PositionCallback,
    heading?: HeadingCallback
  ): void;

  unregisterJsCallbacks(): void;

  startJsCallbacks(): void;

  stopJsCallbacks(): void;

  enableBackgroundTracking(point: AreaPoint): void;

  disableBackgroundTracking(): void;

  loadBackgroundEvents(): Promise<PointEvent[]>;
}
