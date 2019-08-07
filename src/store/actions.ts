import {
  PointState,
  PositionState,
  PointProgress,
  StateType,
  PointMetadata
} from "./types";

export const UPDATE_POINTS = "UPDATE_POINTS";
export const UPDATE_POSITION = "UPDATE_POSITION";
export const UPDATE_PROGRESS = "UPDATE_PROGRESS";

export const UPDATE_STATE = "UPDATE_STATE";
export const UPDATE_POINT_METADATA = "UPDATE_POINT_METADATA";
export const RETRY_FETCH = "RETRY_FETCH";

export const BEGIN_FOREGROUND_FETCH = "BEGIN_FOREGROUND_FETCH";
export const STOP_FOREGROUND_FETCH = "STOP_FOREGROUND_FETCH";

export interface IntentAction {
  type: string;
  reason?: string;
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

export interface PointsAction {
  type: typeof UPDATE_POINTS;
  status: string;
}

export function updatePoints(newState: PointState): PointsAction {
  return {
    type: UPDATE_POINTS,
    newState
  };
}

export interface PositionAction {
  type: typeof UPDATE_POSITION;

  position: PositionState;
}

export function updatePosition(position: PositionState): PositionAction {
  return {
    type: UPDATE_POSITION,
    position
  };
}

export interface ProgressAction {
  type: typeof UPDATE_PROGRESS;

  id: number;
  point: PointProgress;
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

export interface StateAction {
  type: typeof UPDATE_STATE;

  state: StateType;
}

export function updateState(state: StateType): StateAction {
  return {
    type: UPDATE_STATE,
    state
  };
}

export interface PointMetadataAction {
  type: typeof UPDATE_POINT_METADATA;

  metadata: PointMetadata;
}

export function updatePointMetadata(
  metadata: PointMetadata
): PointMetadataAction {
  return {
    type: UPDATE_POINT_METADATA,

    metadata
  };
}
