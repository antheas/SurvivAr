// @ts-ignore
import { Dispatch } from "redux";
import { cancel, fork, take } from "redux-saga/effects";
import LocationManager from "../location/LocationManager";
import {
  APP_EXITING,
  APP_LAUNCH_COMPLETED,
  BEGIN_FOREGROUND_FETCH,
  STOP_FOREGROUND_FETCH,
  updatePosition,
  updateHeading
} from "../store/actions";
import init from "./init";
import watch from "./watch";
import LocationManagerInterface from "../location/LocationInterface";

function* mainEventLoop() {
  while (1) {
    yield* init();
    yield* watch();
  }
}

function registerPositionUpdates(
  manager: LocationManagerInterface,
  dispatch: Dispatch
) {
  manager.registerJsCallbacks(
    p => dispatch(updatePosition(p)),
    p => dispatch(updateHeading(p))
  );
}

const BEGIN_ACTIONS = [BEGIN_FOREGROUND_FETCH, APP_EXITING];
const STOP_ACTIONS = [STOP_FOREGROUND_FETCH, APP_EXITING];

export default function* rootSaga(dispatch: Dispatch) {
  yield take(APP_LAUNCH_COMPLETED);
  // Setup callbacks
  const manager: LocationManagerInterface = new LocationManager();
  registerPositionUpdates(manager, dispatch);

  while ((yield take(BEGIN_ACTIONS)).type !== APP_EXITING) {
    // Start
    manager.startJsCallbacks();
    const loopTask = yield fork(mainEventLoop);

    const action = yield take(STOP_ACTIONS);

    // Stop
    yield cancel(loopTask);
    manager.stopJsCallbacks();

    if (action.type === APP_EXITING) break;
  }

  manager.unregisterJsCallbacks();
}
