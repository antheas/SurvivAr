import { PointMetadata, StateType } from "../types";

export const UPDATE_STATE = "UPDATE_STATE";
export const UPDATE_POINT_METADATA = "UPDATE_POINT_METADATA";
export const SET_BACKGROUND_TRACKING = "SET_BACKGROUND_TRACKING";

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

export interface BackgroundTrackingAction {
  type: typeof SET_BACKGROUND_TRACKING;

  enabled: boolean;
}

export function setBackgroundTracking(
  enabled: boolean
): BackgroundTrackingAction {
  return {
    type: SET_BACKGROUND_TRACKING,

    enabled
  };
}
