import { Location, PositionState, HeadingState } from "../types";
import {
  PositionAction,
  UPDATE_POSITION,
  UPDATE_HEADING,
  HeadingAction
} from "../actions";
import { combineReducers } from "redux";

const NULL_LOCATION: Location = { lon: 0, lat: 0 };

function position(
  state: PositionState = {
    coords: NULL_LOCATION,
    accuracy: Infinity,
    updated: 0,
    valid: false
  },
  action: PositionAction
): PositionState {
  if (action.type === UPDATE_POSITION) {
    return action.position;
  } else {
    return state;
  }
}

function heading(
  state: HeadingState = {
    degrees: 0,
    updated: 0,
    valid: false
  },
  action: HeadingAction
): HeadingState {
  if (action.type === UPDATE_HEADING) {
    return action.heading;
  } else {
    return state;
  }
}

export default combineReducers({
  position,
  heading
});
