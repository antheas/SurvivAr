import { SessionState, StateType } from "../types";
import {
  CurrentPointAction,
  PointMetadataAction,
  StateAction,
  UPDATE_STATE,
  UPDATE_POINT_METADATA,
  UPDATE_CURRENT_WAIT_POINT_CACHE
} from "../actions";

export default function session(
  state: SessionState = {
    state: StateType.STARTUP,
    pointMetadata: {
      distances: {}
    },
    currentPointCache: {
      ids: [],
      updated: 0
    }
  },
  action: StateAction | PointMetadataAction | CurrentPointAction
): SessionState {
  if (action.type === UPDATE_STATE) {
    const newState: SessionState = { ...state };
    newState.state = action.state;
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
  } else {
    return state;
  }
}
