import { PointState } from "../types";

export const UPDATE_POINTS = "UPDATE_POINTS";

export interface PointsAction {
  type: typeof UPDATE_POINTS;
  newState: PointState;
}

export function updatePoints(newState: PointState): PointsAction {
  return {
    type: UPDATE_POINTS,
    newState
  };
}
