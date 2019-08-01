import { State } from "./types";

export function selectPoints({ points }: State): PointState {
  return points;
}

export function selectPosition({ position }: State): PointState {
  return position;
}
