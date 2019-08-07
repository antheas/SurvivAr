/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { fork, take, put, select, call, cancel } from "redux-saga/effects";
import {
  UPDATE_POSITION,
  updateState,
  PositionAction,
  updatePoints,
  RETRY_FETCH,
  BEGIN_FOREGROUND_FETCH,
  STOP_FOREGROUND_FETCH,
  updateCurrentAreas
} from "../store/actions";
import {
  FINE_LOCATION_THRESHOLD,
  StateType,
  PointState,
  POINT_DATA_STALE_AFTER_DAYS,
  Location,
  PositionState,
  AreaPoint
} from "../store/types";
import { selectPoints, selectPosition } from "../store/selectors";
import fetchPoints from "./pointApi.js";

import LatLon from "geodesy/latlon-spherical.js";

function toLatLon(l: Location): LatLon {
  return new LatLon(l.lat, l.lon);
}

function distance(start: Location, end: Location): number {
  return toLatLon(start).distanceTo(toLatLon(end));
}

function withinThreshold(
  start: Location,
  end: Location,
  threshold: number
): boolean {
  return distance(start, end) <= threshold;
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

// Check if root node needs to be refreshed and refresh it.
function* refreshRootNode() {
  yield put(updateState(StateType.RETRIEVING_DATA));

  const position: PositionState = yield select(selectPosition);
  const points: PointState = yield select(selectPoints);
  const coords = position.coords;

  // Check if valid / not stale
  let needsUpdate = false;
  if (
    !points.valid ||
    points.updated > POINT_DATA_STALE_AFTER_MS ||
    !withinThreshold(coords, points.location, points.bounds)
  ) {
    needsUpdate = true;
  }

  // Special Feature, check if within area points
  let notInAreaPoints = true;
  for (let area of points.areas) {
    if (withinThreshold(coords, area.loc, area.radius)) {
      notInAreaPoints = false;
    }
  }

  while (1) {
    try {
      let newPoints;
      if (needsUpdate) {
        newPoints = yield call(fetchPoints, coords);
      } else if (notInAreaPoints) {
        newPoints = yield call(fetchPoints, coords, points);
      }
      if (newPoints) {
        yield put(updatePoints(newPoints));
      }
      break;
    } catch (e) {
      console.log(e.toString());
      yield put(updateState(StateType.LOADING_ERROR));
      yield take(RETRY_FETCH);
      yield put(updateState(StateType.RETRIEVING_DATA));
    }
  }
}

function* watchLocationUpdates() {
  yield put(updateState(StateType.TRACKING));

  const points: PointState = yield select(selectPoints);
  while (1) {
    let { position: pos }: PositionAction = yield take(UPDATE_POSITION);

    let currentArea = points.areas
      .sort((a, b) => distance(pos.coords, a.loc) - distance(pos.coords, b.loc))
      .find(a => withinThreshold(pos.coords, a.loc, a.radius));

    let currentPoint = currentArea
      ? currentArea.children
          .sort(
            (a, b) => distance(pos.coords, a.loc) - distance(pos.coords, b.loc)
          )
          .find(p => withinThreshold(pos.coords, p.loc, p.radius))
      : undefined;

    yield put(
      updateCurrentAreas(
        currentArea ? currentArea.id : null,
        currentPoint ? currentPoint.id : null
      )
    );
  }
}

function* mainEventLoop() {
  yield* handleBackgroundEvents();
  yield* waitForFineLocation();
  yield* refreshRootNode();
  yield* watchLocationUpdates();
}

export default function* rootSaga() {
  while (yield take(BEGIN_FOREGROUND_FETCH)) {
    const loopTask = yield fork(mainEventLoop);

    // TODO: Handle exiting gracefully
    yield take(STOP_FOREGROUND_FETCH);
    yield cancel(loopTask);
  }
}
