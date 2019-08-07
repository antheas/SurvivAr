import { PointState, PositionState, PointProgress, StateType } from "./types";

export const UPDATE_POINTS = "UPDATE_POINTS";
export const UPDATE_POSITION = "UPDATE_POSITION";
export const UPDATE_PROGRESS = "UPDATE_PROGRESS";

export const UPDATE_STATE = "UPDATE_STATE";
export const UPDATE_CURRENT_AREAS = "UPDATE_CURRENT_AREAS";
export const RETRY_FETCH = "RETRY_FETCH";

export const BEGIN_FOREGROUND_FETCH = "BEGIN_FOREGROUND_FETCH";
export const STOP_FOREGROUND_FETCH = "STOP_FOREGROUND_FETCH";

export interface IntentAction {
  type: string;
  reason?: string;
}

export interface PointsAction {
  type: typeof UPDATE_POINTS;
  status: string;
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

export interface CurrentAreaAction {
  type: typeof UPDATE_CURRENT_AREAS;

  currentAreaId?: string;
  currentPointId?: string;
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

export function retryFetch(): IntentAction {
  return {
    type: RETRY_FETCH
  };
}

export function setForegroundFetch(state: boolean): IntentAction {
  return {
    type: state ? BEGIN_FOREGROUND_FETCH : STOP_FOREGROUND_FETCH
  };
}

export function updateCurrentAreas(
  currentAreaId?: string,
  currentPointId?: string
): CurrentAreaAction {
  return {
    type: UPDATE_CURRENT_AREAS,

    currentAreaId,
    currentPointId
  };
}
