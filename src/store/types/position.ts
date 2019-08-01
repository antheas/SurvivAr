import { Location } from "./point";

export const FINE_LOCATION_THRESHOLD = 40;

export interface PositionState {
  coords: Location;
  heading: number;
  accuracy: number;
  updated: number;
  valid: boolean;
}
