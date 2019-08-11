import { call, put, select, take } from "redux-saga/effects";
import {
  updateState,
  UPDATE_POSITION,
  PositionAction,
  updatePoints,
  RETRY_FETCH
} from "../store/actions";
import {
  StateType,
  FINE_LOCATION_THRESHOLD,
  POINT_DATA_STALE_AFTER_DAYS,
  PositionState,
  PointState
} from "../store/types";
import { selectPosition, selectPoints } from "../store/selectors";
import { withinThreshold } from "./distance";
import fetchPoints from "./pointApi";

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

export default function* init() {
  yield* handleBackgroundEvents();
  yield* waitForFineLocation();
  yield* refreshRootNode();
}
