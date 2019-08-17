import { PositionAction, UPDATE_POSITION } from "../actions";
import { Location, PositionState } from "../types";

const NULL_LOCATION: Location = { lon: 0, lat: 0 };

export default function position(
  state: PositionState = {
    coords: NULL_LOCATION,
    accuracy: 0,
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
