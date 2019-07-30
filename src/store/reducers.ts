import { combineReducers } from "redux";
import {
  PositionAction,
  PointsAction,
  ProgressAction,
  UPDATE_POSITION,
  UPDATE_POINTS,
  UPDATE_PROGRESS
} from "./actions";
import {
  NavigationState,
  PointState,
  ProgressState,
  PointProgress
} from "./types";

const NULL_LOCATION: Location = { lon: 0, lat: 0 };

function position(
  state: PositionState = {
    coords: NULL_LOCATION,
    updated: 0,
    accuracy: Infinity,
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
    updated: false,
    lastUpdated: 0,
    updatedLocation: NULL_LOCATION,
    areas: []
  },
  action: PointsAction
): PointState {
  // TODO: handle errors
  if (action.type === UPDATE_POINTS && action.status === "success") {
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

export default combineReducers({
  position,
  points,
  progress
});
