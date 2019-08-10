/**
 * Given a pre-defined set of coordinates as {latitude: ..., longitude: ...}
 * and a pre-defined center point with {latitude: ..., longitude: ...}
 * Find the zoom deltas needed for maps
 *
 * adapted from: https://gist.github.com/codenamev/14a2a0c5370f00ab1dae
 *
 */

export interface Point {
  latitude: number;
  longitude: number;
}

const maxCoordinateDistance = (point1: Point, point2: Point) => {
  // finding "furthest distance" means finding
  // the maximum of the x/y deltas
  const latDelta =
    Math.max(point1.latitude, point2.latitude) -
    Math.min(point1.latitude, point2.latitude);
  const longDelta =
    Math.max(point1.longitude, point2.longitude) -
    Math.min(point1.longitude, point2.longitude);

  return {
    latitudeDelta: latDelta,
    longitudeDelta: longDelta
  };
};

// https://pusher.com/tutorials/carpooling-react-native-part-2
export function deltasFromAccuracy(p: Point, accuracy: number) {
  const oneDegreeOfLongitudeInMeters = 111.32 * 1000;
  const circumference = (40075 / 360) * 1000;

  const latDelta = accuracy * (1 / (Math.cos(p.latitude) * circumference));
  const lonDelta = accuracy / oneDegreeOfLongitudeInMeters;

  return {
    latitudeDelta: Math.max(0, latDelta) * 2,
    longitudeDelta: Math.max(0, lonDelta) * 2
  };
}

const deltasFromCenter = (center: Point, coordinates: Point[]) => {
  let maxLatDelta = 0;
  let maxLonDelta = 0;

  for (const coords of coordinates) {
    const distanceFromCenter = maxCoordinateDistance(center, coords);
    maxLatDelta = Math.max(maxLatDelta, distanceFromCenter.latitudeDelta);
    maxLonDelta = Math.max(maxLonDelta, distanceFromCenter.longitudeDelta);
  }
  // maxLatDelta and maxLongDelta are now the furthest radial distance from
  // the center point, so multiply by 2 will give you the deltas you need
  // for zooming a map
  return {
    latitudeDelta: maxLatDelta * 2,
    longitudeDelta: maxLonDelta * 2
  };
};

const coordinateDeltas = (
  center: Point,
  coordinates: Point[],
  minRadius: number = 0,
  margin: number = 0.2
) => {
  const centerDeltas = deltasFromCenter(center, coordinates);
  const radiusDeltas = deltasFromAccuracy(center, minRadius);

  return {
    ...center,
    latitudeDelta:
      Math.max(centerDeltas.latitudeDelta, radiusDeltas.latitudeDelta) *
      (1 + margin),
    longitudeDelta:
      Math.max(centerDeltas.longitudeDelta, radiusDeltas.longitudeDelta) *
      (1 + margin)
  };
};

export default coordinateDeltas;
