import { Location, PointState } from "../store/types";

const BASE_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
const AREA_BOUNDS = 2000;

async function fetchType(location: Location, type: string) {
  let queryUrl = new URLSearchParams(BASE_URL);
  queryUrl.append("key", process.env.MAPS_KEY);

  queryUrl.append("location", `${location.lat}, ${location.lon}`);
  queryUrl.append("radius", AREA_BOUNDS);
  queryUrl.append("type", type);

  let query = queryUrl.toString();

  let results = await fetch(query);

}

// If current data is provided then the new request will be merged with the old one
export async function fetchPoints(location: Location, currentData?: PointState) {
  let newState: PointState;
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



  try {
    const newArea = fetch()
  }
}
