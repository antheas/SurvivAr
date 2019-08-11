// @ts-ignore
import LatLon from "geodesy/latlon-spherical";
import { Dispatch } from "redux";
import { call, cancel, fork, put, select, take } from "redux-saga/effects";
import LocationManager from "../location/LocationManager";
import {
  APP_EXITING,
  APP_LAUNCH_COMPLETED,
  BEGIN_FOREGROUND_FETCH,
  PositionAction,
  RETRY_FETCH,
  STOP_FOREGROUND_FETCH,
  updatePointMetadata,
  updatePoints,
  updatePosition,
  updateState,
  UPDATE_POSITION,
  ProgressUpdate,
  updateProgress,
  updateCurrentPointCache
} from "../store/actions";
import {
  selectCachedCurrentWaitPoints,
  selectCurrentWaitPoints,
  selectPoints,
  selectPosition,
  selectWaitPointProgress
} from "../store/selectors";
import {
  FINE_LOCATION_THRESHOLD,
  Location,
  PointState,
  POINT_DATA_STALE_AFTER_DAYS,
  PositionState,
  StateType,
  PointProgress
} from "../store/types";
import fetchPoints from "./pointApi";

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

function* handleBackgroundEvents() {
  // noop
  yield null;
}

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
    Date.now() - points.updated > POINT_DATA_STALE_AFTER_MS ||
    !withinThreshold(coords, points.location, points.bounds)
  ) {
    needsUpdate = true;
  }

  // Special Feature, check if within area points
  let notInAreaPoints = true;
  for (const area of points.areas) {
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
      yield put(updateState(StateType.LOADING_ERROR));
      yield take(RETRY_FETCH);
      yield put(updateState(StateType.RETRIEVING_DATA));
    }
  }
}

function* updateMetadata(pos: PositionState) {
  // Find current area and point
  const points: PointState = yield select(selectPoints);
  const currentArea = points.areas
    .sort((a, b) => distance(pos.coords, a.loc) - distance(pos.coords, b.loc))
    .find(a => withinThreshold(pos.coords, a.loc, a.radius));

  const sortedPoints = currentArea
    ? currentArea.children.sort(
        (a, b) => distance(pos.coords, a.loc) - distance(pos.coords, b.loc)
      )
    : [];

  const sortedPointState = sortedPoints.map(p => ({
    pointId: p.id,
    distance: distance(pos.coords, p.loc)
  }));

  yield put(
    updatePointMetadata({
      currentAreaId: currentArea && currentArea.id,
      sortedPoints: sortedPointState
    })
  );
}

function* updateWaitProgress(pos: PositionState) {
  // Current Point Cache contains the points we pulled on the previous update
  // Whereas the current ones are calculated based on the current location
  const {
    ids: currentPointCache,
    updated: previousTime
  }: { ids: string[]; updated: number } = yield select(
    selectCachedCurrentWaitPoints
  );

  const currentPoints: string[] = yield select(selectCurrentWaitPoints);
  const currentTime = pos.updated;

  const addedTime = (currentTime - previousTime) / 1000;

  // Calculate intersection
  const commonPoints = currentPoints.filter(
    id => currentPointCache.indexOf(id) !== -1
  );

  // Retrieve Current Progress
  const progressPoints: ProgressUpdate = yield select(
    selectWaitPointProgress,
    commonPoints
  );

  // Add new progress
  const updatedProgress = progressPoints.map(pp => ({
    id: pp.id,
    progress: {
      elapsedTime:
        (pp.progress.elapsedTime ? pp.progress.elapsedTime : 0) + addedTime
    }
  }));

  yield put(updateProgress(updatedProgress));

  // Update Cache
  yield put(updateCurrentPointCache(currentPoints, currentTime));
}

function* watchLocationUpdates() {
  yield put(updateState(StateType.TRACKING));

  let pos: PositionState = yield select(selectPosition);

  while (1) {
    yield* updateMetadata(pos);
    yield* updateWaitProgress(pos);

    ({ position: pos } = yield take(UPDATE_POSITION));
  }
}

function* mainEventLoop() {
  while (1) {
    yield* handleBackgroundEvents();
    yield* waitForFineLocation();
    yield* refreshRootNode();
    yield* watchLocationUpdates();
  }
}

function registerPositionUpdates(dispatch: Dispatch) {
  const manager = new LocationManager();
  manager.startJsCallbacks(p => dispatch(updatePosition(p)));
  return manager;
}

function unregisterPositionUpdates(manager: LocationManager) {
  manager.stopJsCallbacks();
}

export default function* rootSaga(dispatch: Dispatch) {
  yield take(APP_LAUNCH_COMPLETED);

  let action;
  do {
    const loopTask = yield fork(mainEventLoop);
    const manager = registerPositionUpdates(dispatch);

    action = yield take([STOP_FOREGROUND_FETCH, APP_EXITING]);
    yield cancel(loopTask);
    unregisterPositionUpdates(manager);
    if (action.type === APP_EXITING) break;

    action = yield take([BEGIN_FOREGROUND_FETCH, APP_EXITING]);
  } while (action.type === BEGIN_FOREGROUND_FETCH);
}
