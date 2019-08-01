import { PointState, PositionState, PointProgress, StateType } from "./types";

export const UPDATE_POINTS = "UPDATE_POINTS";
export const UPDATE_POSITION = "UPDATE_POSITION";
export const UPDATE_PROGRESS = "UPDATE_PROGRESS";

export const UPDATE_STATE = "UPDATE_STATE";

export interface PointsAction {
  type: typeof UPDATE_POINTS;
  status: string;

  newState?: PointState;
  error?: string;
}

export interface PositionAction {
  type: typeof UPDATE_POSITION;

  position: PositionState;
}

export interface ProgressAction {
  type: typeof UPDATE_PROGRESS;

  id: number;
  point: PointProgress;
}

export interface StateAction {
  type: typeof UPDATE_STATE;

  state: StateType;
}

export function updatePoints(newState: PointState): PointsAction {
  return {
    type: UPDATE_POINTS,
    newState
  };
}

export function updatePosition(position: PositionState): PositionAction {
  return {
    type: UPDATE_POSITION,
    position
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

export function updateState(state: StateType): StateAction {
  return {
    type: UPDATE_STATE,
    state
  };
}
