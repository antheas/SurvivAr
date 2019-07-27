import { combineReducers } from "redux";
import {
  NavigationAction,
  UPDATE_NAVIGATION,
  UPDATE_POINTS,
  PointsAction,
  ProgressAction,
  UPDATE_PROGRESS
} from "./actions";
import { NavigationState, PointState, ProgressState } from "./types";

const NULL_LOCATION: Location = { lon: 0, lat: 0 };

function navigation(
  state: NavigationState = {
    currentLocation: NULL_LOCATION,
    lastUpdate: 0,
    accuracy: Infinity,
    valid: false
  },
  action: NavigationAction
): NavigationState {
  if (action.type === UPDATE_NAVIGATION) {
    return action.navigation;
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
  state: ProgressState = {},
  action: ProgressAction
): ProgressState {
  if (action.type === UPDATE_PROGRESS) {
    let newState = { ...state, [action.id]: action.point };
    return newState;
  } else {
    return state;
  }
}

export default combineReducers({
  navigation,
  points,
  progress
});
