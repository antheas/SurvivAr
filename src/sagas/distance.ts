// @ts-ignore
import LatLon from "geodesy/latlon-spherical";
import { Location } from "../store/types";

export function toLatLon(l: Location): LatLon {
  return new LatLon(l.lat, l.lon);
}

export function getDistance(start: Location, end: Location): number {
  return toLatLon(start).distanceTo(toLatLon(end));
}

export function withinThreshold(
  start: Location,
  end: Location,
  threshold: number
): boolean {
  return getDistance(start, end) <= threshold;
}
