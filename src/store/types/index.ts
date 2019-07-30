export * from "./position";
export * from "./point";
export * from "./progress";

import { PositionState } from "./position";
import { PointState } from "./point";
import { ProgressState } from "./progress";

export interface State {
  navigation: PositionState;
  points: PointState;
  progress: ProgressState;
}
