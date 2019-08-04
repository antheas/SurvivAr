import Config from "react-native-config";
import {
  Location,
  PointState,
  WaitPoint,
  QrPoint,
  AreaPoint
} from "../store/types";

const BASE_URL =
  "https://maps.googleapis.com/maps/api/place/nearbysearch/json?";
const AREA_BOUNDS = 2000;
const API_KEY = Config.MAPS_KEY;
const MAX_RETRIES = 5;

async function fetchType(
  location: Location,
  type: string
): Record<string, string | number>[] {
  let queryUrl = new URLSearchParams();
  queryUrl.append("key", API_KEY);

  queryUrl.append("location", `${location.lat},${location.lon}`);
  queryUrl.append("radius", AREA_BOUNDS);
  queryUrl.append("type", type);

  let query = BASE_URL + queryUrl.toString();
  let queryResponse = await fetch(query);
  let queryResults = await queryResponse.json();

  let nextPage = queryResults.next_page_token;
  let results: Record<string, string | number>[] = [...queryResults.results];

  while (nextPage) {
    queryUrl = new URLSearchParams();
    queryUrl.append("pagetoken", nextPage);

    query = BASE_URL + queryUrl.toString();
    queryResponse = await fetch(query);
    queryResults = await queryResponse.json();

    results = results.concat(queryResults.results);
    nextPage = queryResults.next_page_token;
  }

  return results;
}

function processPoint(
  point: Record<string, number | string>,
  radius: number,
  icon: string
): Point {
  return {
    id: point.id,

    name: point.name,
    desc: point.vicinity,

    loc: {
      lat: point.geometry.location.lat,
      lon: point.geometry.location.lng
    },
    radius,
    icon
  };
}

function processWaitPoint(
  point: Record<string, string | number>,
  icon: string
): WaitPoint {
  return {
    ...processPoint(point, 50),
    duration: 30,
    icon
  };
}

// If current data is provided then the new request will be merged with the old one
export default async function fetchPoints(
  location: Location,
  currentData?: PointState
): (WaitPoint | QrPoint)[] {
  let newState: PointState = {};
  newState.valid = true;
  newState.updated = new Date().getMilliseconds;

  if (currentData && currentData.valid) {
    newState.location = currentData.location;
    newState.bounds = currentData.bounds;
    newState.areas = [...currentData.areas];
  } else {
    newState.location = location;
    newState.bounds = Infinity;
    newState.areas = [];
  }

  let pointJson;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      pointJson = await fetchType(location, "pharmacy");
      break;
    } catch (e) {
      // noop
    }
  }
  if (!pointJson) throw Error("Connection Error");

  let newAreaPoints = pointJson.map(p => processWaitPoint(p, "pharmacy"));
  let newArea: AreaPoint = {
    id: new Date().toDateString(),

    name: null,
    desc: null,

    loc: location,
    radius: AREA_BOUNDS,

    children: newAreaPoints
  };

  newState.areas.push(newArea);

  return newState;
}
