import { PositionState } from "../types";

export const UPDATE_POSITION = "UPDATE_POSITION";
export const UPDATE_HEADING = "UPDATE_HEADING";

export interface PositionAction {
  type: typeof UPDATE_POSITION;

  position: PositionState;
}

export function updatePosition(position: PositionState): PositionAction {
  return {
    type: UPDATE_POSITION,
    position
  };
}
