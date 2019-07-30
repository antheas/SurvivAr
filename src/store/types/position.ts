import { Location } from "./point";

export interface PositionState {
  coords: Location;
  accuracy: number;
  updated: number;
  valid: boolean;
}
