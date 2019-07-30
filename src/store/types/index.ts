export * from "./point";
export * from "./navigation";
export * from "./progress";

import { NavigationState } from "./navigation";
import { PointState } from "./point";
import { ProgressState } from "./progress";

export interface State {
  navigation: NavigationState;
  points: PointState;
  progress: ProgressState;
}
