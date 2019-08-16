import { call, put, select } from "redux-saga/effects";
import LocationManagerInterface from "../location/position/LocationInterface";
import { updateWaitPointProgress, WaitProgressUpdate } from "../store/actions";
import {
  selectBackgroundTrackingState,
  selectExtendedPoints
} from "../store/selectors";
import { ExtendedPoint } from "../store/model/ExtendedPoint";

export function* handleBackgroundEvents(manager: LocationManagerInterface) {
  const updates: WaitProgressUpdate[] = yield call([
    manager,
    "stopAndRetrieveProgress"
  ]);

  if (updates.length) yield put(updateWaitPointProgress(updates));
}

export function* startBackgroundService(manager: LocationManagerInterface) {
  const state = yield select(selectBackgroundTrackingState);
  if (!state) return;

  const points: ExtendedPoint[] = yield select(selectExtendedPoints);
  const pending = points.filter(p => !p.completed);
  yield call([manager, "enableBackgroundTracking"], pending);
}
