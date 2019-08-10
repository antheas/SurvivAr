export * from "./navigation";
export * from "./point";
export * from "./progress";
export * from "./session";

import { NavigationState } from "./navigation";
import { PointState } from "./point";
import { ProgressState } from "./progress";
import { SessionState } from "./session";

export interface State {
  navigation: NavigationState;
  points: PointState;
  progress: ProgressState;
  session: SessionState;
}
