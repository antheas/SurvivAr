import { Location } from "../../../store/types";
import { ExtendedPoint } from "../../../store/model/ExtendedPoint";

const NEARBY_RATIO = 3;

export function convertCoords(coords: Location) {
  return {
    latitude: coords.lat,
    longitude: coords.lon
  };
}

export function isPointClose(point: ExtendedPoint) {
  return point.distance <= NEARBY_RATIO * point.radius;
}
