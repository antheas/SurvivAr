/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { fork, take, put, select } from "redux-saga/effects";
import { UPDATE_POSITION, updateState, PositionAction } from "../store/actions";
import {
  FINE_LOCATION_THRESHOLD,
  StateType,
  PointState,
  POINT_DATA_STALE_AFTER_DAYS,
  Location
} from "../store/types";
import { selectPoints, selectPosition } from "../store/selectors";

import haversine from "haversine";

function distance(start: Location, end: Location): number {
  return haversine(start, end, { unit: "meter", format: "{lat,lon}" });
}

function withinThreshold(
  start: Location,
  end: Location,
  threshold: number
): boolean {
  return haversine(start, end, {
    unit: "meter",
    format: "{lat,lon}",
    threshold
  });
}

function* handleBackgroundEvents() {}

// Wait until we have the required meters of accuracy.
function* waitForFineLocation() {
  yield put(updateState(StateType.WAITING_FOR_FINE_LOCATION));
  let accuracy;
  do {
    const action: PositionAction = yield take(UPDATE_POSITION);
    accuracy = action.position.accuracy;
  } while (accuracy > FINE_LOCATION_THRESHOLD);
}

const DAYS_TO_MS = 24 * 60 * 60 * 1000;
const POINT_DATA_STALE_AFTER_MS = POINT_DATA_STALE_AFTER_DAYS * DAYS_TO_MS;

function* fetchRootNode() {
  yield put({ type: "Fetching root node..." });
}

// Check if root node needs to be refreshed and refresh it.
function* refreshRootNode() {
  yield put(updateState(StateType.RETRIEVING_DATA));

  const coords: Location = yield select(selectPosition);
  const points: PointState = yield select(selectPoints);

  // Check if valid / not stale
  if (
    !points.valid ||
    points.updated > POINT_DATA_STALE_AFTER_MS ||
    !withinThreshold(coords, points.location, points.bounds)
  ) {
    yield* fetchRootNode();
    return;
  }

  // Special Feature, check if within area points
  for (let area of points.areas) {
    if (withinThreshold(coords, area.coords, area.radius)) return;
  }

  yield* fetchRootNode();
}

function* watchLocationUpdates() {}

function* disableLocationTracking() {}

function* mainEventLoop() {
  yield* handleBackgroundEvents();
  yield* waitForFineLocation();
  yield* refreshRootNode();
  yield* watchLocationUpdates();
  yield* disableLocationTracking();
}

export default function* rootSaga() {
  yield fork(mainEventLoop);
}
