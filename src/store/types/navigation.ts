import { Location } from "./point";

export interface Navigation {
  currentLocation: Location;
  lastUpdate: number;
  accuracy: number;
}
