import {
  BackgroundTrackingAction,
  CurrentPointAction,
  PointMetadataAction,
  SET_BACKGROUND_TRACKING,
  StateAction,
  UPDATE_CURRENT_WAIT_POINT_CACHE,
  UPDATE_POINT_METADATA,
  UPDATE_STATE,
  BackgroundProgressAction,
  STASH_BACKGROUND_PROGRESS
} from "../actions";
import { SessionState, StateType } from "../types";

export default function session(
  state: SessionState = {
    state: StateType.STARTUP,
    backgroundTrackingEnabled: false,
    pointMetadata: {
      distances: {}
    },
    currentPointCache: {
      ids: [],
      updated: 0
    },
    completedIds: [],
    backgroundProgress: []
  },
  action:
    | StateAction
    | PointMetadataAction
    | CurrentPointAction
    | BackgroundTrackingAction
    | BackgroundProgressAction
): SessionState {
  if (action.type === UPDATE_STATE) {
    const newState: SessionState = { ...state };
    newState.state = action.state;
    return newState;
  } else if (action.type === SET_BACKGROUND_TRACKING) {
    const newState: SessionState = { ...state };
    newState.backgroundTrackingEnabled = action.enabled;
    return newState;
  } else if (action.type === UPDATE_POINT_METADATA) {
    const newState: SessionState = { ...state };
    newState.pointMetadata = action.metadata;
    return newState;
  } else if (action.type === UPDATE_CURRENT_WAIT_POINT_CACHE) {
    const newState: SessionState = { ...state };
    newState.currentPointCache = {
      ids: action.currentIds,
      updated: action.updated
    };
    return newState;
  } else if (action.type === STASH_BACKGROUND_PROGRESS) {
    const newState: SessionState = { ...state };
    newState.backgroundProgress = action.updates;
    return newState;
  } else {
    return state;
  }
}
