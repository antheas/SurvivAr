import { put, select, take } from "redux-saga/effects";
import {
  addCompletedPoints,
  stashBackgroundProgress,
  updateCurrentWaitPointCache,
  updatePointMetadata,
  updateState,
  updateWaitPointProgress,
  UPDATE_POSITION,
  WaitProgressUpdate
} from "../store/actions";
import { ExtendedPoint } from "../store/model/ExtendedPoint";
import { ExtendedWaitPoint } from "../store/model/ExtendedWaitPoint";
import {
  selectCachedCurrentWaitPoints,
  selectCurrentArea,
  selectCurrentPoints,
  selectCurrentWaitPoints,
  selectExtendedPoints,
  selectMultipleWaitPointProgress,
  selectPoints,
  selectPosition,
  selectStashedBackgroundProgress
} from "../store/selectors";
import {
  isWaitPoint,
  Point,
  PointState,
  PositionState,
  StateType,
  WaitPointProgress
} from "../store/types";
import { getDistance, withinThreshold } from "./distance";
import { EventType, handlePointEvent } from "./events";

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

function* processBackgroundProgress() {
  // This will only run once, when the app wakes from the background
  const updates: WaitProgressUpdate[] = yield select(
    selectStashedBackgroundProgress
  );
  if (!updates.length) return;

  yield put(stashBackgroundProgress([]));

  if (!updates.length) return;

  const points: ExtendedPoint[] = yield select(
    selectExtendedPoints,
    updates.map(u => u.id)
  );

  const newlyCompleted = updates
    // Pair update with point
    .map(u => ({
      point: points.find(p => p.id === u.id),
      progress: u.progress
    }))
    // The point should exist, not be completed, be a wait point and have a new time that completes it.
    .filter(
      c =>
        c.point &&
        !c.point.completed &&
        c.point instanceof ExtendedWaitPoint &&
        c.progress.elapsedTime >= c.point.duration
    )
    // Get ids (cast is because linter thins point can be undefined)
    .map(u => (u.point as ExtendedPoint).id);

  yield put(addCompletedPoints(newlyCompleted));
  yield put(updateWaitPointProgress(updates));
}

function* calculateEventsAndCompletions(
  pastPointIds: string[],
  currentPointIds: string[],
  updates: WaitProgressUpdate[]
) {
  const points: Point[] = yield select(selectCurrentPoints);
  const waitPoints = points.filter(isWaitPoint);

  // Start with calculating if a point is completed
  const completedPoints = updates
    .map(u => ({
      id: u.id,
      point: waitPoints.find(p => p.id === u.id),
      newDuration: u.progress.elapsedTime
    }))
    .filter(u => u.point && u.newDuration >= u.point.duration)
    .map(u => u.id);

  // OnComplete takes precedence
  if (completedPoints.length) {
    yield put(addCompletedPoints(completedPoints));
    handlePointEvent(EventType.ON_COMPLETE);
    return;
  }

  // On enter
  // Find if there is a point on current that isn't on past
  const onEnter = currentPointIds.find(
    i1 => pastPointIds.findIndex(i2 => i1 === i2) === -1
  );

  if (onEnter) {
    handlePointEvent(EventType.ON_ENTER);
    return;
  }

  const exitedPoints = pastPointIds.filter(
    i1 => currentPointIds.findIndex(i2 => i1 === i2) === -1
  );

  if (exitedPoints.length) {
    // If, and only if, there are exited points check to make sure it's
    // not because we finished it.
    const extended: ExtendedPoint[] = yield select(
      selectExtendedPoints,
      exitedPoints
    );
    const onExit = extended.findIndex(p => !p.completed) !== -1;

    if (onExit) {
      handlePointEvent(EventType.ON_EXIT);
      return;
    }
  }
}

function* updateWaitProgress(pos: PositionState) {
  // Current Point Cache contains the points we pulled on the previous update
  // Whereas the current ones are calculated based on the current location
  const {
    ids: oldCurrentPoints,
    updated: pastTime
  }: { ids: string[]; updated: number } = yield select(
    selectCachedCurrentWaitPoints
  );

  const newCurrentPoints: string[] = yield select(selectCurrentWaitPoints);
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

  // Handle Events
  yield* calculateEventsAndCompletions(
    oldCurrentPoints,
    newCurrentPoints,
    progressUpdate
  );

  // Process the updates to set the notification
  if (progressUpdate.length) yield put(updateWaitPointProgress(progressUpdate));

  // Update Cache
  yield put(updateCurrentWaitPointCache(newCurrentPoints, newTime));
}

function* watchLocationUpdates() {
  yield put(updateState(StateType.TRACKING));

  let pos: PositionState = yield select(selectPosition);

  // Flush wait point cache in case we woke up with previous state.
  yield put(updateCurrentWaitPointCache([], 0));

  while (1) {
    yield* updateMetadata(pos);
    yield* processBackgroundProgress();
    yield* updateWaitProgress(pos);

    ({ position: pos } = yield take(UPDATE_POSITION));

    // Check area from previous update and if it is undefined
    // break to restart the loop
    const currArea = yield select(selectCurrentArea);
    if (!currArea) break;
  }
}

export default function* watch() {
  yield* watchLocationUpdates();
}
