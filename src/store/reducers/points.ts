import { PointState, Location } from "../types";
import { PointsAction, UPDATE_POINTS } from "../actions";

const NULL_LOCATION: Location = { lon: 0, lat: 0 };

export default function points(
  state: PointState = {
    valid: false,
    updated: 0,
    location: NULL_LOCATION,
    bounds: 0,
    areas: [],
    points: {}
  },
  action: PointsAction
): PointState {
  if (action.type === UPDATE_POINTS) {
    return action.newState;
  } else {
    return state;
  }
}
