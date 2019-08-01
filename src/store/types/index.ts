export * from "./position";
export * from "./point";
export * from "./progress";
export * from "./session";

import { PositionState } from "./position";
import { PointState } from "./point";
import { ProgressState } from "./progress";
import { SessionState } from "./session";

export interface State {
  navigation: PositionState;
  points: PointState;
  progress: ProgressState;
  session: SessionState;
}
