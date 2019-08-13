export * from "./navigation";
export * from "./point";
export * from "./progress";
export * from "./session";

import { PositionState } from "./navigation";
import { PointState } from "./point";
import { ProgressState } from "./progress";
import { SessionState } from "./session";

export interface State {
  position: PositionState;
  points: PointState;
  progress: ProgressState;
  session: SessionState;
}
