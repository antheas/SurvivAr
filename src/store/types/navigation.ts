import { Location } from "./point";

export const FINE_LOCATION_THRESHOLD = 100;

export interface PositionState {
  coords: Location;
  accuracy: number;
  updated: number;
  valid: boolean;
}

export interface HeadingState {
  degrees: number;
  valid: boolean;
  supported: boolean;
}

export interface NavigationState {
  position: PositionState;
  heading: HeadingState;
}
