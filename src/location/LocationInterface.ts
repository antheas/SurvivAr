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
  supportsHeading: boolean;

  startJsCallbacks(position: PositionCallback, heading?: HeadingCallback): void;

  stopJsCallbacks(): void;

  enableBackgroundTracking(point: AreaPoint): void;

  disableBackgroundTracking(): void;

  loadBackgroundEvents(): Promise<PointEvent[]>;
}
