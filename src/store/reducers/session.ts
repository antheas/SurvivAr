import { combineReducers } from "redux";
import {
  BackgroundProgressAction,
  BackgroundTrackingAction,
  CurrentPointAction,
  PointMetadataAction,
  SET_BACKGROUND_TRACKING,
  STASH_BACKGROUND_PROGRESS,
  StateAction,
  UPDATE_CURRENT_WAIT_POINT_CACHE,
  UPDATE_POINT_METADATA,
  UPDATE_STATE,
  WaitProgressUpdate,
  CompletedPointsAction,
  ADD_COMPLETED_POINTS,
  CLEAR_COMPLETED
} from "../actions";
import { PointMetadata, StateType } from "../types";

function stateReducer(
  state: StateType = StateType.STARTUP,
  action: StateAction
) {
  if (action.type === UPDATE_STATE) {
    return action.state;
  }
  return state;
}

function backgroundTrackingEnabled(
  state: boolean = false,
  action: BackgroundTrackingAction
) {
  if (action.type === SET_BACKGROUND_TRACKING) {
    return action.enabled;
  }
  return state;
}

function pointMetadata(
  state: PointMetadata = { distances: {} },
  action: PointMetadataAction
) {
  if (action.type === UPDATE_POINT_METADATA) {
    return action.metadata;
  }
  return state;
}

function currentPointCache(
  state: {
    ids: string[];
    updated: number;
  } = { ids: [], updated: 0 },
  action: CurrentPointAction
) {
  if (action.type === UPDATE_CURRENT_WAIT_POINT_CACHE) {
    return {
      ids: action.currentIds,
      updated: action.updated
    };
  }
  return state;
}

function completedIds(state: string[] = [], action: CompletedPointsAction) {
  if (action.type === ADD_COMPLETED_POINTS) {
    return [...state, ...action.ids];
  } else if (action.type === CLEAR_COMPLETED) {
    return [];
  }
  return state;
}

function backgroundProgress(
  state: WaitProgressUpdate[] = [],
  action: BackgroundProgressAction
) {
  if (action.type === STASH_BACKGROUND_PROGRESS) {
    return action.updates;
  }
  return state;
}

export default combineReducers({
  state: stateReducer,
  backgroundTrackingEnabled,
  pointMetadata,
  currentPointCache,
  completedIds,
  backgroundProgress
});
