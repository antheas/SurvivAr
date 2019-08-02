import Config from "react-native-config";
import { Location, PointState, WaitPoint } from "../store/types";

const BASE_URL =
  "https://maps.googleapis.com/maps/api/place/nearbysearch/json?";
const AREA_BOUNDS = 2000;
const API_KEY = Config.MAPS_KEY;

async function fetchType(location: Location, type: string): Object[] {
  let queryUrl = new URLSearchParams();
  queryUrl.append("key", API_KEY);

  queryUrl.append("location", `${location.lat},${location.lon}`);
  queryUrl.append("radius", AREA_BOUNDS);
  queryUrl.append("type", type);

  let query = BASE_URL + queryUrl.toString();
  let queryResponse = await fetch(query);
  let queryResults = await queryResponse.json();

  let nextPage = queryResults.next_page_token;
  let results: any[] = [...queryResults.results];

  while (nextPage) {
    queryUrl = new URLSearchParams();
    queryUrl.append("pagetoken", nextPage);

    query = BASE_URL + queryUrl.toString();
    queryResponse = await fetch(query);
    queryResults = await queryResponse.json();

    results.concat(queryResults.results);
    nextPage = queryResults.next_page_token;
  }

  return results;
}

async function processWaitPoints(points: any[]): WaitPoint {}

// If current data is provided then the new request will be merged with the old one
export default async function fetchPoints(
  location: Location,
  currentData?: PointState
) {
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

  for (let i = 0; i < 5; i++) {
    try {
      await fetchType(location, "pharmacy");
      break;
    } catch (e) {
      console.log(e);
    }
  }
}
