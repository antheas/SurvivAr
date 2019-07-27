import { PointState, Navigation, PointProgress } from "./types";

export const UPDATE_POINTS = "UPDATE_POINTS";
export const UPDATE_NAVIGATION = "UPDATE_NAVIGATION";
export const UPDATE_PROGRESS = "UPDATE_PROGRESS";

export interface PointsAction {
  type: typeof UPDATE_POINTS;
  status: string;

  newState?: PointState;
  error?: string;
}

export interface NavigationAction {
  type: typeof UPDATE_NAVIGATION;

  navigation: Navigation;
}

export interface ProgressAction {
  type: typeof UPDATE_PROGRESS;

  id: number;
  point: PointProgress;
}

export function updatePoints(newState: PointState): PointsAction {
  return {
    type: UPDATE_POINTS,
    newState
  };
}

export function updateNavigation(navigation: Navigation): NavigationAction {
  return {
    type: UPDATE_NAVIGATION,
    navigation
  };
}

export function updateProgress(
  id: number,
  point: PointProgress
): ProgressAction {
  return {
    type: UPDATE_PROGRESS,
    id,
    point
  };
}
