import { combineReducers } from "redux";
import {
  PositionAction,
  PointsAction,
  ProgressAction,
  UPDATE_POSITION,
  UPDATE_POINTS,
  UPDATE_PROGRESS,
  UPDATE_STATE
} from "./actions";
import {
  NavigationState,
  PointState,
  ProgressState,
  PointProgress,
  SessionState,
  StateType
} from "./types";

const NULL_LOCATION: Location = { lon: 0, lat: 0 };

function position(
  state: PositionState = {
    coords: NULL_LOCATION,
    heading: 0,
    accuracy: Infinity,
    updated: 0,
    valid: false
  },
  action: PositionAction
): NavigationState {
  if (action.type === UPDATE_POSITION) {
    return action.position;
  } else {
    return state;
  }
}

function points(
  state: PointState = {
    valid: false,
    updated: 0,
    location: NULL_LOCATION,
    bounds: 0,
    areas: []
  },
  action: PointsAction
): PointState {
  // TODO: handle errors
  if (action.type === UPDATE_POINTS) {
    return action.newState;
  } else {
    return state;
  }
}

function progress(
  state: ProgressState = new Map<number, PointProgress>(),
  action: ProgressAction
): ProgressState {
  if (action.type === UPDATE_PROGRESS) {
    let newState = new Map(state);
    newState[action.id] = action.point;
    return newState;
  } else {
    return state;
  }
}

function session(
  state: SessionState = { state: StateType.STARTUP },
  action: StateAction
): SessionState {
  if (action.type === UPDATE_STATE) {
    return { state: action.state };
  } else {
    return state;
  }
}

export default combineReducers({
  position,
  points,
  progress,
  session
});
