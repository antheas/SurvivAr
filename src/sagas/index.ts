/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { all, take, put } from "redux-saga/effects";
import { UPDATE_POSITION, updateState } from "../store/actions";
import { FINE_LOCATION_THRESHOLD, StateType } from "../store/types";

function* handleBackgroundEvents() {}

function* waitForFineLocation() {
  yield put(updateState(StateType.WAITING_FOR_FINE_LOCATION));
  let accuracy;
  do {
    accuracy = yield take(UPDATE_POSITION).position.accuracy;
  } while (accuracy < FINE_LOCATION_THRESHOLD);
}

function* fetchRootNode() {
  yield put(updateState(StateType.RETRIEVING_DATA));
}

function* watchLocationUpdates() {}

function* disableLocationTracking() {}

function* mainEventLoop() {
  yield* handleBackgroundEvents();
  yield* waitForFineLocation();
  yield* fetchRootNode();
  yield* watchLocationUpdates();
  yield* disableLocationTracking();
}

export default function* rootSaga() {
  yield all([mainEventLoop]);
}
