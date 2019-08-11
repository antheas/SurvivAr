import { Location } from "../store/types";
import { LatLonSpherical } from "geodesy";

export function toLatLon(l: Location): LatLonSpherical {
  return new LatLonSpherical(l.lat, l.lon);
}

export function getDistance(start: Location, end: Location): number {
  return toLatLon(start).distanceTo(toLatLon(end));
}

export function withinThreshold(
  start: Location,
  end: Location,
  threshold: number
): boolean {
  return distance(start, end) <= threshold;
}
