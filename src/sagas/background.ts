import { call, put, select } from "redux-saga/effects";
import LocationManagerInterface from "../location/position/LocationInterface";
import { stashBackgroundProgress, WaitProgressUpdate } from "../store/actions";
import { ExtendedPoint } from "../store/model/ExtendedPoint";
import {
  selectBackgroundTrackingState,
  selectExtendedPoints
} from "../store/selectors";

export function* handleBackgroundEvents(manager: LocationManagerInterface) {
  const updates: WaitProgressUpdate[] = yield call([
    manager,
    "stopAndRetrieveProgress"
  ]);

  if (updates.length) yield put(stashBackgroundProgress(updates));
}

export function* startBackgroundService(manager: LocationManagerInterface) {
  const state = yield select(selectBackgroundTrackingState);
  if (!state) return;

  const points: ExtendedPoint[] = yield select(selectExtendedPoints);
  const pending = points.filter(p => !p.completed);
  yield call([manager, "enableBackgroundTracking"], pending);
}
