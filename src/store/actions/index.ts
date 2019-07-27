import { PointState, Navigation, PointProgress } from "../types";

export const UPDATE_POINTS = "UPDATE_POINTS";
export const UPDATE_POSITION = "UPDATE_POSITION";
export const UPDATE_PROGRESS = "UPDATE_PROGRESS";

export interface PointAction {
  type: typeof UPDATE_POINTS;
  status: string;

  newState?: PointState;
  error?: string;
}

export interface PositionAction {
  type: typeof UPDATE_POSITION;

  navigation: Navigation;
}

export interface ProgressAction {
  type: typeof UPDATE_PROGRESS;

  id: number;
  point: PointProgress;
}

export function updatePoints(newState: PointState): PointAction {
  return {
    type: UPDATE_POINTS,
    newState
  };
}

export function updatePosition(navigation: Navigation): PositionAction {
  return {
    type: UPDATE_POSITION,
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
