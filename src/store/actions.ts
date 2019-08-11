import {
  HeadingState,
  PointMetadata,
  PointProgress,
  PointState,
  PositionState,
  StateType
} from "./types";

export const UPDATE_POINTS = "UPDATE_POINTS";
export const UPDATE_POSITION = "UPDATE_POSITION";
export const UPDATE_HEADING = "UPDATE_HEADING";
export const UPDATE_PROGRESS = "UPDATE_PROGRESS";

export const UPDATE_STATE = "UPDATE_STATE";
export const UPDATE_POINT_METADATA = "UPDATE_POINT_METADATA";
export const UPDATE_CURRENT_POINT_CACHE = "UPDATE_CURRENT_POINT_CACHE";
export const RETRY_FETCH = "RETRY_FETCH";

export const BEGIN_FOREGROUND_FETCH = "BEGIN_FOREGROUND_FETCH";
export const STOP_FOREGROUND_FETCH = "STOP_FOREGROUND_FETCH";
export const APP_LAUNCH_COMPLETED = "APP_LAUNCH_COMPLETED";
export const APP_EXITING = "APP_EXITING";

export interface IntentAction {
  type: string;
  reason?: string;
}

export function retryFetch(): IntentAction {
  return {
    type: RETRY_FETCH
  };
}

// Main activity is mounted and location permission has been accepted
export function appLaunchCompleted(): IntentAction {
  return {
    type: APP_LAUNCH_COMPLETED
  };
}

export function appAboutToExit(): IntentAction {
  return {
    type: APP_EXITING
  };
}

export function setForegroundFetch(state: boolean): IntentAction {
  return {
    type: state ? BEGIN_FOREGROUND_FETCH : STOP_FOREGROUND_FETCH
  };
}

export interface PointsAction {
  type: typeof UPDATE_POINTS;
  newState: PointState;
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

export interface HeadingAction {
  type: typeof UPDATE_HEADING;

  heading: HeadingState;
}

export function updateHeading(heading: HeadingState): HeadingAction {
  return {
    type: UPDATE_HEADING,
    heading
  };
}

export type ProgressUpdate = Array<{
  id: string;
  progress: PointProgress;
}>;

export interface ProgressAction {
  type: typeof UPDATE_PROGRESS;

  update: ProgressUpdate;
}

export function updateProgress(update: ProgressUpdate): ProgressAction {
  return {
    type: UPDATE_PROGRESS,

    update
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

export interface CurrentPointAction {
  type: typeof UPDATE_CURRENT_POINT_CACHE;

  currentIds: string[];
  updated: number;
}

export function updateCurrentPointCache(pointIds: string[], updated: number) {
  return {
    type: UPDATE_CURRENT_POINT_CACHE,

    currentIds: pointIds,
    updated
  };
}
