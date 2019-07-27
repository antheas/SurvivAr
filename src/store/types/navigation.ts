import { Location } from "./point";

export interface NavigationState {
  currentLocation: Location;
  lastUpdate: number;
  accuracy: number;
}
