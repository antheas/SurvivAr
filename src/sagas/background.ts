import { call, put, select } from "redux-saga/effects";
import LocationManagerInterface from "../location/position/LocationInterface";
import { updateWaitPointProgress, WaitProgressUpdate } from "../store/actions";
import {
  selectBackgroundTrackingState,
  selectExtendedPoints
} from "../store/selectors";

export function* handleBackgroundEvents(manager: LocationManagerInterface) {
  yield call([manager, "disableBackgroundTracking"]);

  const updates: WaitProgressUpdate[] = yield call([
    manager,
    "loadBackgroundEvents"
  ]);

  yield put(updateWaitPointProgress(updates));
}

export function* startBackgroundService(manager: LocationManagerInterface) {
  const state = yield select(selectBackgroundTrackingState);
  if (!state) return;

  const points = yield select(selectExtendedPoints);
  yield call([manager, "enableBackgroundTracking"], points);
}
