import Config from "react-native-config";
import {
  Location,
  PointState,
  WaitPoint,
  AreaPoint,
  Point
} from "../store/types";
import URLSearchParams from "@ungap/url-search-params";

const BASE_URL =
  "https://maps.googleapis.com/maps/api/place/nearbysearch/json?";
const AREA_BOUNDS = 2000;
const API_KEY = Config.REACT_APP_PLACES_KEY;
const MAX_RETRIES = 5;
const BOUNDS = 100000;

async function fetchType(
  location: Location,
  type: string
): Promise<Array<Record<string, any>>> {
  let queryUrl = new URLSearchParams();
  queryUrl.append("key", API_KEY);

  queryUrl.append("location", `${location.lat},${location.lon}`);
  queryUrl.append("radius", AREA_BOUNDS.toString());
  queryUrl.append("type", type);

  let query = BASE_URL + queryUrl.toString();
  let queryResponse = await fetch(query);
  let queryResults = await queryResponse.json();

  if (queryResults.status !== "OK")
    throw new Error("Invalid status: " + queryResults.status);

  let nextPage = queryResults.next_page_token;
  let results: Array<Record<string, any>> = [...queryResults.results];

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
  point: Record<string, any>,
  radius: number,
  icon: string
): Point {
  return {
    id: point.id as string,

    name: point.name as string,
    desc: point.vicinity as string,

    loc: {
      lat: point.geometry.location.lat as number,
      lon: point.geometry.location.lng as number
    },
    radius,
    icon
  };
}

function processWaitPoint(point: Record<string, any>, icon: string): WaitPoint {
  return {
    ...processPoint(point, 50, icon),
    duration: 30
  };
}

// If current data is provided then the new request will be merged with the old one
export default async function fetchPoints(
  location: Location,
  currentData?: PointState
): Promise<PointState> {
  let loc;
  let bounds;
  let areas;
  let points;

  if (currentData && currentData.valid) {
    loc = currentData.location;
    bounds = currentData.bounds;
    areas = [...currentData.areas];
    points = { ...currentData.points };
  } else {
    loc = location;
    bounds = BOUNDS;
    areas = [] as AreaPoint[];
    points = {};
  }

  const newState = {
    valid: true,
    updated: Date.now(),
    location: loc,
    bounds,
    areas,
    points
  };

  let pointJson;
  let error: Error | null = null;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      pointJson = await fetchType(location, "pharmacy");
      break;
    } catch (e) {
      error = e;
    }
  }
  if (!pointJson) throw Error("Connection Error: " + error);

  const newPoints = pointJson.map(p => processWaitPoint(p, "pharmacy"));
  const newArea: AreaPoint = {
    id: Date.now().toString(),

    name: "",
    desc: "",

    loc: location,
    radius: AREA_BOUNDS,

    icon: "",
    children: newPoints.map(p => p.id)
  };
  newState.areas.push(newArea);
  newPoints.forEach(p => (newState.points[p.id] = p));

  return newState;
}
