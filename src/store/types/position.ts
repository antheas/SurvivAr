import { Location } from "./point";

export interface PositionState {
  coords: Location;
  heading: number;
  accuracy: number;
  updated: number;
  valid: boolean;
}
