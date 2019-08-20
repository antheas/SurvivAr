import { call, put, select } from "redux-saga/effects";
import LocationManagerInterface from "../location/position/LocationInterface";
import {
  addCompletedPoints,
  updateWaitPointProgress,
  WaitProgressUpdate
} from "../store/actions";
import { ExtendedPoint } from "../store/model/ExtendedPoint";
import {
  selectBackgroundTrackingState,
  selectExtendedPoints,
  selectPoints
} from "../store/selectors";
import { Point, isWaitPoint } from "../store/types";

export function* handleBackgroundEvents(manager: LocationManagerInterface) {
  const updates: WaitProgressUpdate[] = yield call([
    manager,
    "stopAndRetrieveProgress"
  ]);

  if (!updates.length) return;
  yield put(updateWaitPointProgress(updates));

  const points: Record<string, Point> = yield select(selectPoints);

  const newlyCompleted = updates
    // Find wait points whose elapsedTime now exceeds duration
    .filter(u => {
      const p = points[u.id];
      if (!p || !isWaitPoint(p)) return false;
      return u.progress.elapsedTime >= p.duration;
    })
    .map(u => u.id);

  if (!newlyCompleted.length) return;
  yield put(addCompletedPoints(newlyCompleted));
}

export function* startBackgroundService(manager: LocationManagerInterface) {
  const state = yield select(selectBackgroundTrackingState);
  if (!state) return;

  const points: ExtendedPoint[] = yield select(selectExtendedPoints);
  const pending = points.filter(p => !p.completed);
  yield call([manager, "enableBackgroundTracking"], pending);
}
