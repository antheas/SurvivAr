import { PositionState, State, HeadingState } from "../types";

export function selectPosition({
  navigation: { position }
}: State): PositionState {
  return position;
}

export function selectHeading({
  navigation: { heading }
}: State): HeadingState {
  return heading;
}
