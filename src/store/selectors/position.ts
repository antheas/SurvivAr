import { PositionState, State } from "../types";

export function selectPosition({ position }: State): PositionState {
  return position;
}
