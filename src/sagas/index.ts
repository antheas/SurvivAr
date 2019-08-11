// @ts-ignore
import { Dispatch } from "redux";
import { cancel, fork, take } from "redux-saga/effects";
import LocationManager from "../location/LocationManager";
import {
  APP_EXITING,
  APP_LAUNCH_COMPLETED,
  BEGIN_FOREGROUND_FETCH,
  STOP_FOREGROUND_FETCH,
  updatePosition
} from "../store/actions";
import init from "./init";
import watch from "./watch";

function* mainEventLoop() {
  while (1) {
    yield* init();
    yield* watch();
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
