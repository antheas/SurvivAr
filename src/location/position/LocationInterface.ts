import { WaitProgressUpdate } from "../../store/actions";
import { ExtendedPoint } from "../../store/model/ExtendedPoint";
import { PositionState } from "../../store/types";

export type PositionCallback = (position: PositionState) => void;

export default interface LocationManagerInterface {
  supportsBackgroundTracking: boolean;

  registerJsCallbacks(position: PositionCallback): void;

  unregisterJsCallbacks(): void;

  startJsCallbacks(): void;

  stopJsCallbacks(): void;

  updateClosestDistance(distance: number): void;

  enableBackgroundTracking(points: ExtendedPoint[]): void;

  stopAndRetrieveProgress(): Promise<WaitProgressUpdate[]>;
}
