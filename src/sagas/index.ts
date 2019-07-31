/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { all } from "redux-saga/effects";

function* handleBackgroundEvents() {}

function* enableLocationTracking() {}

function* waitForFineLocation() {}

function* fetchRootNode() {}

function* watchLocationUpdates() {}

function* disableLocationTracking() {}

function* mainEventLoop() {
  yield* handleBackgroundEvents();
  yield* enableLocationTracking();
  yield* waitForFineLocation();
  yield* fetchRootNode();
  yield* watchLocationUpdates();
  yield* disableLocationTracking();
}

export default function* rootSaga() {
  yield all([mainEventLoop]);
}
