import { State, PointState, PositionState } from "./types";

export function selectPoints({ points }: State): PointState {
  return points;
}

export function selectPosition({ position }: State): PositionState {
  return position;
}
