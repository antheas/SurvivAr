import { PositionState, HeadingState } from "../types";

export const UPDATE_POSITION = "UPDATE_POSITION";
export const UPDATE_HEADING = "UPDATE_HEADING";

export interface PositionAction {
  type: typeof UPDATE_POSITION;

  position: PositionState;
}

export interface HeadingAction {
  type: typeof UPDATE_HEADING;

  heading: HeadingState;
}

export function updatePosition(position: PositionState): PositionAction {
  return {
    type: UPDATE_POSITION,
    position
  };
}

export function updateHeading(heading: HeadingState): HeadingAction {
  return {
    type: UPDATE_HEADING,
    heading
  };
}
