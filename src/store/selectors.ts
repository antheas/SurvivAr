import { State, PointState, PositionState } from "./types";

export function selectPoints({ points }: State): PointState {
  return points;
}

export function selectPosition({
  navigation: { position }
}: State): PositionState {
  return position;
}
