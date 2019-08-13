import { put, select, take } from "redux-saga/effects";
import {
  updateCurrentWaitPointCache,
  updatePointMetadata,
  updateState,
  updateWaitPointProgress,
  UPDATE_POSITION,
  WaitProgressUpdate
} from "../store/actions";
import {
  selectCachedCurrentWaitPoints,
  selectCurrentWaitPoints,
  selectMultipleWaitPointProgress,
  selectPoints,
  selectPosition
} from "../store/selectors";
import {
  PointState,
  PositionState,
  StateType,
  WaitPointProgress
} from "../store/types";
import { getDistance, withinThreshold } from "./distance";

function* updateMetadata(pos: PositionState) {
  // Find current area
  const pointState: PointState = yield select(selectPoints);
  const currentArea = pointState.areas
    .sort(
      (a, b) => getDistance(pos.coords, a.loc) - getDistance(pos.coords, b.loc)
    )
    .find(a => withinThreshold(pos.coords, a.loc, a.radius));

  // If we are not in an area empty the state.
  if (!currentArea) {
    yield put(
      updatePointMetadata({
        distances: {}
      })
    );
    return;
  }

  const points = currentArea.children;

  const distanceArray = points.map(p => ({
    id: p.id,
    distance: getDistance(pos.coords, p.loc)
  }));

  const distances: Record<string, number> = {};
  for (const { id, distance } of distanceArray) {
    distances[id] = distance;
  }

  yield put(
    updatePointMetadata({
      currentAreaId: currentArea.id,
      distances
    })
  );
}

function* updateWaitProgress(pos: PositionState) {
  // Current Point Cache contains the points we pulled on the previous update
  // Whereas the current ones are calculated based on the current location
  const {
    ids: oldCurrentPoints,
    updated: pastTime
  }: ReturnType<typeof selectCachedCurrentWaitPoints> = yield select(
    selectCachedCurrentWaitPoints
  );

  const newCurrentPoints: ReturnType<
    typeof selectCurrentWaitPoints
  > = yield select(selectCurrentWaitPoints);
  const newTime = pos.updated;

  const addedTime = (newTime - pastTime) / 1000;

  // Calculate intersection
  const commonPoints = oldCurrentPoints.filter(
    id => newCurrentPoints.indexOf(id) !== -1
  );

  // Retrieve Current Progress
  const progress: WaitPointProgress[] = yield select(
    selectMultipleWaitPointProgress,
    commonPoints
  );

  // Add new progress
  const updatedProgress = progress.map(pr => ({
    elapsedTime: pr.elapsedTime + addedTime
  }));

  // Recombine ids with progress
  const progressUpdate: WaitProgressUpdate[] = [];
  for (let i = 0; i < commonPoints.length; i++) {
    progressUpdate[i] = {
      id: commonPoints[i],
      progress: updatedProgress[i]
    };
  }

  // Add checks to lower pushes to the store
  if (progressUpdate.length) yield put(updateWaitPointProgress(progressUpdate));

  // Update Cache
  if (oldCurrentPoints !== newCurrentPoints)
    yield put(updateCurrentWaitPointCache(newCurrentPoints, newTime));
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

export default function* watch() {
  yield* watchLocationUpdates();
}
